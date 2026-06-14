import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

const addSchema = z.object({
  serviceId: z.string().uuid(),
});

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.userId },
      include: {
        service: {
          include: {
            vendor: { select: { businessName: true } },
            bus: true,
            train: true,
            flight: true,
            hotel: true,
            event: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, validate(addSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.body;
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundError('Service not found');

    const existing = await prisma.wishlist.findUnique({
      where: { userId_serviceId: { userId: req.user!.userId, serviceId } },
    });
    if (existing) return res.json({ item: existing, message: 'Already in wishlist' });

    const item = await prisma.wishlist.create({
      data: { userId: req.user!.userId, serviceId },
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
});

router.delete('/:serviceId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const existing = await prisma.wishlist.findUnique({
      where: { userId_serviceId: { userId: req.user!.userId, serviceId } },
    });
    if (!existing) throw new NotFoundError('Wishlist item not found');

    await prisma.wishlist.delete({ where: { id: existing.id } });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
});

router.get('/check/:serviceId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const item = await prisma.wishlist.findUnique({
      where: { userId_serviceId: { userId: req.user!.userId, serviceId } },
    });
    res.json({ isWishlisted: !!item });
  } catch (err) {
    next(err);
  }
});

export default router;
