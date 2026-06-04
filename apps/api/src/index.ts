import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { apiLogger } from './middleware/apiLogger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import bookingRoutes from './routes/booking.routes';
import serviceRoutes from './routes/service.routes';
import paymentRoutes from './routes/payment.routes';
import vendorRoutes from './routes/vendor.routes';
import adminRoutes from './routes/admin.routes';
import searchRoutes from './routes/search.routes';
import walletRoutes from './routes/wallet.routes';
import notificationRoutes from './routes/notification.routes';
import aiRoutes from './routes/ai.routes';
import wishlistRoutes from './routes/wishlist.routes';
import ticketRoutes from './routes/ticket.routes';
import { setupSocketHandlers } from './socket';
import { setupCronJobs } from './cron';

export const prisma = new PrismaClient();

const initRedis = () => {
  console.log('📡 Using ioredis-mock (no real Redis required for development)');
  return new (require('ioredis-mock'))();
};

export let redis: any;

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);
      if (origin === config.FRONTEND_URL) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set('io', io);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port (handles Next.js auto port-switching: 3000, 3001, etc.)
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return callback(null, true);
    // Allow the configured FRONTEND_URL
    if (origin === config.FRONTEND_URL) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
app.use('/api', apiLogger);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/bookings', authenticate, bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', authenticate, paymentRoutes);
app.use('/api/vendor', authenticate, vendorRoutes);
app.use('/api/admin', authenticate, adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wallet', authenticate, walletRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);
app.use('/api/ai', authenticate, aiRoutes);
app.use('/api/wishlist', authenticate, wishlistRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

redis = initRedis();
setupSocketHandlers(io);
setupCronJobs();

httpServer.listen(config.PORT, () => {
  console.log(`🚀 Arvis X API running on port ${config.PORT}`);
  console.log(`📡 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 WebSocket: ${config.WS_URL}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  if (redis?.quit) redis.quit();
  httpServer.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
