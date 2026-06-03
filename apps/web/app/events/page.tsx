'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Calendar, MapPin, ArrowRight, SlidersHorizontal, Music, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

const eventImages = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
];

const eventTypes = ['Concert', 'Sports', 'Theatre', 'Festival', 'Comedy', 'Exhibition', 'Conference', 'Workshop'];

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-[#020208] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-amber-500/10 top-0 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-yellow-500/10 bottom-0 -right-48" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" {...fadeInUp}>
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass">🎫 Events & Tickets</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 premium-gradient-text">Discover Events</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Concerts, sports, theatre, festivals and more. Book tickets to the hottest events near you.</p>
        </motion.div>

        <motion.div className="flex flex-col md:flex-row gap-4 mb-8" {...fadeInUp}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search events, artists, venues..." className="pl-10 h-12 glass border-white/10" />
          </div>
          <Button variant="outline" className="h-12 glass-button gap-2" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4" /> Type {selectedTypes.length > 0 && <Badge>{selectedTypes.length}</Badge>}
          </Button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="h-12 rounded-xl glass border-white/10 px-4 text-sm bg-transparent">
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="glass p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Event Type</h3>
                  <button onClick={() => setSelectedTypes([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map(t => (
                    <button key={t} onClick={() => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                      className={`px-4 py-2 rounded-xl text-sm transition-all ${
                        selectedTypes.includes(t) ? 'bg-primary/20 text-primary border border-primary/30' : 'glass-button border border-white/5'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="glass rounded-2xl overflow-hidden"><div className="aspect-[16/9] shimmer" /><div className="p-5 space-y-3"><div className="h-4 shimmer rounded w-3/4" /><div className="h-3 shimmer rounded w-1/2" /></div></div>)}</div>
        ) : filtered.length === 0 ? (
          <motion.div className="text-center py-20" {...fadeInUp}>
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6"><Music className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="text-xl font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">Try different keywords or categories</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedTypes([]); }}>Clear Filters</Button>
          </motion.div>
        ) : (
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger}>
            {filtered.map((service, i) => (
              <motion.div key={service.id} variants={fadeInUp}>
                <Link href={`/services/${service.id}`} className="block group">
                  <div className="glass rounded-2xl overflow-hidden card-hover">
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img src={service.images?.[0] || eventImages[i % eventImages.length]} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="glass">EVENT</Badge>
                        <Badge className="bg-rose-500/80 text-white">{service.event?.eventType || 'Concert'}</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                            <WishlistButton serviceId={service.id} />
                          </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg truncate">{service.title}</h3>
                        <div className="flex items-center gap-2 text-white/70 text-xs mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{service.event?.startDate ? formatDate(service.event.startDate) : 'Coming Soon'}{service.schedules?.[0] ? ` • ${formatTime(service.schedules[0].departureTime)}` : ''}</span>
                          <MapPin className="w-3 h-3 ml-1" />
                          <span>{service.event?.venue || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Users className="w-3.5 h-3.5" /><span>{(service._count?.bookings || 0) + 120} going</span></div>
                        <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /><span className="font-medium">{service.rating || '4.7'}</span></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground line-through">{service.discountPercent > 0 ? formatCurrency(service.basePrice * 1.3) : ''}&nbsp;</p>
                          <p className="text-lg font-bold premium-gradient-text">{formatCurrency(service.basePrice)}</p>
                        </div>
                        <Button className="rounded-xl group-hover:shadow-lg group-hover:shadow-amber-500/25 transition-all">
                          Get Tickets <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
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
    </div>
  );
}
