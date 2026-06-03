'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, MapPin, ArrowRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { SearchConsole } from '@/components/booking/search-console';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

const hotelImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
];

const amenities = ['Pool', 'Spa', 'Gym', 'Restaurant', 'WiFi', 'Parking', 'Room Service', 'Bar'];

export default function HotelsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-[#020208] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <HotelsContent />
    </Suspense>
  );
}

function HotelsContent() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';

  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(toParam || fromParam || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState('price_asc');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setIsLoading(true);
    searchApi.search({
      category: 'HOTEL',
      sort,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      limit: 50
    })
      .then(({ data }) => setServices(data.results || []))
      .finally(() => setIsLoading(false));
  }, [sort, minPrice, maxPrice]);

  const filtered = services.filter(s => {
    if (searchTerm && !s.title.toLowerCase().includes(searchTerm.toLowerCase()) && !(s.hotel?.propertyType || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedAmenities.length > 0) {
      const svcAmenities = Array.isArray(s.amenities)
        ? s.amenities.map((a: any) => String(a).toLowerCase())
        : [];
      return selectedAmenities.every(a => svcAmenities.includes(a.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-emerald-500/10 top-0 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-teal-500/10 bottom-0 -right-48" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" {...fadeInUp}>
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass">🏨 Hotel Booking</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 premium-gradient-text">Find Your Stay</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Discover 25,000+ hotels, resorts, and villas. Premium accommodations at every price point.</p>
        </motion.div>

        {/* Search Console Widget */}
        <motion.div className="mb-12" {...fadeInUp}>
          <SearchConsole />
        </motion.div>

        <motion.div className="flex flex-col md:flex-row gap-4 mb-8" {...fadeInUp}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search hotels, destinations..." className="pl-10 h-12 glass border-white/10" />
          </div>
          <Button variant="outline" className="h-12 glass-button gap-2" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4" /> Amenities {selectedAmenities.length > 0 && <Badge>{selectedAmenities.length}</Badge>}
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
              <div className="glass p-6 rounded-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Amenities</h3>
                    <button onClick={() => setSelectedAmenities([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map(a => (
                      <button key={a} onClick={() => setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          selectedAmenities.includes(a) ? 'bg-primary/20 text-primary border border-primary/30' : 'glass-button border border-white/5'
                        }`}>{a}</button>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="glass rounded-2xl overflow-hidden"><div className="aspect-[16/9] shimmer" /><div className="p-5 space-y-3"><div className="h-4 shimmer rounded w-3/4" /><div className="h-3 shimmer rounded w-1/2" /></div></div>)}</div>
        ) : filtered.length === 0 ? (
          <motion.div className="text-center py-20" {...fadeInUp}>
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6"><MapPin className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="text-xl font-medium mb-2">No hotels found</h3>
            <p className="text-muted-foreground mb-6">Try a different destination or remove filters</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedAmenities([]); setMinPrice(''); setMaxPrice(''); }}>Clear Filters</Button>
          </motion.div>
        ) : (
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={stagger}>
            {filtered.map((service, i) => (
              <motion.div key={service.id} variants={fadeInUp}>
                <Link href={`/services/${service.id}`} className="block group">
                  <div className="glass rounded-2xl overflow-hidden card-hover">
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img src={service.images?.[0] || hotelImages[i % hotelImages.length]} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="glass">HOTEL</Badge>
                        <Badge className="bg-amber-500/80 text-white">{service.hotel?.starRating || '3'}-Star</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <WishlistButton serviceId={service.id} />
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg truncate">{service.title}</h3>
                        <p className="text-white/70 text-sm">{service.hotel?.propertyType || 'Premium Hotel'}</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{service.description?.split(',').pop()?.trim() || 'India'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-500 text-amber-500" /><span className="font-medium">{service.rating || '4.5'}</span><span className="text-muted-foreground text-xs">({service.reviewCount || 0} reviews)</span></div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">from</p>
                          <p className="text-lg font-bold premium-gradient-text">{formatCurrency(service.basePrice)}</p>
                        </div>
                      </div>
                      <Button className="w-full rounded-xl group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all">
                        View Rooms <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
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
