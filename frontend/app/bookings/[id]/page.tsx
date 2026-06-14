'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Users, CreditCard, ArrowLeft, 
  Download, Share2, Ticket, Loader2, AlertTriangle, ShieldAlert 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { bookingApi, paymentApi } from '@/lib/api';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { ClientOnly } from '@/components/shared/client-only';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Cashfree: any;
  }
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const payResp = await paymentApi.createOrder({ bookingId: booking.id });
      const payData = payResp.data;
      const sessionId = payData.data?.paymentSessionId;
      if (!sessionId) throw new Error('No payment session ID');
      if (typeof window.Cashfree !== 'undefined') {
        const cf = new window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox' });
        cf.checkout({ paymentSessionId: sessionId, redirectTarget: '_self' });
      } else {
        throw new Error('Cashfree SDK not loaded');
      }
    } catch (error: any) {
      console.error('[Payment Error]', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error?.message || error?.message || 'Failed to initiate payment';
      toast.error(msg);
    } finally {
      setIsPaying(false);
    }
  };

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none z-0" />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-white/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest animate-pulse font-bold">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
  const svc = booking.service || {};

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden pt-28 pb-16">
      {/* Mesh grid & floating background orbs */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none z-0" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse z-0" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float z-0" />
      {isConfirmed ? (
        <div className="orb w-[300px] h-[300px] bg-emerald-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-orb-pulse z-0" />
      ) : (
        <div className="orb w-[300px] h-[300px] bg-amber-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-orb-pulse z-0" />
      )}

      {/* Floating particles */}
      <ClientOnly>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="absolute w-[2px] h-[2px] rounded-full bg-indigo-400/20"
              style={{ left: `${5 + Math.random() * 90}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -150], opacity: [0, 0.7, 0] }}
              transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 4, ease: 'linear' }} 
            />
          ))}
        </div>
      </ClientOnly>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          
          {/* Back button */}
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Return to Bookings
          </button>

          {/* Main Card */}
          <div className="glass-card-dark border border-white/[0.06] backdrop-blur-3xl shadow-2xl relative overflow-hidden rounded-[32px] bg-black/40">
            {/* Top laser border line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${isConfirmed ? 'from-transparent via-emerald-500 to-transparent' : 'from-transparent via-amber-500 to-transparent'}`} />
            {/* Scanlines layer */}
            <div className="absolute inset-0 scanlines pointer-events-none opacity-[0.15]" />

            {/* Glowing Status Header */}
            <div className={`p-8 border-b border-white/[0.04] relative ${isConfirmed ? 'bg-gradient-to-br from-emerald-500/[0.03] to-transparent' : 'bg-gradient-to-br from-amber-500/[0.03] to-transparent'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isConfirmed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-pulse-glow' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse-glow'}`}>
                    {isConfirmed ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : (
                      <Clock className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.25em] px-2.5 py-1 rounded-md border ${isConfirmed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                      {booking.status}
                    </span>
                    <h1 className="text-2xl font-extrabold tracking-tight mt-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Booking {isConfirmed ? 'Confirmed' : 'Pending Verification'}
                    </h1>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                      Booking ID: <span className="text-white/60 font-mono font-medium">{booking.bookingRef || booking.id?.slice(0, 12).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                
                {/* Live Status Tracker */}
                <div className="flex items-center gap-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 md:w-[280px]">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-bold">
                      <span className="text-white/30">Payment Status</span>
                      <span className={isConfirmed ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                        {isConfirmed ? 'SUCCESS' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-bold">
                      <span className="text-white/30">Ticket Status</span>
                      <span className={isConfirmed ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                        {isConfirmed ? 'ISSUED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-bold">
                      <span className="text-white/30">Booking Sync</span>
                      <span className="text-white/70 font-mono">
                        {isConfirmed ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inner Content */}
            <div className="p-8 space-y-8 relative z-10">
              
              {/* Transit/Lodging Holographic Ticket Header */}
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.06] relative overflow-hidden group hover:border-white/10 transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
                <div className="flex items-center gap-4 relative z-10">
                  <span className="text-4xl bg-white/[0.03] border border-white/[0.06] w-16 h-16 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                    {svc.category === 'BUS' ? '🚌' : svc.category === 'TRAIN' ? '🚄' : svc.category === 'FLIGHT' ? '✈️' : svc.category === 'HOTEL' ? '🏨' : '🎫'}
                  </span>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {svc.category} BOOKING
                    </span>
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-white mt-1 group-hover:text-indigo-300 transition-colors duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {svc.title}
                    </h2>
                    <p className="text-[11px] text-white/45 font-light mt-0.5">
                      Vendor: <span className="text-white/70 font-medium">{svc.vendor?.businessName || 'Arvi-X'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid: Passengers & Payment Details */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Passengers telemetry card */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> Passengers
                  </h3>
                  <div className="space-y-3">
                    {booking.passengers?.map((p: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-300 text-xs font-mono">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-white group-hover:text-indigo-200 transition-colors">{p.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/45 font-mono">{p.age}y &middot; {p.gender}</span>
                      </div>
                    )) || (
                      <p className="text-xs text-white/20 italic">No passenger details</p>
                    )}
                  </div>
                </div>

                {/* Payment Breakdown Cockpit */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Payment Details
                  </h3>
                  <div className="space-y-3.5 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] relative overflow-hidden">
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-white/40 font-medium">Base Amount</span>
                      <span className="font-mono text-white">{formatCurrency(booking.baseAmount || booking.finalAmount)}</span>
                    </div>
                    {booking.discount > 0 && (
                      <div className="flex justify-between text-xs items-center text-emerald-400">
                        <span className="font-medium">Discount</span>
                        <span className="font-mono">-{formatCurrency(booking.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-white/40 font-medium">Taxes & Fees</span>
                      <span className="font-mono text-white">{formatCurrency(booking.tax || 0)}</span>
                    </div>
                    
                    <div className="border-t border-white/[0.06] pt-4 flex justify-between items-baseline">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Total Paid</span>
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-extrabold text-xl tracking-tight font-mono" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {formatCurrency(booking.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div className="flex flex-wrap gap-3.5 pt-6 border-t border-white/[0.04]">
                <Link href={`/bookings/${booking.id}/ticket`}>
                  <Button className="rounded-xl gap-2 h-11 px-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.2)] font-bold text-xs uppercase tracking-widest border-0 transition-all duration-300">
                    <Download className="w-3.5 h-3.5" /> Download Ticket
                  </Button>
                </Link>
                {booking.status === 'CONFIRMED' && (
                  <Button
                    variant="destructive"
                    className="rounded-xl gap-2 h-11 px-5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:text-white font-bold text-xs uppercase tracking-widest transition-all duration-300"
                    onClick={() => setShowRefundModal(true)}
                  >
                    Cancel & Refund
                  </Button>
                )}
                <Button variant="outline" className="rounded-xl h-11 px-5 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest gap-2 transition-all duration-300">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Link href="/user/bookings">
                  <Button variant="ghost" className="rounded-xl h-11 px-5 text-white/40 hover:text-white hover:bg-white/[0.04] font-bold text-xs uppercase tracking-widest transition-all duration-300">
                    All Bookings
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          {/* Pending Payment Widget */}
          {!isConfirmed && (
            <div className="mt-8 glass-card-dark p-8 border border-white/[0.06] backdrop-blur-3xl rounded-[24px] bg-black/40 text-center relative overflow-hidden">
              <div className="absolute inset-0 scanlines pointer-events-none opacity-[0.1]" />
              <div className="relative z-10 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold tracking-tight uppercase text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Payment Required</h3>
                <p className="text-xs text-white/40 mt-1 mb-6">Complete your payment to confirm this booking.</p>
                <Button 
                  onClick={handlePayment} 
                  disabled={isPaying}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.15)] font-bold text-xs uppercase tracking-widest border-0 transition-all duration-300"
                >
                  {isPaying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {isPaying ? 'Connecting to gateway...' : 'Pay Now'}
                </Button>
              </div>
            </div>
          )}

        </motion.div>
      </div>

      <AnimatePresence>
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass p-8 max-w-md w-full space-y-6 rounded-[32px] border border-white/[0.08] relative overflow-hidden bg-black/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              {/* Top alert light */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500 animate-pulse" />
              <div className="absolute inset-0 scanlines pointer-events-none opacity-[0.1]" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Cancel Booking</h3>
                  <p className="text-[10px] text-rose-400/70 uppercase tracking-widest font-bold font-mono">Confirm Cancellation</p>
                </div>
              </div>

              <p className="text-xs text-white/40 leading-relaxed">
                Confirming this action will cancel your reservation. The amount of <span className="text-rose-400 font-bold font-mono">{formatCurrency(booking.finalAmount)}</span> will be refunded to your original payment source.
              </p>

              <div className="space-y-2">
                <label className="text-[9px] text-white/30 uppercase tracking-widest font-bold block">Reason for Cancellation</label>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="e.g., Changed plans, booking mistake..."
                  className="w-full h-24 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs focus:outline-none focus:border-rose-500/40 text-white placeholder-white/20 focus:bg-white/[0.04] transition-all"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setShowRefundModal(false)} disabled={isRefunding} className="rounded-xl text-white/40 hover:text-white hover:bg-white/[0.04] text-xs font-bold uppercase tracking-wider h-11 px-4">
                  No, Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRefund}
                  disabled={isRefunding || !refundReason.trim()}
                  className="bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold uppercase tracking-widest h-11 px-5 shadow-[0_0_20px_rgba(239,68,68,0.2)] border-0"
                >
                  {isRefunding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Cancellation
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
