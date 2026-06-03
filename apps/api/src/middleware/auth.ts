import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { logger } from '../utils/logger';

export interface JwtPayload {
  userId: string;
  role: string;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        name: string;
        email: string;
      };
      sessionId?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionId: decoded.sessionId,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true },
      });
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionId: decoded.sessionId,
        };
      }
    }
  } catch {
    // Silent fail for optional auth
  }
  next();
};
