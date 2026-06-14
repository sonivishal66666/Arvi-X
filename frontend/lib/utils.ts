import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date, style: 'short' | 'long' | 'full' = 'short'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions =
    style === 'short' ? { day: 'numeric', month: 'short', year: 'numeric' } :
    style === 'long' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } :
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleDateString('en-IN', options);
};

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

export const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

export const pluralize = (count: number, singular: string, plural?: string): string =>
  count === 1 ? singular : plural || `${singular}s`;

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    CONFIRMED: 'text-emerald-500 bg-emerald-500/10',
    PENDING: 'text-amber-500 bg-amber-500/10',
    CANCELLED: 'text-red-500 bg-red-500/10',
    REFUNDED: 'text-blue-500 bg-blue-500/10',
    COMPLETED: 'text-green-500 bg-green-500/10',
    NO_SHOW: 'text-gray-500 bg-gray-500/10',
    SUCCESS: 'text-emerald-500 bg-emerald-500/10',
    FAILED: 'text-red-500 bg-red-500/10',
    AVAILABLE: 'text-emerald-500 bg-emerald-500/10',
    LOCKED: 'text-amber-500 bg-amber-500/10',
    BOOKED: 'text-red-500 bg-red-500/10',
  };
  return colors[status] || 'text-muted-foreground bg-muted';
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    BUS: 'Bus',
    TRAIN: 'Train',
    FLIGHT: 'Plane',
    HOTEL: 'Building',
    EVENT: 'Ticket',
  };
  return icons[category] || 'Circle';
};

export const getCategoryGradient = (category: string): string => {
  const gradients: Record<string, string> = {
    BUS: 'from-blue-500 to-cyan-500',
    TRAIN: 'from-orange-500 to-red-500',
    FLIGHT: 'from-purple-500 to-pink-500',
    HOTEL: 'from-emerald-500 to-teal-500',
    EVENT: 'from-amber-500 to-yellow-500',
  };
  return gradients[category] || 'from-primary to-primary/60';
};
