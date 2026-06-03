import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { validate } from '../middleware/validate';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler';
import { cacheGet, cacheSet } from '../utils/redis';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, city, page = '1', limit = '20', sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { isActive: true };
    if (category) where.category = (category as string).toUpperCase();
    if (city) {
      where.OR = [
        { title: { contains: city as string } },
        { description: { contains: city as string } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          vendor: { select: { businessName: true } },
          bus: category === 'BUS' ? true : undefined,
          hotel: category === 'HOTEL' ? true : undefined,
          event: category === 'EVENT' ? { select: { startDate: true, endDate: true, venue: true, eventType: true } } : undefined,
        },
        orderBy: { [sort as string]: order as string },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      services,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/featured', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'services:featured';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ services: cached });
      return;
    }

    const services = await prisma.service.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        vendor: { select: { businessName: true } },
        _count: { select: { reviews: true, bookings: true } },
      },
      take: 12,
      orderBy: { rating: 'desc' },
    });

    await cacheSet(cacheKey, services, 300);
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: { select: { businessName: true, businessEmail: true, businessPhone: true } },
        bus: true,
        train: true,
        flight: true,
        hotel: true,
        event: true,
        schedules: {
          where: { departureTime: { gte: new Date() }, isActive: true },
          orderBy: { departureTime: 'asc' },
          take: 30,
        },
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, bookings: true } },
      },
    });

    if (!service) throw new NotFoundError('Service');
    res.json({ service });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/schedules', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const where: any = { serviceId: req.params.id, isActive: true, departureTime: { gte: new Date() } };

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.departureTime = { gte: startDate, lt: endDate };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { departureTime: 'asc' },
    });

    res.json({ schedules });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/seats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { scheduleId } = req.query;
    if (!scheduleId) throw new BadRequestError('Schedule ID required');

    const cacheKey = `schedules:${scheduleId}:seats`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      res.json({ seats: cached });
      return;
    }

    let seats = await prisma.seat.findMany({
      where: { scheduleId: scheduleId as string },
      orderBy: [{ row: 'asc' }, { column: 'asc' }],
    });

    if (seats.length === 0) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId as string },
        include: {
          service: {
            include: {
              bus: true,
              train: true,
              flight: true,
            }
          }
        }
      });

      if (schedule && schedule.service) {
        const { category } = schedule.service;
        const basePrice = schedule.basePrice || schedule.service.basePrice;
        const seatsToCreate: any[] = [];

        if (category === 'BUS') {
          const totalSeats = schedule.service.bus?.totalSeats || 40;
          const deckCount = schedule.service.bus?.deckCount || 1;
          const seatsPerDeck = Math.ceil(totalSeats / deckCount);
          const columns = ['A', 'B', 'C', 'D'];

          for (let deck = 1; deck <= deckCount; deck++) {
            const startIdx = (deck - 1) * seatsPerDeck;
            const endIdx = Math.min(deck * seatsPerDeck, totalSeats);
            const count = endIdx - startIdx;

            for (let i = 0; i < count; i++) {
              const row = Math.floor(i / 4) + 1;
              const col = columns[i % 4];
              const seatNumber = `${row}${col}`;

              seatsToCreate.push({
                scheduleId: scheduleId as string,
                seatNumber,
                deck,
                row,
                column: col,
                status: 'AVAILABLE',
                price: basePrice,
              });
            }
          }
        } else if (category === 'FLIGHT') {
          const classes = (schedule.service.flight?.classes as any[]) || [
            { name: 'Economy', code: 'Y', seats: 60, price: basePrice }
          ];
          const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
          let currentRow = 1;

          for (const cabinClass of classes) {
            const seatCount = cabinClass.seats || 30;
            const classPrice = cabinClass.price || basePrice;
            const className = cabinClass.name || 'Economy';

            for (let i = 0; i < seatCount; i++) {
              const colIdx = i % 6;
              const row = currentRow + Math.floor(i / 6);
              const col = columns[colIdx];
              const seatNumber = `${row}${col}`;

              seatsToCreate.push({
                scheduleId: scheduleId as string,
                seatNumber,
                deck: 1,
                row,
                column: col,
                class: className,
                status: 'AVAILABLE',
                price: classPrice,
              });
            }
            currentRow += Math.ceil(seatCount / 6) + 1;
          }
        } else if (category === 'TRAIN') {
          const classes = (schedule.service.train?.classes as any[]) || [
            { name: 'Sleeper', code: 'SL', seats: 72, price: basePrice }
          ];
          const columns = ['A', 'B', 'C', 'D', 'E'];
          let currentRow = 1;

          for (const trainClass of classes) {
            const seatCount = trainClass.seats || 72;
            const classPrice = trainClass.price || basePrice;
            const className = trainClass.name || 'Sleeper';

            for (let i = 0; i < seatCount; i++) {
              const colIdx = i % 5;
              const row = currentRow + Math.floor(i / 5);
              const col = columns[colIdx];
              const seatNumber = `${row}${col}`;

              seatsToCreate.push({
                scheduleId: scheduleId as string,
                seatNumber,
                deck: 1,
                row,
                column: col,
                class: className,
                status: 'AVAILABLE',
                price: classPrice,
              });
            }
            currentRow += Math.ceil(seatCount / 5) + 1;
          }
        }

        if (seatsToCreate.length > 0) {
          await prisma.seat.createMany({
            data: seatsToCreate,
            skipDuplicates: true,
          });

          seats = await prisma.seat.findMany({
            where: { scheduleId: scheduleId as string },
            orderBy: [{ row: 'asc' }, { column: 'asc' }],
          });
        }
      }
    }

    const totalSeats = seats.length;
    const availableSeats = seats.filter(s => s.status === 'AVAILABLE').length;

    await cacheSet(cacheKey, seats, 30);

    res.json({
      seats,
      stats: { total: totalSeats, available: availableSeats, booked: totalSeats - availableSeats },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { serviceId: req.params.id },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { serviceId: req.params.id } }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { serviceId: req.params.id },
        _count: true,
      }),
    ]);

    res.json({
      reviews,
      stats,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
