import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { prisma } from '../index';

interface TokenPayload {
  userId: string;
  role: string;
  sessionId: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
  });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
};

export const createSession = async (userId: string, deviceInfo?: string, ipAddress?: string) => {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      userId,
      token: crypto.randomBytes(64).toString('hex'),
      refreshToken: crypto.randomBytes(64).toString('hex'),
      sessionId,
      deviceInfo,
      ipAddress,
      expiresAt,
    },
  });

  return sessionId;
};

export const generateOtp = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const generateBookingRef = (): string => {
  const prefix = 'ARV';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
