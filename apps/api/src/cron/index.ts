import cron from 'node-cron';
import { prisma } from '../index';
import { logger } from '../utils/logger';

export const setupCronJobs = (): void => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expiredLocks = await prisma.seatLock.findMany({
        where: { expiresAt: { lte: new Date() } },
        include: { seat: true },
      });

      for (const lock of expiredLocks) {
        await prisma.seat.update({
          where: { id: lock.seatId },
          data: { status: 'AVAILABLE' },
        });
        await prisma.seatLock.delete({ where: { id: lock.id } });
      }

      if (expiredLocks.length > 0) {
        logger.info(`Cron: Released ${expiredLocks.length} expired seat locks`);
      }
    } catch (error) {
      logger.error('Cron seat lock cleanup error:', error);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.booking.updateMany({
        where: {
          status: 'CONFIRMED',
          schedule: { departureTime: { lt: today } },
        },
        data: { status: 'COMPLETED' },
      });

      logger.info('Cron: Completed past bookings');
    } catch (error) {
      logger.error('Cron booking completion error:', error);
    }
  });

  cron.schedule('0 */6 * * *', async () => {
    try {
      const expiredCoupons = await prisma.coupon.updateMany({
        where: {
          validUntil: { lt: new Date() },
          isActive: true,
        },
        data: { isActive: false },
      });

      if (expiredCoupons.count > 0) {
        logger.info(`Cron: Deactivated ${expiredCoupons.count} expired coupons`);
      }
    } catch (error) {
      logger.error('Cron coupon cleanup error:', error);
    }
  });

  cron.schedule('0 0 * * 0', async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await prisma.session.deleteMany({
        where: { lastActivity: { lt: thirtyDaysAgo } },
      });

      logger.info('Cron: Cleaned up old sessions');
    } catch (error) {
      logger.error('Cron session cleanup error:', error);
    }
  });

  cron.schedule('0 1 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterdaySales = await prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: yesterday, lt: today },
        },
        _sum: { amount: true },
        _count: true,
      });

      logger.info(`Daily report - Revenue: ₹${yesterdaySales._sum.amount || 0}, Transactions: ${yesterdaySales._count}`);
    } catch (error) {
      logger.error('Cron daily report error:', error);
    }
  });

  logger.info('✅ Cron jobs initialized');
};
