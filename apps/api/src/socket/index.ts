import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../index';
function getRedis() { return require('../index').redis; }
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

export const setupSocketHandlers = (io: SocketServer): void => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token as string;
      if (token) {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        socket.userId = decoded.userId;
        socket.role = decoded.role;
      }
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id}${socket.userId ? ` (user: ${socket.userId})` : ''}`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('track:schedule', (scheduleId: string) => {
      socket.join(`schedule:${scheduleId}`);
      logger.info(`Socket ${socket.id} tracking schedule: ${scheduleId}`);
    });

    socket.on('untrack:schedule', (scheduleId: string) => {
      socket.leave(`schedule:${scheduleId}`);
    });

    socket.on('seat:lock', async (data: { seatId: string; scheduleId: string }, callback) => {
      try {
        if (!socket.userId) {
          callback({ error: 'Authentication required' });
          return;
        }

        const seat = await prisma.seat.findUnique({ where: { id: data.seatId } });
        if (!seat || seat.status !== 'AVAILABLE') {
          callback({ error: 'Seat not available' });
          return;
        }

        const lockKey = `lock:seat:${data.seatId}`;
        const acquired = await getRedis().set(lockKey, socket.userId, 'EX', 300, 'NX');
        if (!acquired) {
          callback({ error: 'Seat is being locked by another user' });
          return;
        }

        await prisma.seat.update({
          where: { id: data.seatId },
          data: { status: 'LOCKED' },
        });

        await prisma.seatLock.create({
          data: {
            seatId: data.seatId,
            userId: socket.userId,
            sessionId: socket.id,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });

        io.to(`schedule:${data.scheduleId}`).emit('seat:locked', {
          seatId: data.seatId,
          userId: socket.userId,
          timestamp: new Date(),
        });

        callback({ success: true });
      } catch (error) {
        logger.error('Seat lock error:', error);
        callback({ error: 'Failed to lock seat' });
      }
    });

    socket.on('seat:release', async (data: { seatId: string; scheduleId: string }, callback) => {
      try {
        const lockKey = `lock:seat:${data.seatId}`;
        await getRedis().del(lockKey);

        await prisma.seat.update({
          where: { id: data.seatId },
          data: { status: 'AVAILABLE' },
        });

        await prisma.seatLock.deleteMany({
          where: { seatId: data.seatId, sessionId: socket.id },
        });

        io.to(`schedule:${data.scheduleId}`).emit('seat:released', {
          seatId: data.seatId,
          timestamp: new Date(),
        });

        callback({ success: true });
      } catch (error) {
        logger.error('Seat release error:', error);
        callback({ error: 'Failed to release seat' });
      }
    });

    socket.on('booking:live-update', (data: { bookingId: string; status: string }) => {
      io.to(`user:${socket.userId}`).emit('booking:updated', {
        bookingId: data.bookingId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    socket.on('track:vendor', (vendorId: string) => {
      if (socket.role === 'VENDOR' || socket.role === 'ADMIN') {
        socket.join(`vendor:${vendorId}`);
      }
    });

    socket.on('track:admin', () => {
      if (socket.role === 'ADMIN' || socket.role === 'SUPER_ADMIN') {
        socket.join('admin');
      }
    });

    socket.on('typing', (data: { sessionId: string }) => {
      socket.to(`user:${socket.userId}`).emit('typing', { sessionId: data.sessionId, userId: socket.userId });
    });

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);

      if (socket.userId) {
        const activeLocks = await prisma.seatLock.findMany({
          where: { sessionId: socket.id },
          include: { seat: true },
        });

        for (const lock of activeLocks) {
          await getRedis().del(`lock:seat:${lock.seatId}`);
          await prisma.seat.update({
            where: { id: lock.seatId },
            data: { status: 'AVAILABLE' },
          });

        await prisma.seatLock.deleteMany({
          where: { sessionId: socket.id },
        });
        }

        await prisma.seatLock.deleteMany({
          where: { sessionId: socket.id },
        });
      }
    });
  });

  setInterval(async () => {
    try {
      const expiredLocks = await prisma.seatLock.findMany({
        where: { expiresAt: { lte: new Date() } },
        include: { seat: true },
      });

      for (const lock of expiredLocks) {
        await getRedis().del(`lock:seat:${lock.seatId}`);
        await prisma.seat.update({
          where: { id: lock.seatId },
          data: { status: 'AVAILABLE' },
        });
        await prisma.seatLock.delete({ where: { id: lock.id } });

        io.to(`schedule:${lock.seat.scheduleId}`).emit('seat:expired', {
          seatId: lock.seatId,
          timestamp: new Date(),
        });
      }

      if (expiredLocks.length > 0) {
        logger.info(`Released ${expiredLocks.length} expired seat locks`);
      }
    } catch (error) {
      logger.error('Seat lock cleanup error:', error);
    }
  }, 30000);
};
