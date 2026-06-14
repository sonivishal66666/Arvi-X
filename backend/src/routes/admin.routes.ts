import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { authorize } from '../middleware/auth';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { cacheDelPattern } from '../utils/redis';

const router = Router();

router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers, totalVendors, totalBookings, totalRevenue,
      activeUsers, pendingVendors, recentBookings,
      bookingsByCategory,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.vendor.count({ where: { isVerified: false } }),
      prisma.booking.findMany({
        include: { user: { select: { name: true, email: true } }, service: { select: { title: true, category: true } } },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
      prisma.service.groupBy({ by: ['category'], _count: true }),
    ]);

    const categoryData = bookingsByCategory.map((b: any) => ({
      category: b.category,
      count: b._count,
    }));

    res.json({
      stats: {
        totalUsers, totalVendors, totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeUsers, pendingVendors,
      },
      recentBookings,
      revenueByMonth: [],
      bookingsByCategory: categoryData,
      userGrowth: [],
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (role) where.role = role.toUpperCase();

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          isActive: true, isVerified: true, createdAt: true, lastLoginAt: true,
          profile: { select: { city: true, country: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
    res.json({ message: 'User status updated', user });
  } catch (error) {
    next(error);
  }
});

router.get('/vendors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const verified = req.query.verified as string;

    const where: any = {};
    if (verified !== undefined) where.isVerified = verified === 'true';

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          _count: { select: { services: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vendor.count({ where }),
    ]);

    res.json({ vendors, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.patch('/vendors/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.update({
      where: { id: req.params.id },
      data: { isVerified: true },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json({ message: 'Vendor verified successfully', vendor });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { title: true, category: true, vendor: { select: { businessName: true } } } },
          payments: { select: { amount: true, status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ bookings, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        service: {
          include: {
            vendor: { select: { businessName: true } }
          }
        },
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

router.patch('/bookings/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { title: true } },
        payments: true,
        schedule: true,
      },
    });

    if (!booking) throw new NotFoundError('Booking');
    if (booking.status === 'CANCELLED') throw new BadRequestError('Booking already cancelled');

    const payment = booking.payments.find(p => p.status === 'SUCCESS');
    const refundAmount = payment ? payment.amount : booking.finalAmount;
    const refundId = `RFND_${Date.now()}`;

    // Extract seat numbers to release
    const seatNumbers = (booking.passengers as any[] || [])
      .map(p => p.seatNumber)
      .filter(Boolean);

    // Perform database updates: Upsert wallet balance
    const wallet = await prisma.wallet.upsert({
      where: { userId: booking.userId },
      update: { balance: { increment: refundAmount } },
      create: { userId: booking.userId, balance: refundAmount },
    });

    // Load wallet again to get precise balances
    const updatedWallet = await prisma.wallet.findUnique({ where: { id: wallet.id } });
    const balanceAfter = updatedWallet ? updatedWallet.balance : refundAmount;
    const balanceBefore = balanceAfter - refundAmount;

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason || 'Cancelled by Admin',
          cancelledAt: new Date(),
        },
      }),
      ...(payment
        ? [
            prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'REFUNDED', refundAmount, refundId, refundReason: reason || 'Cancelled by Admin' },
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
          description: `Refund for booking ${booking.bookingRef} (Cancelled by Admin)`,
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

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: booking.userId,
        channel: 'IN_APP',
        title: 'Booking Cancelled by Admin',
        body: `Your booking for ${booking.service.title} (Ref: ${booking.bookingRef}) has been cancelled by Admin. Refund of ₹${refundAmount} credited to wallet.`,
        data: JSON.stringify({ bookingId: booking.id, bookingRef: booking.bookingRef }),
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.userId}`).emit('booking:updated', {
        bookingId: booking.id,
        status: 'CANCELLED',
        timestamp: new Date(),
      });
      io.to(`user:${booking.userId}`).emit('notification:new', {
        notification,
        timestamp: new Date(),
      });
    }

    res.json({ message: 'Booking cancelled and refunded successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || '30d';
    const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [payments, bookingStatusList, topServices] = await Promise.all([
      prisma.payment.findMany({
        where: { status: 'SUCCESS', createdAt: { gte: startDate } },
        select: { amount: true, createdAt: true, booking: { select: { service: { select: { category: true } } } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.booking.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
      prisma.service.findMany({
        where: { bookings: { some: { createdAt: { gte: startDate } } } },
        orderBy: { bookings: { _count: 'desc' } },
        take: 10,
        select: { id: true, title: true, category: true, basePrice: true, _count: { select: { bookings: true } } },
      }),
    ]);

    const dailyMap: Record<string, { revenue: number; transactions: number }> = {};
    const categoryMap: Record<string, { revenue: number; bookings: number }> = {};

    for (const p of payments) {
      const date = p.createdAt.toISOString().split('T')[0];
      dailyMap[date] = dailyMap[date] || { revenue: 0, transactions: 0 };
      dailyMap[date].revenue += p.amount;
      dailyMap[date].transactions += 1;

      const cat = p.booking?.service?.category || 'OTHER';
      categoryMap[cat] = categoryMap[cat] || { revenue: 0, bookings: 0 };
      categoryMap[cat].revenue += p.amount;
      categoryMap[cat].bookings += 1;
    }

    const dailyRevenue = Object.entries(dailyMap).map(([date, data]) => ({ date, ...data }));
    const categoryRevenue = Object.entries(categoryMap).map(([category, data]) => ({ category, ...data }));

    res.json({ dailyRevenue, bookingStatus: bookingStatusList, categoryRevenue, topServices });
  } catch (error) {
    next(error);
  }
});

const mapCouponBody = (body: any) => {
  const data: any = { ...body };
  if (data.type !== undefined) {
    data.discountType = data.type;
    delete data.type;
  }
  if (data.value !== undefined) {
    data.discountValue = parseFloat(data.value);
    delete data.value;
  }
  if (data.usageLimit !== undefined) {
    data.maxUses = parseInt(data.usageLimit, 10);
    delete data.usageLimit;
  }
  if (data.expiresAt !== undefined) {
    data.validUntil = new Date(data.expiresAt);
    delete data.expiresAt;
  }
  if (data.validFrom !== undefined) {
    data.validFrom = new Date(data.validFrom);
  } else if (!data.validFrom) {
    data.validFrom = new Date();
  }
  if (data.validUntil !== undefined) {
    data.validUntil = new Date(data.validUntil);
  }
  if (data.discountValue !== undefined && typeof data.discountValue === 'string') {
    data.discountValue = parseFloat(data.discountValue);
  }
  if (data.maxUses !== undefined && typeof data.maxUses === 'string') {
    data.maxUses = parseInt(data.maxUses, 10);
  }
  if (data.minOrderAmount !== undefined && typeof data.minOrderAmount === 'string') {
    data.minOrderAmount = parseFloat(data.minOrderAmount);
  }
  if (data.maxDiscount !== undefined && typeof data.maxDiscount === 'string') {
    data.maxDiscount = parseFloat(data.maxDiscount);
  }
  if (data.perUserLimit !== undefined && typeof data.perUserLimit === 'string') {
    data.perUserLimit = parseInt(data.perUserLimit, 10);
  }
  return data;
};

router.post('/coupons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mapped = mapCouponBody(req.body);
    const coupon = await prisma.coupon.create({ data: mapped });
    await cacheDelPattern('coupons:*');
    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (error) {
    next(error);
  }
});

router.get('/coupons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { services: { include: { service: { select: { title: true } } } } },
    });
    res.json({ coupons });
  } catch (error) {
    next(error);
  }
});

router.patch('/coupons/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mapped = mapCouponBody(req.body);
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: mapped,
    });
    await cacheDelPattern('coupons:*');
    res.json({ message: 'Coupon updated', coupon });
  } catch (error) {
    next(error);
  }
});

router.get('/fraud-alerts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fraudThreshold = 10;
    const timeWindow = new Date(Date.now() - 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: timeWindow } },
      include: { user: { select: { name: true, email: true } } },
    });

    const userBookingCount: Record<string, { name: string; email: string; count: number; totalAmount: number }> = {};
    for (const b of bookings) {
      if (!userBookingCount[b.userId]) {
        userBookingCount[b.userId] = { name: b.user.name, email: b.user.email, count: 0, totalAmount: 0 };
      }
      userBookingCount[b.userId].count += 1;
      userBookingCount[b.userId].totalAmount += b.finalAmount;
    }

    const suspiciousBookings = Object.entries(userBookingCount)
      .filter(([_, data]) => data.count > fraudThreshold)
      .map(([userId, data]) => ({ userId, ...data }));

    const failedPayments = await prisma.payment.findMany({
      where: { status: 'FAILED', createdAt: { gte: timeWindow } },
      include: { user: { select: { name: true, email: true } } },
    });

    const failedCount: Record<string, { name: string; email: string; count: number }> = {};
    for (const p of failedPayments) {
      if (!failedCount[p.userId]) {
        failedCount[p.userId] = { name: p.user.name, email: p.user.email, count: 0 };
      }
      failedCount[p.userId].count += 1;
    }

    const failedAlert = Object.entries(failedCount)
      .filter(([_, data]) => data.count > 5)
      .map(([userId, data]) => ({ userId, ...data }));

    res.json({ suspiciousBookings, failedPayments: failedAlert });
  } catch (error) {
    next(error);
  }
});

// --- Dynamic Pricing ---

router.get('/pricing-rules', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await prisma.pricingRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: { service: { select: { title: true, category: true } } },
    });
    res.json({ rules });
  } catch (error) {
    next(error);
  }
});

router.post('/pricing-rules', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await prisma.pricingRule.create({ data: req.body });
    await cacheDelPattern('pricing:*');
    res.status(201).json({ message: 'Pricing rule created', rule });
  } catch (error) {
    next(error);
  }
});

router.patch('/pricing-rules/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await prisma.pricingRule.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await cacheDelPattern('pricing:*');
    res.json({ message: 'Pricing rule updated', rule });
  } catch (error) {
    next(error);
  }
});

router.delete('/pricing-rules/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.pricingRule.delete({ where: { id: req.params.id } });
    await cacheDelPattern('pricing:*');
    res.json({ message: 'Pricing rule deleted' });
  } catch (error) {
    next(error);
  }
});

// --- CMS ---

router.get('/cms', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await prisma.cmsPage.findMany({ orderBy: { updatedAt: 'desc' } });
    const banners = await prisma.cmsBanner.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ pages, banners });
  } catch (error) {
    next(error);
  }
});

router.post('/cms/pages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await prisma.cmsPage.create({ data: req.body });
    res.status(201).json({ message: 'Page created', page });
  } catch (error) {
    next(error);
  }
});

router.patch('/cms/pages/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = await prisma.cmsPage.update({ where: { id: req.params.id }, data: req.body });
    res.json({ message: 'Page updated', page });
  } catch (error) {
    next(error);
  }
});

router.delete('/cms/pages/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.cmsPage.delete({ where: { id: req.params.id } });
    res.json({ message: 'Page deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/cms/banners', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await prisma.cmsBanner.create({ data: req.body });
    res.status(201).json({ message: 'Banner created', banner });
  } catch (error) {
    next(error);
  }
});

router.patch('/cms/banners/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await prisma.cmsBanner.update({ where: { id: req.params.id }, data: req.body });
    res.json({ message: 'Banner updated', banner });
  } catch (error) {
    next(error);
  }
});

router.delete('/cms/banners/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.cmsBanner.delete({ where: { id: req.params.id } });
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
