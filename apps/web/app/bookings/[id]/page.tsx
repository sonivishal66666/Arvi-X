'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Users, CreditCard, ArrowLeft, Download, Share2, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bookingApi, paymentApi } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Please enter a reason for cancellation');
      return;
    }
    setIsRefunding(true);
    try {
      await paymentApi.refund(booking.id, refundReason);
      toast.success('Booking cancelled and refund processed!');
      const { data } = await bookingApi.getById(booking.id);
      setBooking(data.booking);
      setShowRefundModal(false);
    } catch (error: any) {
      console.error('[Refund]', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error?.message || 'Failed to request refund';
      toast.error(msg);
    } finally {
      setIsRefunding(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      bookingApi.getById(params.id as string)
        .then(({ data }) => setBooking(data.booking))
        .catch(() => router.push('/user/bookings'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
  const svc = booking.service || {};

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="orb w-[400px] h-[400px] bg-emerald-500/10 top-0 -right-48" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="glass rounded-3xl overflow-hidden mb-8">
            <div className={`p-8 ${isConfirmed ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent' : 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {isConfirmed ? (
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <Clock className="w-8 h-8 text-amber-500" />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">
                        Booking {isConfirmed ? 'Confirmed' : 'Pending'}
                      </h1>
                      <p className="text-muted-foreground text-sm">ID: {booking.id?.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <Badge className={`text-sm px-4 py-1.5 ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </Badge>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                <span className="text-4xl">
                  {svc.category === 'BUS' ? '🚌' : svc.category === 'TRAIN' ? '🚄' : svc.category === 'FLIGHT' ? '✈️' : svc.category === 'HOTEL' ? '🏨' : '🎫'}
                </span>
                <div>
                  <h2 className="text-lg font-semibold">{svc.title}</h2>
                  <p className="text-sm text-muted-foreground">{svc.category} &middot; {svc.vendor?.businessName || 'Arvis X'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Passengers
                  </h3>
                  <div className="space-y-2">
                    {booking.passengers?.map((p: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                        <span className="font-medium text-sm">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.age}y &middot; {p.gender}</span>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No passenger details</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment Details
                  </h3>
                  <div className="space-y-3 p-4 rounded-2xl bg-white/5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Amount</span>
                      <span>{formatCurrency(booking.baseAmount || booking.finalAmount)}</span>
                    </div>
                    {booking.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-green-500">-{formatCurrency(booking.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span>{formatCurrency(booking.tax || 0)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
                      <span>Total Paid</span>
                      <span className="premium-gradient-text">{formatCurrency(booking.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <Link href={`/bookings/${booking.id}/ticket`}>
                  <Button className="rounded-xl gap-2">
                    <Download className="w-4 h-4" /> Download Ticket
                  </Button>
                </Link>
                {booking.status === 'CONFIRMED' && (
                  <Button
                    variant="destructive"
                    className="rounded-xl gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 hover:text-white"
                    onClick={() => setShowRefundModal(true)}
                  >
                    Cancel & Refund
                  </Button>
                )}
                <Button variant="outline" className="rounded-xl glass-button gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Link href="/user/bookings">
                  <Button variant="ghost" className="rounded-xl">
                    All Bookings
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {!isConfirmed && (
            <div className="glass rounded-2xl p-6 text-center">
              <Ticket className="w-10 h-10 mx-auto mb-3 text-amber-500" />
              <h3 className="font-medium mb-1">Payment Pending</h3>
              <p className="text-sm text-muted-foreground mb-4">Complete your payment to confirm this booking</p>
              <Button className="rounded-xl">
                <CreditCard className="w-4 h-4 mr-2" /> Pay Now
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showRefundModal && (
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
              <h3 className="text-xl font-semibold">Cancel Booking & Request Refund</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel this booking? The full amount of <span className="text-foreground font-medium">{formatCurrency(booking.finalAmount)}</span> will be refunded to your payment source / wallet.
              </p>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium block">Reason for Cancellation</label>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="e.g., Change of plans, medical emergency..."
                  className="w-full h-24 rounded-xl border border-white/10 bg-white/5 p-3 text-sm focus:outline-none focus:border-rose-500/50 text-white placeholder-white/30"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowRefundModal(false)} disabled={isRefunding} className="rounded-xl">
                  No, Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRefund}
                  disabled={isRefunding || !refundReason.trim()}
                  className="bg-rose-600 hover:bg-rose-500 rounded-xl"
                >
                  {isRefunding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Cancellation
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
