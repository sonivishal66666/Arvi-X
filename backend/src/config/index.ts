import dotenv from 'dotenv';
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  API_URL: process.env.API_URL || 'http://localhost:4000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:DEVILSONI6350@db.flphjoefggtjuiuuehjp.supabase.co:5432/postgres',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  JWT_SECRET: process.env.JWT_SECRET || 'arvis-x-dev-secret-key-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'arvis-x-dev-refresh-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',

  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || 'TEST10323353dd615588a92764db9a9335332301',
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY || 'cfsk_ma_test_0a60a66d37c1ab96dcd3d4056cf57e04_f7f25b7b',
  CASHFREE_API_URL: process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg',
  CASHFREE_ENV: process.env.CASHFREE_ENV || 'SANDBOX',

  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@arvisx.com',

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || '',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',

  WS_URL: process.env.WS_URL || 'ws://localhost:4000',

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5000', 10),
} as const;
