import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../index';
import { config } from '../config';
import { validate } from '../middleware/validate';
import { BadRequestError, AppError } from '../middleware/errorHandler';
import { generateBookingRef } from '../utils/tokens';
import { logger } from '../utils/logger';

const router = Router();

const cashfreeHeaders = () => ({
  'x-api-version': '2023-08-01',
  'x-client-id': config.CASHFREE_APP_ID,
  'x-client-secret': config.CASHFREE_SECRET_KEY,
  'Content-Type': 'application/json',
});

const sanitizeEmail = (email?: string | null): string => {
  if (!email || !email.includes('@')) return 'admin@example.com';
  const parts = email.split('@');
  const domain = parts[1];
  if (!domain || !domain.includes('.')) {
    return `${email}.com`;
  }
  return email;
};

const sanitizePhone = (phone?: string | null): string => {
  if (!phone) return '9999999999';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return '9999999999';
};

const createOrderSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(['CASHFREE', 'WALLET']).default('CASHFREE'),
});

router.post('/create-order', validate(createOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true, service: true },
    });

    if (!booking) throw new BadRequestError('Booking not found');
    if (booking.userId !== req.user!.userId) throw new BadRequestError('Unauthorized');

    const existingPayment = booking.payments.find(p => p.status === 'PENDING' || p.status === 'SUCCESS');
    if (existingPayment?.status === 'SUCCESS') throw new BadRequestError('Booking already paid');

    if (paymentMethod === 'WALLET') {
      const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } });
      if (!wallet || wallet.balance < booking.finalAmount) {
        throw new BadRequestError('Insufficient wallet balance');
      }

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: req.user!.userId },
          data: { balance: { decrement: booking.finalAmount } },
        }),
        prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEBIT',
            amount: booking.finalAmount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - booking.finalAmount,
            description: `Payment for booking ${booking.bookingRef}`,
            referenceId: booking.id,
          },
        }),
        prisma.payment.create({
          data: {
            bookingId: booking.id,
            userId: req.user!.userId,
            amount: booking.finalAmount,
            status: 'SUCCESS',
            method: 'WALLET',
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED', qrCode: crypto.randomUUID() },
        }),
      ]);

      sendConfirmationNotifications(booking.id, req.app.get('io')).catch(err => {
        logger.error('Failed to send confirmations:', err);
      });

      res.json({
        success: true,
        message: 'Payment successful via wallet',
        data: { bookingId: booking.id, status: 'CONFIRMED' },
      });
      return;
    }

    const orderId = `ARV_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const orderData = {
      order_id: orderId,
      order_amount: booking.finalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user!.userId,
        customer_email: sanitizeEmail(booking.contactEmail || req.user!.email),
        customer_name: req.user!.name,
        customer_phone: sanitizePhone(booking.contactPhone),
      },
      order_meta: {
        return_url: `${config.FRONTEND_URL}/payments/status?order_id={order_id}`,
        notify_url: `${config.API_URL}/api/payments/webhook`,
      },
      order_tags: {
        booking_id: booking.id,
        booking_ref: booking.bookingRef,
      },
    };

    const response = await fetch(`${config.CASHFREE_API_URL}/orders`, {
      method: 'POST',
      headers: cashfreeHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Cashfree order creation failed:', errorData);
      let message = 'Payment gateway error';
      try {
        const parsed = JSON.parse(errorData);
        message = parsed.message || parsed.error || message;
      } catch {}
      throw new AppError(502, message);
    }

    const cashfreeOrder = await response.json() as any;

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: req.user!.userId,
        amount: booking.finalAmount,
        status: 'PENDING',
        method: 'CASHFREE',
        cashfreeOrderId: orderId,
        gatewayResponse: cashfreeOrder,
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'PENDING' },
    });

    res.json({
      success: true,
      data: {
        paymentSessionId: cashfreeOrder.payment_session_id,
        orderId,
        amount: booking.finalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { cashfreeOrderId: orderId },
    });

    if (!payment) throw new BadRequestError('Payment not found');

    if (payment.status === 'SUCCESS') {
      res.json({ success: true, status: 'SUCCESS', bookingId: payment.bookingId });
      return;
    }

    let cashfreeStatus = 'PENDING';
    try {
      const response = await fetch(`${config.CASHFREE_API_URL}/orders/${orderId}/payments`, {
        headers: cashfreeHeaders(),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const payments = await response.json() as any;
        cashfreeStatus = payments[0]?.payment_status || 'PENDING';

        if (cashfreeStatus === 'SUCCESS') {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'SUCCESS',
                cashfreePaymentId: payments[0]?.payment_id,
                cashfreeSignature: payments[0]?.payment_signature,
              },
            }),
            prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: 'CONFIRMED', qrCode: crypto.randomUUID() },
            }),
          ]);

          sendConfirmationNotifications(payment.bookingId, req.app.get('io')).catch(err => {
            logger.error('Failed to send confirmations:', err);
          });

          res.json({ success: true, status: 'SUCCESS', bookingId: payment.bookingId });
          return;
        }
      }
    } catch (fetchErr) {
      logger.warn('Cashfree verify fetch failed, using DB status:', fetchErr);
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: cashfreeStatus === 'FAILED' ? 'FAILED' : 'PENDING', gatewayResponse: cashfreeStatus },
    });

    res.json({ success: cashfreeStatus === 'SUCCESS', status: cashfreeStatus, message: cashfreeStatus === 'FAILED' ? 'Payment failed' : 'Payment pending', bookingId: payment.bookingId });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', config.CASHFREE_SECRET_KEY)
      .update(payload + timestamp)
      .digest('hex');

    if (signature !== expectedSignature && config.NODE_ENV === 'production') {
      logger.warn('Invalid webhook signature');
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }

    const { order_id, order_status, payment_id, payment_status } = req.body.data || req.body;

    if (payment_status === 'SUCCESS' || order_status === 'PAID') {
      const payment = await prisma.payment.findUnique({
        where: { cashfreeOrderId: order_id },
      });

      if (payment && payment.status !== 'SUCCESS') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'SUCCESS',
              cashfreePaymentId: payment_id,
              gatewayResponse: req.body,
            },
          }),
          prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'CONFIRMED', qrCode: crypto.randomUUID() },
          }),
        ]);

        sendConfirmationNotifications(payment.bookingId, req.app.get('io')).catch(err => {
          logger.error('Failed to send confirmations:', err);
        });
      }
    }

    res.json({ message: 'Webhook received' });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.json({ message: 'Webhook received' });
  }
});

router.post('/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) throw new BadRequestError('Booking not found');
    if (booking.status === 'CANCELLED') throw new BadRequestError('Booking already cancelled');
    if (booking.userId !== req.user!.userId) throw new BadRequestError('Unauthorized');

    const payment = booking.payments.find(p => p.status === 'SUCCESS');
    const refundAmount = payment ? payment.amount : booking.finalAmount;
    const refundId = `RFND_${Date.now()}`;

    // Extract seat numbers to release
    const seatNumbers = (booking.passengers as any[] || [])
      .map(p => p.seatNumber)
      .filter(Boolean);

    // Call Cashfree if production and payment method is Cashfree
    let cashfreeSuccess = false;
    if (config.NODE_ENV === 'production' && payment && payment.method === 'CASHFREE') {
      try {
        const response = await fetch(`${config.CASHFREE_API_URL}/orders/${payment.cashfreeOrderId}/refunds`, {
          method: 'POST',
          headers: cashfreeHeaders(),
          body: JSON.stringify({
            refund_id: refundId,
            order_id: payment.cashfreeOrderId,
            refund_amount: refundAmount,
            refund_reason: reason || 'Customer requested cancellation',
          }),
        });
        if (response.ok) {
          cashfreeSuccess = true;
        } else {
          const errorText = await response.text();
          logger.error('Cashfree refund failed:', errorText);
        }
      } catch (err) {
        logger.error('Cashfree refund exception:', err);
      }
    }

    // Perform database updates: Upsert wallet balance
    const wallet = await prisma.wallet.upsert({
      where: { userId: req.user!.userId },
      update: { balance: { increment: refundAmount } },
      create: { userId: req.user!.userId, balance: refundAmount },
    });

    // Load wallet again to get precise balances
    const updatedWallet = await prisma.wallet.findUnique({ where: { id: wallet.id } });
    const balanceAfter = updatedWallet ? updatedWallet.balance : refundAmount;
    const balanceBefore = balanceAfter - refundAmount;

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
      }),
      ...(payment
        ? [
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'REFUNDED', refundAmount, refundId, refundReason: reason },
            }),
          ]
        : []),
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: refundAmount,
          balanceBefore,
          balanceAfter,
          description: `Refund for booking cancellation (Ref: ${booking.bookingRef})`,
          referenceId: booking.id,
          status: 'COMPLETED',
        },
      }),
      ...(booking.scheduleId && seatNumbers.length > 0
        ? [
            prisma.seat.updateMany({
              where: {
                scheduleId: booking.scheduleId,
                seatNumber: { in: seatNumbers },
              },
              data: { status: 'AVAILABLE' },
            }),
          ]
        : []),
    ]);

    // Delete schedules cache to refresh seat maps
    if (booking.scheduleId) {
      const { cacheDel } = require('../utils/redis');
      await cacheDel(`schedules:${booking.scheduleId}:seats`);
    }

    res.json({ success: true, message: 'Booking cancelled and refund processed to wallet' });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: req.user!.userId },
        include: { booking: { select: { bookingRef: true, service: { select: { title: true, category: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where: { userId: req.user!.userId } }),
    ]);

    res.json({
      payments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

async function sendConfirmationNotifications(bookingId: string, io: any) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
        schedule: true
      }
    });
    if (!booking) return;

    const user = booking.user;
    const serviceName = booking.service.title;
    const date = booking.schedule?.departureTime ? booking.schedule.departureTime.toLocaleDateString() : booking.createdAt.toLocaleDateString();

    try {
      const { sendBookingConfirmation } = require('../utils/email');
      await sendBookingConfirmation(user.email, booking.bookingRef, {
        serviceName,
        date,
        amount: booking.finalAmount
      });
    } catch (err) {
      logger.error('Failed to send email confirmation:', err);
    }

    let notification;
    try {
      notification = await prisma.notification.create({
        data: {
          userId: user.id,
          channel: 'IN_APP',
          title: 'Booking Confirmed!',
          body: `Your booking for ${serviceName} (Ref: ${booking.bookingRef}) has been successfully confirmed.`,
          data: JSON.stringify({ bookingId: booking.id, bookingRef: booking.bookingRef })
        }
      });
    } catch (err) {
      logger.error('Failed to create in-app notification:', err);
    }

    logger.info(`[SMS/WhatsApp Simulation] To: ${booking.contactPhone || user.phone || '9999999999'}. Message: Your booking for ${serviceName} (Ref: ${booking.bookingRef}) is CONFIRMED. Show QR at boarding.`);
    logger.info(`[Push Notification Simulation] To user ${user.id}: Booking ${booking.bookingRef} confirmed.`);

    if (io) {
      io.to(`user:${user.id}`).emit('booking:updated', {
        bookingId: booking.id,
        status: 'CONFIRMED',
        timestamp: new Date()
      });
      if (notification) {
        io.to(`user:${user.id}`).emit('notification:new', {
          notification,
          timestamp: new Date()
        });
      }
    }
  } catch (error) {
    logger.error('Error in sendConfirmationNotifications helper:', error);
  }
}

export default router;
