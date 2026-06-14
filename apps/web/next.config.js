/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permanent fix: production builds write to '.next-build' so they never
  // corrupt the dev server's '.next' directory on Windows.
  // This eliminates all MODULE_NOT_FOUND / vendor-chunks errors.
  ...(process.env.NODE_ENV === 'production' ? { distDir: '.next-build' } : {}),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
    NEXT_PUBLIC_CASHFREE_APP_ID: process.env.NEXT_PUBLIC_CASHFREE_APP_ID || '',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  },

};

module.exports = nextConfig;

