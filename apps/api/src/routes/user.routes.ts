import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { BadRequestError } from '../middleware/errorHandler';
import { cacheDelPattern } from '../utils/redis';

const router = Router();

router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        image: true, isVerified: true, createdAt: true,
        profile: true,
        wallet: { select: { balance: true, isActive: true } },
      },
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, image, ...profileData } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(image && { image }),
        profile: profileData ? {
          upsert: {
            create: profileData,
            update: profileData,
          },
        } : undefined,
      },
      select: {
        id: true, name: true, email: true, phone: true, image: true,
        profile: true,
      },
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
});

router.patch('/password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { password: true },
    });

    if (!user?.password) throw new BadRequestError('No password set');
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: req.user!.userId },
        include: {
          service: { select: { id: true, title: true, category: true, images: true } },
          payments: { select: { amount: true, status: true, method: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where: { userId: req.user!.userId } }),
    ]);

    res.json({
      bookings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [totalBookings, totalSpent, upcomingBookings, wallet] = await Promise.all([
      prisma.booking.count({ where: { userId } }),
      prisma.payment.aggregate({
        where: { userId, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.booking.count({
        where: { userId, status: { in: ['CONFIRMED', 'PENDING'] } },
      }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      }),
    ]);

    res.json({
      stats: {
        totalBookings,
        totalSpent: totalSpent._sum.amount || 0,
        upcomingBookings,
        walletBalance: wallet?.balance || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
