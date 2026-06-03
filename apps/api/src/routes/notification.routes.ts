import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: req.user!.userId } }),
      prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
