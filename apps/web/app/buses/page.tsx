'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
Search, Filter, Star, Clock, MapPin, Users, ArrowRight, SlidersHorizontal,
  X, Loader2, Bus, Compass, Shield, Zap,
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
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease },
};
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const busTypes = ['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater', 'Volvo', 'Luxury'];

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
const sortOptions = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'departure', label: 'Departure' },
];

export default function BusesPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-white/[0.08] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest">Loading buses</p>
        </div>
      </div>
    }>
      <BusesContent />
    </Suspense>
  );
}

function BusesContent() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const classParam = searchParams.get('class') || '';

  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    fromParam && toParam ? `${fromParam} to ${toParam}` : fromParam || toParam || ''
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    classParam && classParam !== 'ALL' ? [classParam] : []
  );
  const [sort, setSort] = useState('price_asc');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setIsLoading(true);
    searchApi.search({
      category: 'BUS',
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
    if (selectedTypes.length > 0) {
      const busInfo = s.bus || {};
      const match = selectedTypes.some(t => {
        const normalizedBusType = (busInfo.busType || '').toLowerCase().replace(/_/g, ' ');
        const normalizedSearchType = t.toLowerCase().replace(/-/g, ' ');
        return normalizedBusType.includes(normalizedSearchType);
      });
      if (!match) return false;
    }
    return true;
  });

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ═══ Hero Banner ═══ */}
      <section className="relative pt-28 pb-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[150px] animate-orb-pulse" />
          <div className="absolute -bottom-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.05] blur-[150px] animate-orb-pulse animation-delay-4000" />
          <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.03] blur-[120px] animate-float-slow" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

        {/* Floating particles */}
        <ClientOnly>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[2px] h-[2px] rounded-full bg-indigo-400/30"
                style={{ left: `${10 + Math.random() * 80}%`, top: `${Math.random() * 100}%` }}
                animate={{ y: [0, -200], opacity: [0, 0.8, 0] }}
                transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
              />
            ))}
          </div>
        </ClientOnly>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease }}
            >
              <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-white/[0.08] text-indigo-300 text-[10px] tracking-[0.25em] uppercase font-medium animate-pulse-glow">
                <Bus className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                Bus Travel Network
              </Badge>
            </motion.div>
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-glow"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Book <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Bus Tickets</span>
            </h1>
            <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-light leading-relaxed">
              Compare and book from 12,000+ bus routes across India with AC sleeper, Volvo, and luxury options
            </p>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-white/20">
              <div className="flex items-center gap-1.5 text-[11px] font-light"><Shield className="w-3.5 h-3.5" /><span>Verified Operators</span></div>
              <div className="flex items-center gap-1.5 text-[11px] font-light"><Zap className="w-3.5 h-3.5" /><span>Instant E-Ticket</span></div>
              <div className="flex items-center gap-1.5 text-[11px] font-light"><Clock className="w-3.5 h-3.5" /><span>Live Tracking</span></div>
            </div>
          </motion.div>

          {/* Glowing separator */}
          <div className="w-full h-px mb-10">
            <div className="line-glow w-full animate-gradient-x" />
          </div>

          {/* Search Console Widget */}
          <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease }}>
            <SearchConsole />
          </motion.div>
        </div>
      </section>

      {/* ═══ Search & Filters ═══ */}
      <section className="relative pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col md:flex-row gap-3 mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search bus routes, cities..."
                className="pl-10 h-12 bg-white/[0.03] border-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:border-indigo-500/30 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <Button
              variant="outline"
              className="h-12 rounded-xl bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-white/60 hover:text-white gap-2 transition-all duration-300"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {selectedTypes.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">{selectedTypes.length}</span>
              )}
            </Button>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 text-sm text-white/60 hover:border-white/[0.1] transition-all cursor-pointer"
            >
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </motion.div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease }}
                className="overflow-hidden mb-8"
              >
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Bus Type</h3>
                      <button onClick={() => setSelectedTypes([])} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Clear all</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {busTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                            selectedTypes.includes(type)
                              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                              : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
                          }`}
                        >
                          {type}
                        </button>
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

          {/* Results count */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-xs text-white/30 font-light">
                <span className="text-white/60 font-medium">{filtered.length}</span> buses found
              </p>
            </motion.div>
          )}

          {/* ═══ Results ═══ */}
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-6 h-36 shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div className="text-center py-24" {...fadeInUp}>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border border-white/[0.06] flex items-center justify-center mx-auto mb-6"
              >
                <Bus className="w-8 h-8 text-indigo-400/60" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No buses found</h3>
              <p className="text-sm text-white/35 mb-6 font-light">Try adjusting your filters or search term</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedTypes([]); }} className="rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] text-white/60 text-sm">Clear Filters</Button>
            </motion.div>
          ) : (
            <motion.div className="flex flex-col gap-4" variants={stagger} initial="initial" animate="animate">
              {filtered.map((service, i) => (
                <motion.div key={service.id} variants={fadeInUp}>
                  <Link href={`/services/${service.id}`} className="block group">
                    <div className="relative rounded-2xl p-6 bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-indigo-500/20 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)]">
                      {/* Hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.03] to-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />

                      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                        {/* Left: Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                            <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] uppercase font-bold tracking-wider rounded-lg">
                              {service.bus?.busType || 'AC Sleeper'}
                            </Badge>
                            {service.discountPercent > 0 && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-lg">
                                -{service.discountPercent}% OFF
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span className="text-xs font-semibold text-white/80">{service.rating || '4.5'}</span>
                              <span className="text-[10px] text-white/30">({service.reviewCount || 0})</span>
                            </div>
                            <div onClick={(e) => e.preventDefault()} className="ml-auto md:ml-0">
                              <WishlistButton serviceId={service.id} />
                            </div>
                          </div>
                          <h3
                            className="text-white font-bold text-lg md:text-xl mb-1 tracking-tight group-hover:text-indigo-300 transition-colors duration-300"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                          >
                            {service.title}
                          </h3>
                          <p className="text-white/40 text-xs font-light">
                            Operator: <span className="text-white/60 font-medium">{service.vendor?.businessName || 'Premium Operator'}</span> · {service.bus?.boardingPoints?.length || 4} Boarding Stops
                          </p>

                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {busTypes.slice(0, 4).map(type => (
                              <span key={type} className="text-[10px] bg-white/[0.03] text-white/40 px-2 py-0.5 rounded-md border border-white/[0.05] font-light">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Middle: Schedule */}
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
                            <div className="flex items-center gap-6 bg-white/[0.02] border border-white/[0.04] px-6 py-4 rounded-2xl md:w-[350px]">
                              <div className="text-left">
                                <p className="text-base font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{sched.departureTimeFormatted}</p>
                                <p className="text-[10px] text-white/30 font-medium uppercase mt-0.5">{sched.departureDateFormatted}</p>
                              </div>

                              <div className="flex-1 flex flex-col items-center relative">
                                <span className="text-[9px] text-white/25 uppercase tracking-widest font-bold mb-1">
                                  {sched.durationFormatted}
                                </span>
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent relative overflow-hidden">
                                  <motion.div
                                    animate={{ left: ['-10%', '110%'] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                                  />
                                </div>
                                <span className="text-[8px] text-emerald-400/80 font-semibold mt-1">Direct Route</span>
                              </div>

                              <div className="text-right">
                                <p className="text-base font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{sched.arrivalTimeFormatted}</p>
                                <p className="text-[10px] text-white/30 font-medium uppercase mt-0.5">{sched.arrivalDateFormatted}</p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Right: Price & CTA */}
                        <div className="flex items-center md:items-end justify-between md:flex-col gap-4 w-full md:w-auto border-t md:border-t-0 border-white/[0.04] pt-4 md:pt-0">
                          <div className="text-left md:text-right">
                            <p className="text-xs text-white/20 line-through h-4">{service.discountPercent > 0 ? formatCurrency(service.basePrice * 1.2) : ''}</p>
                            <p className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{formatCurrency(service.basePrice)}</p>
                            <p className="text-[10px] text-white/25 mt-1 font-light">all taxes included</p>
                          </div>
                          <Button className="rounded-xl px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] font-semibold text-xs flex items-center gap-2 border-0 transition-all duration-300">
                            View Seats <ArrowRight className="w-3.5 h-3.5" />
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
