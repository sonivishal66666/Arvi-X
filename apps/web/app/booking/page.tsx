'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight, User, Phone, CreditCard, Sparkles, Shield, ArrowRight, Plus, Minus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { servicesApi, bookingApi, paymentApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore, useBookingStore } from '@/lib/store';
import { SeatMap } from '@/components/booking/seat-map';
import toast from 'react-hot-toast';

declare global { interface Window { Cashfree: any } }

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

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
  const [step, setStep] = useState(1);
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

      if (service?.category === 'BUS' || service?.category === 'FLIGHT' || service?.category === 'TRAIN') {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="orb w-[600px] h-[600px] bg-primary/5 top-0 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/5 bottom-0 -right-48" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp}>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div {...fadeInUp}>
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
                    {service.category === 'BUS' ? '🚌' : service.category === 'TRAIN' ? '🚄' : service.category === 'FLIGHT' ? '✈️' : service.category === 'HOTEL' ? '🏨' : '🎫'}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold">{service.title}</h1>
                    <p className="text-sm text-muted-foreground">{service.vendor?.businessName} &middot; {service.category}</p>
                  </div>
                  <Badge className="text-sm px-4 py-1.5 glass">{service.category}</Badge>
                </div>

                {schedule && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{new Date(schedule.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(schedule.departureTime)}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-1">{Math.floor(schedule.duration / 60)}h {schedule.duration % 60}m</p>
                      <div className="w-full h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground">{schedule.availableSeats} seats left</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{new Date(schedule.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(schedule.arrivalTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {service.category === 'BUS' && scheduleId && (
              <motion.div {...fadeInUp}>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs">2</span>
                      Select Seats
                    </h2>
                    {selectedSeats.length > 0 && (
                      <Badge variant="premium" className="px-3">{selectedSeats.length} selected</Badge>
                    )}
                  </div>
                  <SeatMap serviceId={serviceId!} scheduleId={scheduleId} />
                </div>
              </motion.div>
            )}

            <motion.div {...fadeInUp}>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-xs">3</span>
                    Passenger Details
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleAddPassenger} className="rounded-xl gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {passengers.map((passenger, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium">Passenger {i + 1}</span>
                          </div>
                          {passengers.length > 1 && (
                            <button onClick={() => handleRemovePassenger(i)} className="text-xs text-destructive hover:underline">Remove</button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input
                                value={passenger.name}
                                onChange={(e) => handlePassengerChange(i, 'name', e.target.value)}
                                placeholder="e.g. John Doe"
                                className="pl-9 h-11"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                            <Input
                              type="number"
                              value={passenger.age}
                              onChange={(e) => handlePassengerChange(i, 'age', e.target.value)}
                              placeholder="25"
                              className="h-11"
                              min={1}
                              max={120}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                            <select
                              value={passenger.gender}
                              onChange={(e) => handlePassengerChange(i, 'gender', e.target.value)}
                              className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm"
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

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Contact Phone <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Phone for payment updates"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-1">
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-xs">@</span> Email
                    </label>
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Email for e-ticket"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28 space-y-4">
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Booking Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <span className="text-2xl">
                      {service.category === 'BUS' ? '🚌' : service.category === 'TRAIN' ? '🚄' : service.category === 'FLIGHT' ? '✈️' : service.category === 'HOTEL' ? '🏨' : '🎫'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{service.title}</p>
                      <p className="text-xs text-muted-foreground">{service.category}</p>
                    </div>
                  </div>

                  {/* Coupon entry widget */}
                  <div className="pt-2 border-t border-white/10 pb-2">
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Promo Code / Voucher</label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <span className="text-emerald-400 font-semibold">{appliedCoupon.code} Applied</span>
                        <button onClick={handleRemoveCoupon} className="text-rose-400 font-semibold hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="ENTER CODE"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          className="h-9 text-xs glass"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="h-9 px-3 rounded-lg text-xs"
                        >
                          {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border/50 pt-2" />

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base fare</span>
                    <span>{formatCurrency(service.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span>{passengers.filter(p => p.name).length || 1}</span>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seats</span>
                      <span>{selectedSeats.length}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes (18%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>

                  <div className="border-t border-border/50 pt-3 space-y-1">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="premium-gradient-text">{formatCurrency(finalAmount)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-right">Incl. all taxes</p>
                  </div>
                </div>

                <Button
                  className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25"
                  onClick={handleSubmit}
                  disabled={isProcessing || !passengers.some(p => p.name.trim())}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : `Pay ${formatCurrency(finalAmount)}`}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <Shield className="w-3 h-3" />
                  Secured by Cashfree
                </div>
              </div>

              <div className="glass p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Free cancellation within 1 hour
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Instant e-ticket via email
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> 24/7 customer support
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
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
