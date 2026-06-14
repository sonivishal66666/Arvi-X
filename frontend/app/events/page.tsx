'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
Search, Star, Calendar, MapPin, ArrowRight, SlidersHorizontal, Music, Users,
  Loader2, Compass, Shield, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { ClientOnly } from '@/components/shared/client-only';

const ease = [0.16, 1, 0.3, 1];
const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const eventImages = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
];

const eventTypes = ['Concert', 'Sports', 'Theatre', 'Festival', 'Comedy', 'Exhibition', 'Conference', 'Workshop'];

const getThemeColor = (type: string) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('concert') || t.includes('music') || t.includes('festival')) {
    return {
      glow: 'from-rose-500/10 to-transparent',
      border: 'group-hover:border-rose-500/30',
      badge: 'bg-rose-950/45 text-rose-300 border-rose-800/40',
      text: 'text-rose-400',
      button: 'from-rose-600 via-pink-600 to-orange-500 shadow-rose-500/10 hover:shadow-rose-500/25',
    };
  }
  if (t.includes('sports') || t.includes('football') || t.includes('cricket')) {
    return {
      glow: 'from-cyan-500/10 to-transparent',
      border: 'group-hover:border-cyan-500/30',
      badge: 'bg-cyan-950/45 text-cyan-300 border-cyan-800/40',
      text: 'text-cyan-400',
      button: 'from-cyan-600 via-blue-600 to-indigo-500 shadow-cyan-500/10 hover:shadow-cyan-500/25',
    };
  }
  return {
    glow: 'from-amber-500/10 to-transparent',
    border: 'group-hover:border-amber-500/30',
    badge: 'bg-amber-950/45 text-amber-300 border-amber-800/40',
    text: 'text-amber-400',
    button: 'from-amber-600 via-orange-600 to-rose-500 shadow-amber-500/10 hover:shadow-amber-500/25',
  };
};

function EventCard({ service, index }: { service: any; index: number }) {
  const colors = getThemeColor(service.event?.eventType || '');
  const image = service.images?.[0] || eventImages[index % eventImages.length];

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] group flex flex-col h-full">
      {/* Cybernetic glowing border trails */}
      <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:w-[50%] transition-all duration-700" />
      <div className="absolute bottom-0 right-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:w-[50%] transition-all duration-700" />
      
      {/* Left/Right notches for ticket stub effect */}
      <div className="absolute top-[65%] -left-3 w-6 h-6 rounded-full bg-black border border-white/[0.04] z-20" />
      <div className="absolute top-[65%] -right-3 w-6 h-6 rounded-full bg-black border border-white/[0.04] z-20" />
      
      {/* Ticket perforations */}
      <div className="absolute top-[65%] left-3 right-3 h-[1px] border-t border-dashed border-white/10 z-10" />

      {/* Top Section */}
      <div className="aspect-[16/9.5] relative overflow-hidden bg-neutral-900 flex-shrink-0">
        <img src={image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-white/10 text-white/90 border border-white/20 text-[10px] uppercase font-bold tracking-wider rounded-lg px-2 py-0.5 backdrop-blur-md">EVENT</Badge>
          <Badge className={`${colors.badge} text-[10px] font-bold rounded-lg px-2 py-0.5`}>
            {service.event?.eventType || 'Concert'}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <WishlistButton serviceId={service.id} />
        </div>

        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-md font-semibold tracking-wider uppercase">Live Access</span>
            {service.event?.eventType?.toLowerCase() === 'concert' && (
              <div className="flex items-center gap-0.5 h-3 ml-1.5">
                {[0.4, 0.9, 0.6, 0.2].map((delay, idx) => (
                  <motion.span
                    key={idx}
                    className="w-[2px] bg-rose-400 rounded-full"
                    animate={{ height: ['4px', '12px', '4px'] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: delay, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            )}
          </div>
          <h3 className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors duration-300 truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {service.title}
          </h3>
        </div>
      </div>

      {/* Middle stub details */}
      <div className="px-5 pt-4 pb-2 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2 text-xs text-white/50 font-light">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-white/30" />
            <span className="truncate">{service.event?.startDate ? formatDate(service.event.startDate) : 'Coming Soon'}{service.schedules?.[0] ? ` • ${formatTime(service.schedules[0].departureTime)}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white/30" />
            <span className="truncate">{service.event?.venue || 'TBD'}</span>
          </div>
        </div>

        {/* Bottom stub details (price/action) */}
        <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between z-10">
          <div className="text-left">
            <p className="text-[9px] text-white/35 tracking-wider uppercase">Tickets from</p>
            <p className="text-xs text-white/20 line-through h-4">{service.discountPercent > 0 ? formatCurrency(service.basePrice * 1.3) : ''}</p>
            <p className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {formatCurrency(service.basePrice)}
            </p>
          </div>
          <Link href={`/services/${service.id}`}>
            <Button className={`rounded-xl px-4 py-2 bg-gradient-to-r ${colors.button} font-semibold text-xs flex items-center gap-2 border-0 transition-all duration-300 transform group-hover:scale-[1.02]`}>
              Get Tickets <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-white/[0.08] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest">Loading events</p>
        </div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}

function EventsContent() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const classParam = searchParams.get('class') || '';

  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(toParam || fromParam || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    classParam && classParam !== 'ALL' ? [classParam] : []
  );
  const [sort, setSort] = useState('price_asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    searchApi.search({ category: 'EVENT', sort, limit: 50 })
      .then(({ data }) => setServices(data.results || []))
      .finally(() => setIsLoading(false));
  }, [sort]);

  const filtered = services.filter(s => {
    if (searchTerm && !s.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedTypes.length > 0) {
      const evtType = (s.event?.eventType || '').toLowerCase();
      return selectedTypes.some(t => evtType.includes(t.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden pt-28 pb-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-amber-600/[0.07] blur-[150px] animate-orb-pulse" />
        <div className="absolute -bottom-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-yellow-500/[0.05] blur-[150px] animate-orb-pulse animation-delay-4000" />
        <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/[0.03] blur-[120px] animate-float-slow" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-amber-400/30"
              style={{ left: `${10 + Math.random() * 80}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -200], opacity: [0, 0.8, 0] }}
              transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }} />
          ))}
        </div>
      </ClientOnly>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" {...fadeInUp}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
            <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-white/[0.08] text-amber-300 text-[10px] tracking-[0.25em] uppercase font-medium animate-pulse-glow">
              <Compass className="w-3.5 h-3.5 mr-2 text-amber-400" />
              Event Tickets
            </Badge>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-glow" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Discover <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-light leading-relaxed">
            Concerts, sports, theatre, festivals and more. Book tickets to the hottest events near you.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/20">
            <div className="flex items-center gap-1.5 text-[11px] font-light"><Shield className="w-3.5 h-3.5" /><span>Verified Venues</span></div>
            <div className="flex items-center gap-1.5 text-[11px] font-light"><Zap className="w-3.5 h-3.5" /><span>Instant E-ticket</span></div>
            <div className="flex items-center gap-1.5 text-[11px] font-light"><Compass className="w-3.5 h-3.5" /><span>Exclusive Deals</span></div>
          </div>
        </motion.div>

        <div className="w-full h-px mb-10"><div className="line-glow w-full animate-gradient-x" /></div>

        <motion.div className="flex flex-col md:flex-row gap-3 mb-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search events, artists, venues..."
              className="pl-10 h-12 bg-white/[0.03] border-white/[0.06] rounded-xl text-white placeholder:text-white/25 focus:border-amber-500/30 focus:ring-amber-500/20 transition-all" />
          </div>
          <Button variant="outline" className="h-12 rounded-xl bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-white/60 hover:text-white gap-2 transition-all duration-300" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4" /> Type
            {selectedTypes.length > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">{selectedTypes.length}</span>}
          </Button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 text-sm text-white/60 hover:border-white/[0.1] transition-all cursor-pointer bg-black">
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
                    <h3 className="font-semibold text-sm text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Event Type</h3>
                    <button onClick={() => setSelectedTypes([])} className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map(t => (
                      <button key={t} onClick={() => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                          selectedTypes.includes(t) ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
            <p className="text-xs text-white/30 font-light"><span className="text-white/60 font-medium">{filtered.length}</span> events found</p>
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] aspect-[16/10] h-72 shimmer" />)}</div>
        ) : filtered.length === 0 ? (
          <motion.div className="text-center py-24" {...fadeInUp}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <Music className="w-8 h-8 text-amber-400/60" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No events found</h3>
            <p className="text-sm text-white/35 mb-6 font-light">Try different keywords or categories</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedTypes([]); }} className="rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] text-white/60 text-sm">Clear Filters</Button>
          </motion.div>
        ) : (
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger} initial="initial" animate="animate">
            {filtered.map((service, i) => (
              <motion.div key={service.id} variants={fadeInUp}>
                <EventCard service={service} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
