import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    api.post('/auth/login', data),
  loginOtp: (data: { email: string }) =>
    api.post('/auth/login-otp', data),
  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
  verifyLoginOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-login-otp', data),
  googleLogin: (credential: string) =>
    api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const servicesApi = {
  list: (params?: any) => api.get('/services', { params }),
  featured: () => api.get('/services/featured'),
  getById: (id: string) => api.get(`/services/${id}`),
  getSchedules: (id: string, params?: any) => api.get(`/services/${id}/schedules`, { params }),
  getSeats: (serviceId: string, scheduleId: string) => api.get(`/services/${serviceId}/seats`, { params: { scheduleId } }),
  getReviews: (id: string, params?: any) => api.get(`/services/${id}/reviews`, { params }),
};

export const searchApi = {
  search: (params: any) => api.get('/search', { params }),
  autocomplete: (q: string) => api.get('/search/autocomplete', { params: { q } }),
  voice: (transcript: string) => api.get('/search/voice', { params: { transcript } }),
};

export const bookingApi = {
  create: (data: any) => api.post('/bookings', data),
  list: (params?: any) => api.get('/bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string, reason?: string) => api.patch(`/bookings/${id}/cancel`, { reason }),
  getTicket: (id: string) => api.get(`/bookings/${id}/ticket`),
  validateCoupon: (code: string, serviceId?: string, amount?: number) =>
    api.get(`/bookings/coupon/validate/${code}`, { params: { serviceId, amount } }),
};

export const paymentApi = {
  createOrder: (data: { bookingId: string; paymentMethod?: string }) => api.post('/payments/create-order', data),
  verify: (orderId: string) => api.post('/payments/verify', { orderId }),
  refund: (bookingId: string, reason?: string) => api.post('/payments/refund', { bookingId, reason }),
  history: (params?: any) => api.get('/payments/history', { params }),
};

export const walletApi = {
  get: () => api.get('/wallet'),
  add: (amount: number) => api.post('/wallet/add', { amount }),
  verifyPayment: (orderId: string) => api.post('/wallet/verify-payment', { orderId }),
  transactions: (params?: any) => api.get('/wallet/transactions', { params }),
  topupDev: (amount: number) => api.post('/wallet/topup-dev', { amount }),
};

export const userApi = {
  profile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/users/password', { currentPassword, newPassword }),
  bookings: (params?: any) => api.get('/users/bookings', { params }),
  stats: () => api.get('/users/stats'),
};

export const vendorApi = {
  dashboard: () => api.get('/vendor/dashboard'),
  services: () => api.get('/vendor/services'),
  createService: (data: any) => api.post('/vendor/services', data),
  updateService: (id: string, data: any) => api.put(`/vendor/services/${id}`, data),
  bookings: (params?: any) => api.get('/vendor/bookings', { params }),
  payouts: () => api.get('/vendor/payouts'),
  revenue: (period?: string) => api.get('/vendor/revenue', { params: { period } }),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params?: any) => api.get('/admin/users', { params }),
  updateUserStatus: (id: string, isActive: boolean) => api.patch(`/admin/users/${id}/status`, { isActive }),
  vendors: (params?: any) => api.get('/admin/vendors', { params }),
  verifyVendor: (id: string) => api.patch(`/admin/vendors/${id}/verify`),
  bookings: (params?: any) => api.get('/admin/bookings', { params }),
  getBookingById: (id: string) => api.get(`/admin/bookings/${id}`),
  cancelBooking: (id: string, reason?: string) => api.patch(`/admin/bookings/${id}/cancel`, { reason }),
  analytics: (period?: string) => api.get('/admin/analytics', { params: { period } }),
  coupons: () => api.get('/admin/coupons'),
  createCoupon: (data: any) => api.post('/admin/coupons', data),
  updateCoupon: (id: string, data: any) => api.patch(`/admin/coupons/${id}`, data),
  fraudAlerts: () => api.get('/admin/fraud-alerts'),
  getPricingRules: () => api.get('/admin/pricing-rules'),
  createPricingRule: (data: any) => api.post('/admin/pricing-rules', data),
  updatePricingRule: (id: string, data: any) => api.patch(`/admin/pricing-rules/${id}`, data),
  deletePricingRule: (id: string) => api.delete(`/admin/pricing-rules/${id}`),
  getCMS: () => api.get('/admin/cms'),
  createCMSPage: (data: any) => api.post('/admin/cms/pages', data),
  updateCMSPage: (id: string, data: any) => api.patch(`/admin/cms/pages/${id}`, data),
  deleteCMSPage: (id: string) => api.delete(`/admin/cms/pages/${id}`),
  createCMSBanner: (data: any) => api.post('/admin/cms/banners', data),
  updateCMSBanner: (id: string, data: any) => api.patch(`/admin/cms/banners/${id}`, data),
  deleteCMSBanner: (id: string) => api.delete(`/admin/cms/banners/${id}`),
};

export const ticketApi = {
  verify: (qrPayload: string) => api.post('/tickets/verify', { qrPayload }),
};

export const notificationApi = {
  list: (params?: any) => api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const wishlistApi = {
  list: () => api.get('/wishlist'),
  add: (serviceId: string) => api.post('/wishlist', { serviceId }),
  remove: (serviceId: string) => api.delete(`/wishlist/${serviceId}`),
  check: (serviceId: string) => api.get(`/wishlist/check/${serviceId}`),
};

export const aiApi = {
  chat: (data: { message: string; sessionId?: string; context?: any }) => api.post('/ai/chat', data),
  sessions: () => api.get('/ai/sessions'),
  getSession: (id: string) => api.get(`/ai/sessions/${id}`),
  deleteSession: (id: string) => api.delete(`/ai/sessions/${id}`),
  itinerary: (data: { destination: string; duration: number; budget?: number; interests?: string; startDate?: string }) =>
    api.post('/ai/itinerary', data),
  recommendations: (preferences?: any) => api.post('/ai/recommendations', { preferences }),
};
