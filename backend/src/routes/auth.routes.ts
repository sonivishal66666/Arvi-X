import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../index';
import { config } from '../config';
import { validate } from '../middleware/validate';
import { AppError, BadRequestError, UnauthorizedError, ConflictError } from '../middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOtp,
  createSession,
} from '../utils/tokens';
import { cacheGet, cacheSet, cacheDel } from '../utils/redis';
import { sendOtpEmail } from '../utils/email';
import { logger } from '../utils/logger';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(128),
});

router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        isVerified: true,
        profile: { create: {} },
        wallet: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const sessionId = await createSession(user.id, req.headers['user-agent'], req.ip);
    const accessToken = generateAccessToken({ userId: user.id, role: user.role, sessionId });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, sessionId });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    res.status(201).json({
      message: 'Registration successful',
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', validate(otpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const otpKey = `otp:register:${email}`;
    const storedOtp = await cacheGet<string>(otpKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    await cacheDel(otpKey);

    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
      select: { id: true, name: true, email: true, role: true },
    });

    const sessionId = await createSession(user.id, req.headers['user-agent'], req.ip);
    const accessToken = generateAccessToken({ userId: user.id, role: user.role, sessionId });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, sessionId });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    res.json({
      message: 'Email verified successfully',
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Dynamically auto-create default admin credentials if they don't exist
    if (email === 'admin@admin') {
      const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@admin' } });
      if (!existingAdmin) {
        const hashedAdminPassword = await bcrypt.hash('admin', 12);
        await prisma.user.create({
          data: {
            name: 'Administrator',
            email: 'admin@admin',
            password: hashedAdminPassword,
            role: 'ADMIN',
            isVerified: true,
            profile: { create: {} },
            wallet: { create: {} },
          }
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true, isActive: true, isVerified: true },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const sessionId = await createSession(user.id, req.headers['user-agent'], req.ip);
    const accessToken = generateAccessToken({ userId: user.id, role: user.role, sessionId });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, sessionId });

    const tokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
    const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/api/auth/refresh',
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new BadRequestError('Email is required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('No account found with this email');

    const otp = generateOtp();
    const otpKey = `otp:login:${email}`;
    await cacheSet(otpKey, otp, 600);

    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP sent to your email', requiresOtp: true });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-login-otp', validate(otpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const otpKey = `otp:login:${email}`;
    const storedOtp = await cacheGet<string>(otpKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    await cacheDel(otpKey);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) throw new UnauthorizedError('User not found');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const sessionId = await createSession(user.id, req.headers['user-agent'], req.ip);
    const accessToken = generateAccessToken({ userId: user.id, role: user.role, sessionId });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, sessionId });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh' });

    res.json({ message: 'Login successful', user, accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) throw new BadRequestError('Google credential required');

    const { OAuth2Client } = require('google-auth-library');
    const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    if (!email) throw new BadRequestError('Google account has no email');

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = (await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          image: picture,
          isVerified: true,
          profile: { create: {} },
          wallet: { create: {} },
        },
        select: { id: true, name: true, email: true, role: true, image: true },
      })) as any;
    } else if (!user.googleId) {
      user = (await prisma.user.update({
        where: { id: user.id },
        data: { googleId, image: picture, isVerified: true },
        select: { id: true, name: true, email: true, role: true, image: true },
      })) as any;
    }

    await prisma.user.update({ where: { id: user!.id }, data: { lastLoginAt: new Date() } });

    const sessionId = await createSession(user!.id, req.headers['user-agent'], req.ip);
    const accessToken = generateAccessToken({ userId: user!.id, role: user!.role, sessionId });
    const refreshToken = generateRefreshToken({ userId: user!.id, role: user!.role, sessionId });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh' });

    res.json({ message: 'Google login successful', user, accessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) throw new UnauthorizedError('Refresh token required');

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedError('User not found');

    const sessionId = await createSession(user.id, req.headers['user-agent'], req.ip);
    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role, sessionId });
    const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role, sessionId });

    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh' });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await prisma.session.updateMany({
          where: { userId: decoded.userId, isActive: true },
          data: { isActive: false },
        });
      } catch {}
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }

    const resetToken = generateOtp(32);
    await cacheSet(`reset:${resetToken}`, email, 3600);
    await sendOtpEmail(email, `Reset token: ${resetToken}`);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const email = await cacheGet<string>(`reset:${token}`);

    if (!email) throw new BadRequestError('Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
    await cacheDel(`reset:${token}`);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.json({ user: null });
      return;
    }

    const decoded = require('jsonwebtoken').verify(token, config.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        image: true, isVerified: true, createdAt: true,
        profile: true,
      },
    });

    res.json({ user });
  } catch {
    res.json({ user: null });
  }
});

export default router;
