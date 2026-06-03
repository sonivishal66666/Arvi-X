import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

export const apiLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'production') {
      try {
        await prisma.apiLog.create({
          data: {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            userId: (req as any).user?.userId,
            ip: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            duration,
            body: req.method !== 'GET' ? JSON.stringify(req.body).slice(0, 1000) : null,
          },
        });
      } catch (error) {
        console.error('Failed to log API request:', error);
      }
    }
  });

  next();
};
