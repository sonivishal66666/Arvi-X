'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, ShieldAlert, CreditCard, User, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (params.id) {
      adminApi.getBookingById(params.id as string)
        .then(({ data }) => setBooking(data.booking))
        .catch(() => {
          toast.error('Booking not found');
          router.push('/admin/bookings');
        })
        .finally(() => setIsLoading(false));
    }
  }, [params.id, router]);

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a cancellation reason');
      return;
    }
    setIsCancelling(true);
    try {
      await adminApi.cancelBooking(booking.id, cancelReason);
      toast.success('Booking cancelled and refunded successfully!');
      const { data } = await adminApi.getBookingById(booking.id);
      setBooking(data.booking);
      setShowCancelModal(false);
    } catch (error: any) {
      console.error('[Admin Cancel]', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error?.message || 'Failed to cancel booking';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) return null;

  const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
  const svc = booking.service || {};
  const schedule = booking.schedule || {};
  const userRecord = booking.user || {};

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Bookings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Reference</span>
                <h1 className="text-xl font-bold">{booking.bookingRef}</h1>
              </div>
              <Badge className={`text-xs px-3 py-1 ${getStatusColor(booking.status)}`}>{booking.status}</Badge>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-4xl">
                {svc.category === 'BUS' ? '🚌' : svc.category === 'TRAIN' ? '🚄' : svc.category === 'FLIGHT' ? '✈️' : svc.category === 'HOTEL' ? '🏨' : '🎫'}
              </span>
              <div>
                <h2 className="font-semibold text-lg">{svc.title}</h2>
                <p className="text-sm text-muted-foreground">{svc.category} &middot; Vendor: {svc.vendor?.businessName || 'Arvis X'}</p>
              </div>
            </div>

            {schedule.departureTime && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Departure</p>
                  <p className="font-medium">{formatDate(schedule.departureTime)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(schedule.departureTime).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                  <p className="font-medium">{formatDate(schedule.arrivalTime)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(schedule.arrivalTime).toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Passengers</h3>
              <div className="space-y-2">
                {booking.passengers?.map((p: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/5 flex justify-between items-center text-sm border border-white/5">
                    <span className="font-semibold text-white/95">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.age} yrs &middot; {p.gender}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Customer info, Cancel Actions */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {userRecord.name?.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{userRecord.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">User ID: {userRecord.id?.slice(0,8)}</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-center text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <span>{booking.contactEmail || userRecord.email}</span>
              </div>
              <div className="flex gap-2.5 items-center text-xs text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span>{booking.contactPhone || userRecord.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Ledger Card */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Pricing Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price</span>
                <span>{formatCurrency(booking.totalAmount)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(booking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(booking.taxAmount)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base">
                <span>Final Price</span>
                <span className="premium-gradient-text">{formatCurrency(booking.finalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Cancel Actions */}
          {booking.status !== 'CANCELLED' && (
            <div className="glass p-6 rounded-3xl space-y-3">
              <h3 className="font-semibold text-sm text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Admin Actions
              </h3>
              <p className="text-xs text-muted-foreground">
                Force cancel this booking. If a payment exists, the amount will be automatically refunded back to the user's wallet.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowCancelModal(true)}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500"
              >
                Force Cancel & Refund
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass p-6 max-w-md w-full space-y-4 rounded-3xl border border-white/10"
            >
              <h3 className="text-xl font-semibold">Force Cancel booking</h3>
              <p className="text-sm text-muted-foreground">
                You are about to cancel booking <span className="font-mono text-white">{booking.bookingRef}</span>. The paid final amount of <span className="font-bold text-white">{formatCurrency(booking.finalAmount)}</span> will be credited to the customer's wallet.
              </p>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium block">Reason for Admin Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="e.g., Schedule disrupted, service cancelled by vendor..."
                  className="w-full h-24 rounded-xl border border-white/10 bg-white/5 p-3 text-sm focus:outline-none focus:border-rose-500/50 text-white placeholder-white/30"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowCancelModal(false)} disabled={isCancelling} className="rounded-xl">
                  Dismiss
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelBooking}
                  disabled={isCancelling || !cancelReason.trim()}
                  className="bg-rose-600 hover:bg-rose-500 rounded-xl"
                >
                  {isCancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
