'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
Star, MapPin, Clock, Calendar, ChevronLeft, Loader2, Shield, Users,
  Wifi, Coffee, ArrowRight, Compass, Zap, Bus, Train, Plane,
  Hotel, Ticket, CheckCircle, Image as ImageIcon, X, ChevronRight, ChevronLeft as ChevronLeftIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { servicesApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { useAuthStore } from '@/lib/store';
import { ClientOnly } from '@/components/shared/client-only';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

const categoryConfig: Record<string, { icon: any; gradient: string; glow: string; label: string; glowColor: string }> = {
  BUS: { icon: Bus, gradient: 'from-indigo-500 to-cyan-500', glow: 'rgba(99,102,241,0.15)', glowColor: '#6366f1', label: 'Bus' },
  TRAIN: { icon: Train, gradient: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.15)', glowColor: '#10b981', label: 'Train' },
  FLIGHT: { icon: Plane, gradient: 'from-purple-500 to-pink-500', glow: 'rgba(168,85,247,0.15)', glowColor: '#a855f7', label: 'Flight' },
  HOTEL: { icon: Hotel, gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.15)', glowColor: '#f59e0b', label: 'Hotel' },
  EVENT: { icon: Ticket, gradient: 'from-rose-500 to-red-500', glow: 'rgba(244,63,94,0.15)', glowColor: '#f43f5e', label: 'Event' },
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fromVal = searchParams.get('from') || '';
  const toVal = searchParams.get('to') || '';

  useEffect(() => {
    if (params.id) {
      servicesApi.getById(params.id as string)
        .then(({ data }) => setService(data.service))
        .catch(() => toast.error('Service not found'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/[0.08] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest animate-pulse">Loading telemetry</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Telemetry Lost</h2>
          <Button onClick={() => router.back()} className="rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/[0.1]">Go back</Button>
        </div>
      </div>
    );
  }

  const handleBook = (scheduleId?: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const params = new URLSearchParams({ serviceId: service.id });
    if (scheduleId) params.set('scheduleId', scheduleId);
    router.push(`/booking?${params}`);
  };

  const cat = categoryConfig[service.category] || categoryConfig.EVENT;
  const Icon = cat.icon;

  const scorePct = Math.round((service.rating || 4.5) * 20);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Dynamic Backdrops */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full blur-[150px] animate-orb-pulse opacity-30" 
          style={{ background: cat.glowColor + '20' }}
        />
        <div 
          className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] rounded-full blur-[150px] animate-orb-pulse animation-delay-4000 opacity-20"
          style={{ background: cat.glowColor + '10' }}
        />
      </div>
      <div className="fixed inset-0 grid-bg opacity-15 pointer-events-none z-0" />

      {/* Dynamic Background Particles */}
      <ClientOnly>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="absolute w-[2px] h-[2px] rounded-full"
              style={{ 
                left: `${10 + Math.random() * 80}%`, 
                top: `${Math.random() * 100}%`,
                backgroundColor: cat.glowColor + '40'
              }}
              animate={{ y: [0, -200], opacity: [0, 0.7, 0] }}
              transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 4, ease: 'linear' }} 
            />
          ))}
        </div>
      </ClientOnly>

      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease }}>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs text-white/35 hover:text-white/70 mb-8 transition-colors group uppercase tracking-widest font-medium"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO CONSOLE
            </button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ═══ Left Column ═══ */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Hero Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div 
                    className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 border border-white/[0.08] shadow-lg`}
                    style={{ boxShadow: `0 8px 30px ${cat.glowColor}15` }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                    <div className="absolute -top-2 -right-2">
                      <WishlistButton serviceId={service.id} className="w-8 h-8 rounded-xl glass border-white/[0.08]" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`bg-gradient-to-r ${cat.gradient} text-white border-0 text-[9px] uppercase font-bold tracking-wider rounded-md px-2.5 py-1`}>
                        {service.category}
                      </Badge>
                      {service.discountPercent > 0 && (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold tracking-wider rounded-md px-2.5 py-1 uppercase">
                          -{service.discountPercent}% COMPONENT DISCOUNT
                        </Badge>
                      )}
                    </div>
                    <h1
                      className="text-3xl md:text-5xl font-bold tracking-tight text-white"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {service.title}
                    </h1>
                    <p className="text-white/40 text-sm font-medium tracking-wide uppercase">{service.vendor?.businessName || 'ARVIS DIRECT SECURE'}</p>
                  </div>
                </div>
              </motion.div>

              {/* Glowing separator */}
              <div className="w-full h-px"><div className="line-glow w-full" style={{ background: `linear-gradient(90deg, transparent, ${cat.glowColor}50, transparent)` }} /></div>

              {/* Holographic Image Gallery */}
              {service.images && service.images.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: 0.1, duration: 0.6, ease }}
                  className="space-y-3"
                >
                  <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-black/40 aspect-[16/9] group/gallery">
                    {/* Futuristic scanline filter */}
                    <div className="absolute inset-0 scanlines pointer-events-none opacity-40 z-10" />
                    <motion.img 
                      key={activeImgIndex}
                      src={service.images[activeImgIndex]} 
                      alt={service.title} 
                      className="w-full h-full object-cover group-hover/gallery:scale-[1.03] transition-transform duration-700 cursor-pointer"
                      onClick={() => setIsLightboxOpen(true)}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-xs text-white/70 z-20">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span className="font-semibold">{activeImgIndex + 1} / {service.images.length}</span>
                    </div>
                  </div>
                  {service.images.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                      {service.images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImgIndex(idx)}
                          className={`relative w-20 h-14 rounded-xl overflow-hidden border transition-all duration-300 shrink-0 ${
                            activeImgIndex === idx 
                              ? 'border-white/80 scale-95 shadow-[0_0_15px_rgba(255,255,255,0.15)] opacity-100' 
                              : 'border-white/10 opacity-40 hover:opacity-100'
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="relative rounded-3xl overflow-hidden border border-white/[0.08] aspect-[16/9] bg-gradient-to-br from-indigo-950/20 via-black to-purple-950/10 flex items-center justify-center"
                >
                  <div className="absolute inset-0 grid-bg opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.02] via-transparent to-purple-500/[0.02]" />
                  <div className="text-center relative z-10 space-y-2">
                    <div 
                      className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.gradient} bg-opacity-20 border border-white/[0.08] flex items-center justify-center`}
                      style={{ boxShadow: `0 8px 20px ${cat.glowColor}10` }}
                    >
                      <Icon className="w-6 h-6 text-white/80" />
                    </div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">HOLOGRAPHIC BLUEPRINT READY</p>
                  </div>
                </motion.div>
              )}

              {/* Animated Transit Route Tracker */}
              {['FLIGHT', 'TRAIN', 'BUS'].includes(service.category) && (fromVal || toVal) && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.15, duration: 0.6, ease }}
                  className="glass-card-dark p-6 border border-white/5 rounded-3xl relative overflow-hidden bg-black/30"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${cat.glowColor}30, transparent)` }} />
                  <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4">Route Telemetry Track</h3>
                  <div className="flex items-center justify-between relative px-6 py-4">
                    <div className="text-left relative z-10">
                      <p className="text-xl md:text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{fromVal || 'Origin'}</p>
                      <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mt-1 block">DEPARTURE PORT</span>
                    </div>
                    <div className="flex-1 mx-6 relative flex items-center justify-center">
                      <div className="w-full h-[2px] bg-white/[0.04] relative">
                        <motion.div
                          className={`absolute top-0 bottom-0 bg-gradient-to-r ${cat.gradient}`}
                          initial={{ left: '0%', right: '100%' }}
                          animate={{ left: '0%', right: '0%' }}
                          transition={{ duration: 1.5, ease }}
                        />
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center border bg-black"
                          style={{ borderColor: cat.glowColor }}
                          animate={{ left: ['0%', '100%'] }}
                          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                        >
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cat.glowColor }}
                            animate={{ scale: [1, 1.8, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="text-xl md:text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{toVal || 'Destination'}</p>
                      <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mt-1 block">ARRIVAL PORT</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Details & About */}
              {service.description && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2, duration: 0.6, ease }}
                  className="glass-card-dark p-6 border border-white/5 rounded-3xl bg-black/20"
                >
                  <h2 className="text-sm font-semibold mb-4 uppercase tracking-widest text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Overview</h2>
                  <p className="text-white/40 leading-relaxed font-light text-sm">{service.description}</p>
                </motion.div>
              )}

              {/* Amenities */}
              {service.amenities && service.amenities.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.25, duration: 0.6, ease }}
                  className="space-y-4"
                >
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Amenities & Core Features</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {service.amenities.map((a: string) => (
                      <span
                        key={a}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.02] text-white/50 border border-white/[0.05] hover:border-white/10 hover:text-white hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02] cursor-default"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Available Schedules */}
              {service.schedules && service.schedules.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3, duration: 0.6, ease }}
                  className="space-y-4"
                >
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Departure Log & Schedules</h2>
                  <div className="space-y-3">
                    {service.schedules.map((schedule: any) => (
                      <div
                        key={schedule.id}
                        className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all duration-500 overflow-hidden gap-4"
                      >
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.01] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex items-center gap-6 md:gap-8 flex-1 w-full">
                          <div className="text-center shrink-0">
                            <p className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatTime(schedule.departureTime)}</p>
                            <p className="text-[9px] text-white/30 font-bold uppercase mt-1 tracking-wider">{formatDate(schedule.departureTime)}</p>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center px-2">
                            <p className="text-[9px] text-white/20 mb-1 uppercase tracking-widest font-bold">{schedule.duration} MIN DURATION</p>
                            <div className="w-full h-px bg-white/10 relative">
                              <motion.div
                                animate={{ boxShadow: ['0 0 4px rgba(255,255,255,0.2)', '0 0 12px rgba(255,255,255,0.6)', '0 0 4px rgba(255,255,255,0.2)'] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/50"
                              />
                            </div>
                          </div>

                          <div className="text-center shrink-0">
                            <p className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatTime(schedule.arrivalTime)}</p>
                            <p className="text-[9px] text-white/30 font-bold uppercase mt-1 tracking-wider">{formatDate(schedule.arrivalTime)}</p>
                          </div>
                        </div>

                        <div className="relative z-10 flex md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto border-t border-white/[0.04] md:border-t-0 pt-4 md:pt-0 ml-0 md:ml-6 shrink-0 gap-3">
                          <div className="text-left md:text-right">
                            <p className="text-xl font-extrabold text-white text-glow-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                              {formatCurrency(schedule.dynamicPrice || schedule.basePrice)}
                            </p>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-wider mt-0.5">{schedule.availableSeats} berths remaining</p>
                          </div>
                          <Button
                            size="sm"
                            className="rounded-lg bg-white/5 hover:bg-white/15 text-white text-[10px] uppercase tracking-wider font-bold border border-white/10 px-4 py-2"
                            onClick={() => handleBook(schedule.id)}
                          >
                            LOCK FARE <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Reviews */}
              {service.reviews && service.reviews.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.35, duration: 0.6, ease }}
                  className="space-y-4"
                >
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Telemetry Reviews</h2>
                  <div className="space-y-3">
                    {service.reviews.map((review: any) => (
                      <div key={review.id} className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-white/60 border border-white/[0.05]">
                            {review.user?.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white/70">{review.user?.name}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-white/40 font-light leading-relaxed">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ═══ Right Column — Sticky Sidebar ═══ */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease }}
                className="sticky top-28 space-y-4 z-10"
              >
                {/* Cockpit booking console */}
                <div 
                  className="rounded-3xl bg-black/60 border border-white/[0.06] backdrop-blur-2xl p-6 space-y-6 relative overflow-hidden"
                  style={{ boxShadow: `0 12px 40px ${cat.glowColor}05` }}
                >
                  {/* Neon border strip */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${cat.gradient}`} />
                  
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">FARE BEACON</p>
                    <div className="flex items-baseline gap-2.5">
                      <span
                        className="text-4xl md:text-5xl font-extrabold tracking-tight text-white text-glow"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {formatCurrency(service.basePrice * (1 - service.discountPercent / 100))}
                      </span>
                      {service.discountPercent > 0 && (
                        <span className="text-sm text-white/20 line-through font-light">{formatCurrency(service.basePrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* Rating indicator widget */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 flex items-center gap-4">
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-white/[0.04]"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <motion.path
                          className="text-amber-500"
                          strokeWidth="2.5"
                          strokeDasharray={`${scorePct}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          initial={{ strokeDasharray: '0, 100' }}
                          animate={{ strokeDasharray: `${scorePct}, 100` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </svg>
                      <span className="absolute text-xs font-extrabold text-white/80">{service.rating || '4.5'}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">Score Value</p>
                      <p className="text-xs text-white/40 mt-0.5">{service._count?.reviews || 0} reviews logged</p>
                    </div>
                  </div>

                  {service.hotel && (
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-xs border-b border-white/[0.04] pb-2">
                        <span className="text-white/30 font-bold uppercase">Stay class</span>
                        <span className="font-bold text-white/70">{service.hotel.propertyType}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-[9px] text-white/30 block uppercase tracking-wider">CHECK-IN</span>
                          <span className="font-semibold text-white/70 text-sm mt-0.5 block">{service.hotel.checkInTime}</span>
                        </div>
                        <div className="flex-1 text-right">
                          <span className="text-[9px] text-white/30 block uppercase tracking-wider">CHECK-OUT</span>
                          <span className="font-semibold text-white/70 text-sm mt-0.5 block">{service.hotel.checkOutTime}</span>
                        </div>
                      </div>
                      <div className="text-center bg-white/[0.03] py-1.5 rounded-lg border border-white/[0.04]">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">{service.hotel.starRating} STAR RATING</span>
                      </div>
                    </div>
                  )}

                  {service.event && (
                    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-2.5 text-sm">
                      <p className="flex items-center gap-2.5 text-white/40 font-light">
                        <Calendar className="w-4 h-4 text-white/20" />
                        {formatDate(service.event.startDate, 'long')}
                      </p>
                      <p className="flex items-center gap-2.5 text-white/40 font-light">
                        <MapPin className="w-4 h-4 text-white/20" />
                        {service.event.venue}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <Shield className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-white/45 font-medium">Secure instant booking verification</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Clock className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-white/45 font-medium">Free cancellation window (1hr)</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Zap className="w-4 h-4 text-emerald-400/70" />
                      <span className="text-white/45 font-medium">Instant cockpit boarding pass</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full h-13 rounded-xl text-xs uppercase tracking-widest bg-gradient-to-r ${cat.gradient} hover:brightness-110 font-bold border-0 transition-all duration-300`}
                    style={{ boxShadow: `0 8px 30px ${cat.glowColor}25` }}
                    onClick={() => handleBook()}
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    CONFIRM BOOKING
                  </Button>
                </div>

                {/* Trust Badges Panel */}
                <div className="rounded-2xl bg-white/[0.01] border border-white/[0.04] p-4 space-y-2.5">
                  {['Free cancellation within 1 hour', 'Instant e-ticket via email', '24/7 customer support'].map((text) => (
                    <div key={text} className="flex items-center gap-2.5 text-[10px] uppercase text-white/35 font-bold tracking-wide">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
                      {text}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Lighbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && service.images && service.images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative max-w-5xl max-h-[80vh] w-full px-6 flex items-center justify-center group">
              {service.images.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-10 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
              )}

              <img 
                src={service.images[activeImgIndex]} 
                alt={service.title} 
                className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/5 shadow-2xl"
              />

              {service.images.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-10 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
