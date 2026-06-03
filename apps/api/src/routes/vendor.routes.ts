import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { cacheDelPattern } from '../utils/redis';

const router = Router();

router.use(authorize('VENDOR', 'ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!vendor) throw new NotFoundError('Vendor profile');

    const [totalServices, totalBookings, totalRevenue, recentBookings, services] = await Promise.all([
      prisma.service.count({ where: { vendorId: vendor.id } }),
      prisma.booking.count({ where: { service: { vendorId: vendor.id } } }),
      prisma.payment.aggregate({
        where: { booking: { service: { vendorId: vendor.id } }, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.booking.findMany({
        where: { service: { vendorId: vendor.id } },
        include: { user: { select: { name: true, email: true } }, service: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.service.findMany({
        where: { vendorId: vendor.id },
        include: { _count: { select: { bookings: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      vendor,
      stats: {
        totalServices,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalPayout: vendor.totalPayout,
        pendingPayout: vendor.totalRevenue - vendor.totalPayout,
      },
      recentBookings,
      services,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    if (!vendor) throw new NotFoundError('Vendor profile');
    if (!vendor.isVerified) throw new BadRequestError('Vendor account not verified');

    const { category, ...serviceData } = req.body;

    const service = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        category,
        ...serviceData,
        isActive: true,
      },
    });

    if (category === 'BUS') {
      await prisma.busService.create({ data: { serviceId: service.id, ...req.body.busDetails } });
    } else if (category === 'TRAIN') {
      await prisma.trainService.create({ data: { serviceId: service.id, ...req.body.trainDetails } });
    } else if (category === 'FLIGHT') {
      await prisma.flightService.create({ data: { serviceId: service.id, ...req.body.flightDetails } });
    } else if (category === 'HOTEL') {
      await prisma.hotelService.create({ data: { serviceId: service.id, ...req.body.hotelDetails } });
    } else if (category === 'EVENT') {
      await prisma.eventService.create({ data: { serviceId: service.id, ...req.body.eventDetails } });
    }

    await cacheDelPattern('services:*');
    res.status(201).json({ message: 'Service created', service });
  } catch (error) {
    next(error);
  }
});

router.put('/services/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    if (!vendor) throw new NotFoundError('Vendor profile');

    const service = await prisma.service.findFirst({
      where: { id: req.params.id, vendorId: vendor.id },
    });
    if (!service) throw new NotFoundError('Service');

    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await cacheDelPattern('services:*');
    res.json({ message: 'Service updated', service: updated });
  } catch (error) {
    next(error);
  }
});

router.get('/services', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    if (!vendor) throw new NotFoundError('Vendor profile');

    const services = await prisma.service.findMany({
      where: { vendorId: vendor.id },
      include: {
        _count: { select: { bookings: true, reviews: true } },
        schedules: { where: { departureTime: { gte: new Date() } }, take: 5, orderBy: { departureTime: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ services });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    if (!vendor) throw new NotFoundError('Vendor profile');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { service: { vendorId: vendor.id } },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          service: { select: { title: true, category: true } },
          payments: { select: { amount: true, status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where: { service: { vendorId: vendor.id } } }),
    ]);

    res.json({
      bookings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/payouts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    if (!vendor) throw new NotFoundError('Vendor profile');

    const payouts = await prisma.vendorPayout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payouts, balance: vendor.totalRevenue - vendor.totalPayout });
  } catch (error) {
    next(error);
  }
});

router.get('/revenue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    if (!vendor) throw new NotFoundError('Vendor profile');

    const period = (req.query.period as string) || 'monthly';
    const now = new Date();
    let startDate: Date;

    if (period === 'weekly') { startDate = new Date(now); startDate.setDate(startDate.getDate() - 7); }
    else if (period === 'yearly') { startDate = new Date(now); startDate.setFullYear(startDate.getFullYear() - 1); }
    else { startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 1); }

    const payments = await prisma.payment.findMany({
      where: {
        booking: { service: { vendorId: vendor.id } },
        status: 'SUCCESS',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const revenueData = payments.reduce((acc: any, p) => {
      const date = p.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + p.amount;
      return acc;
    }, {});

    res.json({
      revenue: Object.entries(revenueData).map(([date, amount]) => ({ date, amount })),
      total: payments.reduce((sum, p) => sum + p.amount, 0),
      period,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
