import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../index';
import { validate } from '../middleware/validate';
import { authorize } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { generateBookingRef } from '../utils/tokens';
import { cacheSet, cacheGet, cacheDel, acquireLock, releaseLock } from '../utils/redis';
import { sendBookingConfirmation } from '../utils/email';
import { logger } from '../utils/logger';

const router = Router();

const createBookingSchema = z.object({
  serviceId: z.string(),
  scheduleId: z.string().optional(),
  seatIds: z.array(z.string()).optional(),
  passengers: z.array(z.object({
    name: z.string().min(1),
    age: z.number().int().min(1).optional(),
    gender: z.string().optional(),
    seatNumber: z.string().optional(),
    idType: z.string().optional(),
    idNumber: z.string().optional(),
  })).optional(),
  contactEmail: z.string().optional().refine(val => !val || val.includes('@'), {
    message: 'Invalid email address',
  }),
  contactPhone: z.string().optional(),
  specialRequests: z.string().optional(),
  couponCode: z.string().optional(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  rooms: z.any().optional(),
});

router.post('/', validate(createBookingSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId, scheduleId, seatIds, passengers, couponCode, ...rest } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { vendor: true },
    });

    if (!service || !service.isActive) throw new NotFoundError('Service');
    if (service.vendorId === req.user!.userId) throw new BadRequestError('Cannot book your own service');

    let schedule = null;
    if (scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { seats: true },
      });
      if (!schedule || !schedule.isActive) throw new NotFoundError('Schedule');
    }

    if (seatIds && seatIds.length > 0 && schedule) {
      for (const seatId of seatIds) {
        const lockKey = `lock:seat:${seatId}`;
        const acquired = await acquireLock(lockKey, 15);
        if (!acquired) throw new BadRequestError('Some seats are being booked by another user');

        const seat = await prisma.seat.findUnique({ where: { id: seatId } });
        if (!seat || seat.status !== 'AVAILABLE') {
          await releaseLock(lockKey);
          throw new BadRequestError(`Seat ${seat?.seatNumber || seatId} is not available`);
        }
      }

      await prisma.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'LOCKED' },
      });

      for (const seatId of seatIds) {
        await prisma.seatLock.create({
          data: {
            seatId,
            userId: req.user!.userId,
            sessionId: req.user!.sessionId,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          },
        });
      }
    }

    let discountAmount = 0;
    let couponUsed = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon || !coupon.isActive) throw new BadRequestError('Invalid coupon');
      if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) throw new BadRequestError('Coupon expired');
      if (coupon.usedCount >= coupon.maxUses) throw new BadRequestError('Coupon usage limit reached');

      const userCouponUsage = await prisma.booking.count({
        where: { userId: req.user!.userId, service: { coupons: { some: { couponId: coupon.id } } } },
      });

      if (coupon.perUserLimit && userCouponUsage >= coupon.perUserLimit) {
        throw new BadRequestError('Coupon already used');
      }

      const passengerCount = passengers?.length || 1;
      const qty = seatIds && seatIds.length > 0 ? seatIds.length : passengerCount;
      const itemPrice = schedule?.basePrice || service.basePrice;
      const baseAmount = itemPrice * qty;

      if (coupon.minOrderAmount && baseAmount < coupon.minOrderAmount) {
        throw new BadRequestError(`Minimum order amount ₹${coupon.minOrderAmount} required`);
      }

      discountAmount = coupon.discountType === 'PERCENTAGE'
        ? Math.min(baseAmount * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
        : Math.min(coupon.discountValue, coupon.maxDiscount || Infinity);

      // Increment coupon usage
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const passengerCount = passengers?.length || 1;
    const qty = seatIds && seatIds.length > 0 ? seatIds.length : passengerCount;
    const itemPrice = schedule?.basePrice || service.basePrice;
    const totalAmount = itemPrice * qty;
    const taxAmount = (totalAmount - discountAmount) * (service.taxPercent / 100);
    const finalAmount = totalAmount - discountAmount + taxAmount;

    const bookingRef = generateBookingRef();

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: req.user!.userId,
        serviceId,
        scheduleId,
        status: 'PENDING',
        totalAmount,
        discountAmount,
        taxAmount,
        finalAmount,
        passengers: passengers || [],
        ...rest,
      },
      include: { service: { select: { title: true, category: true } } },
    });

    for (const seatId of seatIds || []) {
      await releaseLock(`lock:seat:${seatId}`);
    }

    await cacheDel(`schedules:${scheduleId}:seats`);

    const io = req.app.get('io');
    if (io && seatIds && scheduleId) {
      io.to(`schedule:${scheduleId}`).emit('seats:updated', {
        seatIds,
        status: 'LOCKED',
        timestamp: new Date(),
      });
    }

    logger.info(`Booking created: ${bookingRef} by user ${req.user!.userId}`);

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const where: any = { userId: req.user!.userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          service: { select: { id: true, title: true, category: true, images: true } },
          payments: { select: { amount: true, status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/coupon/validate/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const { serviceId, amount } = req.query;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        services: true,
      }
    });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ valid: false, message: 'Coupon is inactive' });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ valid: false, message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
    }

    const userCouponUsage = await prisma.booking.count({
      where: { userId: req.user!.userId, service: { coupons: { some: { couponId: coupon.id } } } },
    });

    if (coupon.perUserLimit && userCouponUsage >= coupon.perUserLimit) {
      return res.status(400).json({ valid: false, message: 'Coupon already used by you' });
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId as string },
      });
      if (service) {
        if (coupon.category && service.category !== coupon.category) {
          return res.status(400).json({ valid: false, message: `Coupon only valid for ${coupon.category} bookings` });
        }
        if (coupon.services.length > 0) {
          const isLinked = coupon.services.some(cs => cs.serviceId === serviceId);
          if (!isLinked) {
            return res.status(400).json({ valid: false, message: 'Coupon not valid for this service' });
          }
        }
      }
    }

    if (amount && coupon.minOrderAmount) {
      const orderAmount = parseFloat(amount as string);
      if (orderAmount < coupon.minOrderAmount) {
        return res.status(400).json({ valid: false, message: `Minimum booking amount of ₹${coupon.minOrderAmount} required` });
      }
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderAmount: coupon.minOrderAmount,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: {
        service: { include: { vendor: true } },
        schedule: { include: { route: true } },
        payments: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking');
    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: {
        payments: true,
        schedule: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking');
    if (booking.status === 'CANCELLED') throw new BadRequestError('Already cancelled');
    if (booking.status === 'COMPLETED') throw new BadRequestError('Cannot cancel completed booking');

    const payment = booking.payments.find(p => p.status === 'SUCCESS');
    const refundAmount = payment ? payment.amount : booking.finalAmount;
    const refundId = `RFND_${Date.now()}`;

    // Extract seat numbers to release
    const seatNumbers = (booking.passengers as any[] || [])
      .map(p => p.seatNumber)
      .filter(Boolean);

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

    const cancellationDeadline = new Date(booking.createdAt);
    cancellationDeadline.setHours(cancellationDeadline.getHours() + 1);
    const isWithinFreeCancellation = new Date() < cancellationDeadline;

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
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

    res.json({ message: 'Booking cancelled successfully', isFreeCancellation: isWithinFreeCancellation });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/ticket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: {
        service: { select: { title: true, category: true } },
        schedule: { include: { route: true } },
        payments: { where: { status: 'SUCCESS' } },
      },
    });

    if (!booking) throw new NotFoundError('Booking');
    if (booking.status !== 'CONFIRMED') throw new BadRequestError('Booking not confirmed');

    res.json({ ticket: booking });
  } catch (error) {
    next(error);
  }
});

export default router;
