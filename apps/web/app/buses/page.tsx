'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, MapPin, Users, ArrowRight, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { SearchConsole } from '@/components/booking/search-console';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

const busTypes = ['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater', 'Volvo', 'Luxury'];
const sortOptions = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'departure', label: 'Departure' },
];

const busImages = [
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&q=80',
];

export default function BusesPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-[#020208] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/10 top-0 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/10 bottom-0 -right-48" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" {...fadeInUp}>
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass">🚌 Bus Travel</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 premium-gradient-text">Book Bus Tickets</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Compare and book from 12,000+ bus routes across India with AC sleeper, Volvo, and luxury options</p>
        </motion.div>

        {/* Search Console Widget */}
        <motion.div className="mb-12" {...fadeInUp}>
          <SearchConsole />
        </motion.div>

        <motion.div className="flex flex-col md:flex-row gap-4 mb-8" {...fadeInUp}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search bus routes, cities..."
              className="pl-10 h-12 glass border-white/10"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 glass-button gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {selectedTypes.length > 0 && <Badge className="ml-1">{selectedTypes.length}</Badge>}
          </Button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="h-12 rounded-xl glass border-white/10 px-4 text-sm bg-transparent"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass p-6 rounded-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Bus Type</h3>
                    <button onClick={() => setSelectedTypes([])} className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {busTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                          selectedTypes.includes(type)
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'glass-button border border-white/5'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="font-medium mb-3">Price Range (₹)</h3>
                  <div className="flex items-center gap-3 max-w-md">
                    <Input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      className="glass border-white/10 h-10"
                    />
                    <span className="text-white/40">&mdash;</span>
                    <Input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="glass border-white/10 h-10"
                    />
                    <Button variant="ghost" size="sm" onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-xs text-white/50 hover:text-white shrink-0">Reset</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <div className="aspect-[16/9] shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-1/2" />
                  <div className="h-3 shimmer rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div className="text-center py-20" {...fadeInUp}>
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No buses found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search term</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedTypes([]); }} className="glass-button">Clear Filters</Button>
          </motion.div>
        ) : (
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger}>
            {filtered.map((service, i) => (
              <motion.div key={service.id} variants={fadeInUp}>
                <Link href={`/services/${service.id}`} className="block group">
                  <div className="glass rounded-2xl overflow-hidden card-hover">
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img
                        src={service.images?.[0] || busImages[i % busImages.length]}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="glass">BUS</Badge>
                        {service.discountPercent > 0 && (
                          <Badge className="bg-green-500/80 text-white">-{service.discountPercent}%</Badge>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <WishlistButton serviceId={service.id} />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg truncate">{service.title}</h3>
                        <p className="text-white/70 text-sm">{service.vendor?.businessName || 'Premium Travels'}</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      {service.schedules?.[0] && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/5">
                          <div className="text-center">
                            <p className="text-sm font-bold">{formatTime(service.schedules[0].departureTime)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDate(service.schedules[0].departureTime)}</p>
                          </div>
                          <div className="flex-1 px-3">
                            <div className="w-full h-px bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 relative">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-card text-[10px] text-muted-foreground">
                                {Math.floor(service.schedules[0].duration / 60)}h {service.schedules[0].duration % 60}m
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold">{formatTime(service.schedules[0].arrivalTime)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDate(service.schedules[0].arrivalTime)}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{service.bus?.busType || 'AC Sleeper'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span className="font-medium">{service.rating || '4.5'}</span>
                          <span className="text-muted-foreground">({service.reviewCount || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{service.bus?.boardingPoints?.length || 4} stops</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground line-through">
                            {service.discountPercent > 0 ? formatCurrency(service.basePrice * 1.2) : ''}&nbsp;
                          </p>
                          <p className="text-lg font-bold premium-gradient-text">{formatCurrency(service.basePrice)}</p>
                        </div>
                      </div>
                      <Button className="w-full rounded-xl group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                        View Seats <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
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
