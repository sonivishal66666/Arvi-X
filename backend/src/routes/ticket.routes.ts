import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

router.post('/verify', async (req: Request, res: Response, next: any) => {
  try {
    const { qrPayload } = req.body;
    if (!qrPayload) return res.status(400).json({ error: 'QR payload required' });

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { qrCode: qrPayload },
          { bookingRef: qrPayload },
          { id: qrPayload },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { title: true, category: true, vendor: { select: { businessName: true } } } },
        schedule: { select: { departureTime: true, arrivalTime: true } },
      },
    });

    if (!booking) return res.status(404).json({ error: 'Invalid ticket', valid: false });
    if (booking.status === 'CANCELLED') return res.json({ valid: false, error: 'Booking was cancelled', booking: { status: booking.status } });
    if (booking.status === 'REFUNDED') return res.json({ valid: false, error: 'Booking was refunded', booking: { status: booking.status } });

    res.json({
      valid: true,
      booking: {
        id: booking.id,
        bookingRef: booking.bookingRef,
        status: booking.status,
        user: booking.user,
        service: booking.service,
        passengers: booking.passengers,
        schedule: booking.schedule,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
