'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
Loader2, ChevronLeft, User, Phone, CreditCard, Compass, Shield, ArrowRight,
  Plus, CheckCircle, Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { servicesApi, bookingApi, paymentApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore, useBookingStore } from '@/lib/store';
import { SeatMap } from '@/components/booking/seat-map';
import toast from 'react-hot-toast';

declare global { interface Window { Cashfree: any } }

const ease = [0.16, 1, 0.3, 1];
const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease } };

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedSeats, clearSeats } = useBookingStore();
  const serviceId = searchParams.get('serviceId');
  const scheduleId = searchParams.get('scheduleId');

  const [service, setService] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '', seatNumber: '' }]);
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const baseFare = service ? service.basePrice * passengers.filter(p => p.name).length : 0;
      const resp = await bookingApi.validateCoupon(couponCode, serviceId || undefined, baseFare);
      if (resp.data.valid) {
        setAppliedCoupon(resp.data.coupon);
        toast.success(`Coupon ${resp.data.coupon.code} applied successfully!`);
      } else {
        toast.error(resp.data.message || 'Invalid coupon');
      }
    } catch (error: any) {
      console.error('[Apply Coupon]', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error?.message || 'Failed to validate coupon';
      toast.error(msg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  useEffect(() => {
    if (serviceId) {
      servicesApi.getById(serviceId)
        .then(({ data }) => {
          setService(data.service);
          const schedules = data.service?.schedules || [];
          const selected = scheduleId ? schedules.find((s: any) => s.id === scheduleId) : schedules[0];
          if (selected) setSchedule(selected);
        })
        .catch(() => toast.error('Service not found'))
        .finally(() => setIsLoading(false));
    }
  }, [serviceId, scheduleId]);

  useEffect(() => {
    return () => { clearSeats(); };
  }, [clearSeats]);

  const handleAddPassenger = () => {
    if (passengers.length >= (schedule?.availableSeats || 50)) {
      toast.error('Max passengers reached');
      return;
    }
    const seatNum = selectedSeats[passengers.length] ? `Seat ${passengers.length + 1}` : '';
    setPassengers([...passengers, { name: '', age: '', gender: '', seatNumber: seatNum }]);
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    (updated[index] as any)[field] = value;
    setPassengers(updated);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!contactPhone.trim()) { toast.error('Contact phone required'); return; }
    if (!passengers.some(p => p.name.trim())) { toast.error('At least one passenger required'); return; }
    setIsProcessing(true);
    let bookingId: string | null = null;
    try {
      const payload: any = {
        serviceId,
        scheduleId: scheduleId || undefined,
        passengers: passengers.filter(p => p.name).map(p => ({
          name: p.name,
          age: p.age ? Number(p.age) : undefined,
          gender: p.gender || undefined,
        })),
        contactPhone,
        contactEmail: contactEmail || undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      if (selectedSeats.length > 0) payload.seatIds = selectedSeats;

      const resp = await bookingApi.create(payload);
      bookingId = resp.data.booking.id;

      if (service?.category === 'BUS' || service?.category === 'FLIGHT' || service?.category === 'TRAIN' || service?.category === 'HOTEL' || service?.category === 'EVENT') {
        const payResp = await paymentApi.createOrder({ bookingId: bookingId! });
        const payData = payResp.data;
        const sessionId = payData.data?.paymentSessionId;
        if (!sessionId) throw new Error('No payment session ID');
        if (typeof window.Cashfree !== 'undefined') {
          const cf = new window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox' });
          cf.checkout({ paymentSessionId: sessionId, redirectTarget: '_self' });
        } else throw new Error('Cashfree SDK not loaded');
      } else {
        router.push(`/bookings/${bookingId}`);
      }
    } catch (error: any) {
      console.error('[Booking] Error:', error);
      const msg = error?.response?.data?.error?.message || error?.message || 'Booking failed';
      toast.error(msg);
      if (bookingId) router.push(`/bookings/${bookingId}`);
      setIsProcessing(false);
    }
  };

  const totalAmount = service ? service.basePrice * passengers.filter(p => p.name).length : 0;
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      const val = (totalAmount * appliedCoupon.discountValue) / 100;
      discountAmount = appliedCoupon.maxDiscount ? Math.min(val, appliedCoupon.maxDiscount) : val;
    } else {
      discountAmount = appliedCoupon.maxDiscount ? Math.min(appliedCoupon.discountValue, appliedCoupon.maxDiscount) : appliedCoupon.discountValue;
    }
  }
  const taxAmount = Math.max(0, totalAmount - discountAmount) * 0.18;
  const finalAmount = Math.max(0, totalAmount - discountAmount) + taxAmount;

  // Compute visual step dynamically
  const getActiveStep = () => {
    if (service?.category === 'BUS' && selectedSeats.length === 0) return 2; // seat select
    if (passengers.some(p => p.name.trim())) return 3; // secure checkout ready
    return 2; // passenger info
  };
  const activeStep = getActiveStep();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-black">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-white/[0.08]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest animate-pulse">Initializing Interface...</p>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden pt-28 pb-16 relative">
      {/* Background orbs & mesh grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.05] blur-[150px] animate-orb-pulse" />
        <div className="absolute -bottom-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-purple-500/[0.03] blur-[150px] animate-orb-pulse animation-delay-4000" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors group w-fit">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          {/* Futuristic HUD Checkout Timeline */}
          <div className="flex-1 max-w-md md:ml-auto">
            <div className="relative flex items-center justify-between">
              {/* Timeline connecting line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/10 -z-10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500"
                  style={{ width: activeStep === 2 ? '50%' : activeStep === 3 ? '100%' : '0%' }}
                />
              </div>
              
              {[
                { num: 1, label: 'Details' },
                { num: 2, label: service.category === 'BUS' ? 'Seats' : 'Passengers' },
                { num: 3, label: 'Payment' }
              ].map((s) => {
                const isActive = activeStep >= s.num;
                const isCurrent = activeStep === s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center relative">
                    <motion.div 
                      animate={isCurrent ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 10px rgba(99,102,241,0.4)', '0 0 0px rgba(99,102,241,0)'] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold transition-all duration-500 ${
                        isActive 
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 text-white' 
                          : 'bg-black border-white/[0.08] text-white/30'
                      }`}
                    >
                      {s.num}
                    </motion.div>
                    <span className={`text-[9px] mt-1.5 tracking-widest uppercase font-semibold transition-colors duration-500 ${
                      isActive ? 'text-white/70' : 'text-white/20'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Service details */}
            <motion.div {...fadeInUp}>
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md overflow-hidden">
                <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                <div className="relative z-10 flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/[0.08] flex items-center justify-center text-3xl">
                    {service.category === 'BUS' ? '🚌' : service.category === 'TRAIN' ? '🚄' : service.category === 'FLIGHT' ? '✈️' : service.category === 'HOTEL' ? '🏨' : '🎫'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold tracking-tight truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{service.title}</h1>
                    <p className="text-xs text-white/45 mt-0.5">{service.vendor?.businessName} &middot; {service.category}</p>
                  </div>
                  <Badge className="text-[10px] tracking-wider font-bold bg-white/[0.03] text-white/60 border border-white/[0.08] px-3.5 py-1 rounded-lg">{service.category}</Badge>
                </div>

                {schedule && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <div className="text-left">
                      <p className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{new Date(schedule.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] text-white/30 mt-0.5 font-medium uppercase">{formatDate(schedule.departureTime)}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mb-1">{Math.floor(schedule.duration / 60)}h {schedule.duration % 60}m</p>
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] text-white/35 font-semibold uppercase tracking-wider">{schedule.availableSeats} seats left</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{new Date(schedule.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] text-white/30 mt-0.5 font-medium uppercase">{formatDate(schedule.arrivalTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 2. Seat Selection (If BUS) */}
            {service.category === 'BUS' && scheduleId && (
              <motion.div {...fadeInUp}>
                <div className="relative rounded-2xl p-6 bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md overflow-hidden">
                  <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      <span className="w-6 h-6 rounded-lg bg-cyan-950/45 text-cyan-300 border border-cyan-800/40 flex items-center justify-center text-xs">2</span>
                      Select Seating Pods
                    </h2>
                    {selectedSeats.length > 0 && (
                      <Badge className="bg-cyan-950/45 text-cyan-300 border border-cyan-800/40 text-[10px] font-bold rounded-lg px-2.5 py-0.5">{selectedSeats.length} selected</Badge>
                    )}
                  </div>
                  <SeatMap serviceId={serviceId!} scheduleId={scheduleId} />
                </div>
              </motion.div>
            )}

            {/* 3. Passengers details */}
            <motion.div {...fadeInUp}>
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md overflow-hidden">
                <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <span className="w-6 h-6 rounded-lg bg-emerald-950/45 text-emerald-300 border border-emerald-800/40 flex items-center justify-center text-xs">
                      {service.category === 'BUS' ? '3' : '2'}
                    </span>
                    Passenger Details
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleAddPassenger} className="rounded-lg gap-1.5 text-xs text-white/50 hover:text-white bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] px-3 py-1">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Passenger
                  </Button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {passengers.map((passenger, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0, y: 15 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -15 }}
                        transition={{ duration: 0.3, ease }}
                        className="relative p-5 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:border-indigo-500/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-indigo-300">
                              {i + 1}
                            </div>
                            <span className="text-xs font-bold tracking-wider uppercase text-white/60">Passenger {i + 1}</span>
                          </div>
                          {passengers.length > 1 && (
                            <button onClick={() => handleRemovePassenger(i)} className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-medium">Remove</button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1.5 block">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                              <Input
                                value={passenger.name}
                                onChange={(e) => handlePassengerChange(i, 'name', e.target.value)}
                                placeholder="e.g. John Doe"
                                className="pl-10 h-11 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/30 focus:ring-indigo-500/20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1.5 block">Age</label>
                            <Input
                              type="number"
                              value={passenger.age}
                              onChange={(e) => handlePassengerChange(i, 'age', e.target.value)}
                              placeholder="25"
                              className="h-11 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/30 focus:ring-indigo-500/20"
                              min={1}
                              max={120}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1.5 block">Gender</label>
                            <select
                              value={passenger.gender}
                              onChange={(e) => handlePassengerChange(i, 'gender', e.target.value)}
                              className="w-full h-11 rounded-xl border border-white/[0.06] bg-black px-3 text-xs text-white/70 focus:border-indigo-500/30 transition-all cursor-pointer"
                            >
                              <option value="">Select</option>
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Contact HUD inputs */}
                <div className="mt-6 pt-6 border-t border-white/[0.04] grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1.5 block flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" /> Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Phone for payment updates"
                      className="h-11 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/30 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1.5 block">
                      @ Email
                    </label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Email for e-ticket"
                      className="h-11 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/30 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28 space-y-4">
              
              {/* Futuristic Boarding Pass Board */}
              <div className="relative rounded-2xl bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md overflow-hidden p-6 space-y-5">
                <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                
                {/* Boarding pass notches */}
                <div className="absolute top-[38%] -left-3.5 w-6 h-6 rounded-full bg-black border border-white/[0.04] z-20" />
                <div className="absolute top-[38%] -right-3.5 w-6 h-6 rounded-full bg-black border border-white/[0.04] z-20" />
                
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Ticket className="w-4 h-4 text-cyan-400" /> Biometric Ticket
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">AI Verified</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-light">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] relative">
                    <span className="text-2xl">
                      {service.category === 'BUS' ? '🚌' : service.category === 'TRAIN' ? '🚄' : service.category === 'FLIGHT' ? '✈️' : service.category === 'HOTEL' ? '🏨' : '🎫'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{service.title}</p>
                      <p className="text-[9px] text-white/30 uppercase mt-0.5 tracking-wider font-semibold">{service.category}</p>
                    </div>
                  </div>

                  {/* Boarding Pass Dashed separator */}
                  <div className="h-[1px] border-t border-dashed border-white/10 pt-2" />

                  {/* Coupon widget */}
                  <div className="pb-1">
                    <label className="text-[9px] text-white/35 uppercase tracking-widest font-bold mb-1.5 block">Promo / Voucher Code</label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs">
                        <span className="text-emerald-400 font-semibold text-[11px] tracking-wide">{appliedCoupon.code} Applied</span>
                        <button onClick={handleRemoveCoupon} className="text-rose-400 font-semibold hover:underline text-[11px]">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="ENTER CODE"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          className="h-9 text-xs bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/30"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="h-9 px-3 rounded-xl text-xs bg-white/10 hover:bg-white/20 text-white"
                        >
                          {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/[0.04] pt-3 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-white/40">Base fare</span>
                      <span className="font-mono">{formatCurrency(service.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Passengers</span>
                      <span className="font-mono">{passengers.filter(p => p.name).length || 1}</span>
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/40">Seats selected</span>
                        <span className="font-mono">{selectedSeats.length}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/40">Taxes & Fees (18%)</span>
                      <span className="font-mono">{formatCurrency(taxAmount)}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.04] pt-3.5 space-y-1">
                    <div className="flex justify-between font-bold text-lg items-baseline">
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Total</span>
                      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-extrabold text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {formatCurrency(finalAmount)}
                      </span>
                    </div>
                    <p className="text-[8px] text-white/20 text-right uppercase tracking-widest">Biometric ticket payload included</p>
                  </div>
                </div>

                <Button
                  className="w-full h-11 rounded-xl text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 border-0"
                  onClick={handleSubmit}
                  disabled={isProcessing || !passengers.some(p => p.name.trim())}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Compass className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing Payload...' : `Pay ${formatCurrency(finalAmount)}`}
                </Button>

                <div className="flex items-center gap-2 text-[10px] text-white/25 justify-center mt-3">
                  <Shield className="w-3.5 h-3.5 text-indigo-400/50" />
                  Secured Cashfree Network
                </div>
              </div>

              {/* Guarantees HUD */}
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-2 text-[11px] font-light text-white/45">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Free cancellations within 1 hour
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Instant e-ticket dispatch
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 24/7 holographic support
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-20 bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
