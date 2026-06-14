'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
Search, Star, Clock, ArrowRight, SlidersHorizontal, Plane, Loader2, Shield,
  Zap, Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { SearchConsole } from '@/components/booking/search-console';
import { ClientOnly } from '@/components/shared/client-only';

const ease = [0.16, 1, 0.3, 1];
const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Go First', 'Akasa Air'];
const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First Class'];

function getDeterministicMockSchedule(serviceId: string) {
  let hash = 0;
  for (let i = 0; i < serviceId.length; i++) {
    hash = serviceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const depHour = 6 + (hash % 16);
  const depMin = (hash % 4) * 15;
  const depHour12 = depHour % 12 || 12;
  const depAmpm = depHour >= 12 ? 'PM' : 'AM';
  const depFormatted = `${depHour12}:${depMin.toString().padStart(2, '0')} ${depAmpm}`;

  const durationMin = 45 + (hash % 26) * 15;
  const durationFormatted = `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`;

  const totalMin = depHour * 60 + depMin + durationMin;
  const arrHour = Math.floor(totalMin / 60) % 24;
  const arrMin = totalMin % 60;
  const arrHour12 = arrHour % 12 || 12;
  const arrAmpm = arrHour >= 12 ? 'PM' : 'AM';
  const arrFormatted = `${arrHour12}:${arrMin.toString().padStart(2, '0')} ${arrAmpm}`;

  const isNextDay = totalMin >= 24 * 60;
  const depDateFormatted = "15 Jun 2026";
  const arrDateFormatted = isNextDay ? "16 Jun 2026" : "15 Jun 2026";

  return {
    depTime: depFormatted,
    depDate: depDateFormatted,
    arrTime: arrFormatted,
    arrDate: arrDateFormatted,
    duration: durationFormatted
  };
}

export default function FlightsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-white/[0.08] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest">Loading flights</p>
        </div>
      </div>
    }>
      <FlightsContent />
    </Suspense>
  );
}

function FlightsContent() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const classParam = searchParams.get('class') || '';

  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    fromParam && toParam ? `${fromParam} to ${toParam}` : fromParam || toParam || ''
  );
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sort, setSort] = useState('price_asc');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setIsLoading(true);
    searchApi.search({
      category: 'FLIGHT',
      sort,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      limit: 50
    })
      .then(({ data }) => setServices(data.results || []))
      .finally(() => setIsLoading(false));
  }, [sort, minPrice, maxPrice]);

  const filtered = services.filter(s => {
    if (searchTerm && !s.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedAirlines.length > 0) {
      return selectedAirlines.some(a => (s.flight?.airline || '').toLowerCase().includes(a.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ═══ Hero ═══ */}
      <section className="relative pt-28 pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-purple-600/[0.07] blur-[150px] animate-orb-pulse" />
          <div className="absolute -bottom-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-pink-500/[0.05] blur-[150px] animate-orb-pulse animation-delay-4000" />
          <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[120px] animate-float-slow" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

        <ClientOnly>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-purple-400/30"
                style={{ left: `${10 + Math.random() * 80}%`, top: `${Math.random() * 100}%` }}
                animate={{ y: [0, -200], opacity: [0, 0.8, 0] }}
                transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }} />
            ))}
          </div>
        </ClientOnly>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
              <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-white/[0.08] text-purple-300 text-[10px] tracking-[0.25em] uppercase font-medium animate-pulse-glow">
                <Plane className="w-3.5 h-3.5 mr-2 text-purple-400" />
                Flight Booking
              </Badge>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-glow" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Book <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Flights</span>
            </h1>
            <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-light leading-relaxed">
              Domestic and international flights at the best prices. Compare airlines and book with ease.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-white/20">
              <div className="flex items-center gap-1.5 text-[11px] font-light"><Shield className="w-3.5 h-3.5" /><span>Verified Airlines</span></div>
              <div className="flex items-center gap-1.5 text-[11px] font-light"><Zap className="w-3.5 h-3.5" /><span>Instant Booking</span></div>
              <div className="flex items-center gap-1.5 text-[11px] font-light"><Compass className="w-3.5 h-3.5" /><span>Best Fares</span></div>
            </div>
          </motion.div>
          <div className="w-full h-px mb-10"><div className="line-glow w-full animate-gradient-x" /></div>
          <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease }}>
            <SearchConsole />
          </motion.div>
        </div>
      </section>

      {/* ═══ Search & Results ═══ */}
      <section className="relative pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex flex-col md:flex-row gap-3 mb-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search flights, airports..."
                className="pl-10 h-12 bg-white/[0.03] border-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:border-purple-500/30 focus:ring-purple-500/20 transition-all" />
            </div>
            <Button variant="outline" className="h-12 rounded-xl bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-white/60 hover:text-white gap-2 transition-all duration-300" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4" /> Airlines
              {selectedAirlines.length > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold flex items-center justify-center">{selectedAirlines.length}</span>}
            </Button>
            <select value={sort} onChange={e => setSort(e.target.value)} className="h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 text-sm text-white/60 hover:border-white/[0.1] transition-all cursor-pointer">
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden mb-8">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Airline</h3>
                      <button onClick={() => setSelectedAirlines([])} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Clear</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {airlines.map(a => (
                        <button key={a} onClick={() => setSelectedAirlines(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                            selectedAirlines.includes(a) ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
                          }`}>{a}</button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-5 border-t border-white/[0.06]">
                    <h3 className="font-semibold text-sm text-white/80 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Price Range (₹)</h3>
                    <div className="flex items-center gap-3 max-w-md">
                      <Input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="bg-white/[0.03] border-white/[0.06] h-10 rounded-xl text-white placeholder:text-white/20" />
                      <span className="text-white/20">&mdash;</span>
                      <Input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="bg-white/[0.03] border-white/[0.06] h-10 rounded-xl text-white placeholder:text-white/20" />
                      <Button variant="ghost" size="sm" onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-[11px] text-white/30 hover:text-white shrink-0">Reset</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
              <p className="text-xs text-white/30 font-light"><span className="text-white/60 font-medium">{filtered.length}</span> flights found</p>
            </motion.div>
          )}

          {isLoading ? (
            <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 h-36 shimmer" />)}</div>
          ) : filtered.length === 0 ? (
            <motion.div className="text-center py-24" {...fadeInUp}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                <Plane className="w-8 h-8 text-purple-400/60" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No flights found</h3>
              <p className="text-sm text-white/35 mb-6 font-light">Try different dates or destinations</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedAirlines([]); setMinPrice(''); setMaxPrice(''); }} className="rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] text-white/60 text-sm">Clear Filters</Button>
            </motion.div>
          ) : (
            <motion.div className="flex flex-col gap-4" variants={stagger} initial="initial" animate="animate">
              {filtered.map((service) => (
                <motion.div key={service.id} variants={fadeInUp}>
                  <Link href={`/services/${service.id}`} className="block group">
                    <div className="relative rounded-2xl p-6 bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)]">
                      {/* Cybernetic glowing border trails */}
                      <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent group-hover:w-[50%] transition-all duration-700" />
                      <div className="absolute bottom-0 right-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent group-hover:w-[50%] transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.01] to-cyan-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />

                      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                            <Badge className="bg-purple-950/45 text-purple-300 border border-purple-800/40 text-[10px] uppercase font-bold tracking-wider rounded-lg px-2.5 py-1">{service.flight?.airline || 'Airline'}</Badge>
                            {service.discountPercent > 0 && <Badge className="bg-emerald-950/45 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold rounded-lg px-2 py-0.5">-{service.discountPercent}% OFF</Badge>}
                            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] px-2.5 py-0.5 rounded-lg">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span className="text-xs font-semibold text-white/80">{service.rating || '4.6'}</span>
                            </div>
                            <div onClick={(e) => e.preventDefault()} className="ml-auto md:ml-0"><WishlistButton serviceId={service.id} /></div>
                          </div>
                          <h3 className="text-white font-bold text-lg md:text-xl mb-1 tracking-tight group-hover:text-purple-300 transition-colors duration-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{service.title}</h3>
                          <p className="text-white/40 text-xs font-light">Flight No: <span className="text-white/60 font-medium">{service.flight?.flightNumber || 'N/A'}</span> · Gate Checked</p>
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {cabinClasses.map(c => <span key={c} className="text-[10px] bg-white/[0.02] text-white/35 px-2.5 py-0.5 rounded-md border border-white/[0.04] font-light">{c}</span>)}
                          </div>
                        </div>

                        {(() => {
                          const sched = service.schedules?.[0] ? {
                            departureTimeFormatted: formatTime(service.schedules[0].departureTime),
                            departureDateFormatted: formatDate(service.schedules[0].departureTime),
                            arrivalTimeFormatted: formatTime(service.schedules[0].arrivalTime),
                            arrivalDateFormatted: formatDate(service.schedules[0].arrivalTime),
                            durationFormatted: `${Math.floor(service.schedules[0].duration / 60)}h ${service.schedules[0].duration % 60}m`
                          } : (() => {
                            const mock = getDeterministicMockSchedule(service.id);
                            return {
                              departureTimeFormatted: mock.depTime,
                              departureDateFormatted: mock.depDate,
                              arrivalTimeFormatted: mock.arrTime,
                              arrivalDateFormatted: mock.arrDate,
                              durationFormatted: mock.duration
                            };
                          })();

                          return (
                            <div className="flex items-center gap-6 bg-white/[0.01] border border-white/[0.04] px-6 py-4 rounded-2xl md:w-[350px]">
                              <div className="text-left">
                                <p className="text-base font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{sched.departureTimeFormatted}</p>
                                <p className="text-[10px] text-white/30 font-medium uppercase mt-0.5">{sched.departureDateFormatted}</p>
                              </div>
                              <div className="flex-1 flex flex-col items-center relative">
                                <span className="text-[9px] text-white/45 uppercase tracking-widest font-bold mb-1">{sched.durationFormatted}</span>
                                <div className="w-full h-[2px] bg-gradient-to-r from-purple-500/10 via-purple-500/30 to-cyan-500/10 relative overflow-hidden rounded-full">
                                  <motion.div 
                                    className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                                    animate={{ left: ['-30%', '130%'] }} 
                                    transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                                  />
                                </div>
                                <span className="text-[8px] text-emerald-400/90 font-semibold mt-1 tracking-wider uppercase flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Non-stop
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{sched.arrivalTimeFormatted}</p>
                                <p className="text-[10px] text-white/30 font-medium uppercase mt-0.5">{sched.arrivalDateFormatted}</p>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex items-center md:items-end justify-between md:flex-col gap-4 w-full md:w-auto border-t md:border-t-0 border-white/[0.04] pt-4 md:pt-0">
                          <div className="text-left md:text-right">
                            <p className="text-xs text-white/25 line-through h-4">{service.discountPercent > 0 ? formatCurrency(service.basePrice * 1.25) : ''}</p>
                            <p className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(service.basePrice)}</p>
                            <p className="text-[10px] text-white/25 mt-1 font-light tracking-wide">per passenger</p>
                          </div>
                          <Button className="rounded-xl px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] font-semibold text-xs flex items-center gap-2 border-0 transition-all duration-300 transform group-hover:scale-[1.02]">
                            Book Flight <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
