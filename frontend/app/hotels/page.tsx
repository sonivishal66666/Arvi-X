'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, MapPin, ArrowRight, SlidersHorizontal, Loader2, 
  Award, Shield, Compass, Waves, Flame, Sparkles,
  ChevronDown, Check, Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';

const ease = [0.16, 1, 0.3, 1];
const fadeInUp = { 
  initial: { opacity: 0, y: 25 }, 
  animate: { opacity: 1, y: 0 }, 
  transition: { duration: 0.7, ease } 
};
const stagger = { 
  animate: { transition: { staggerChildren: 0.06 } } 
};

// Curated collections of luxury fallback photos to guarantee 5 photos per stay
const luxuryHotelImages = [
  [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&q=80',
    'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
  ]
];

const amenitiesList = [
  { name: 'Pool', icon: Waves },
  { name: 'Spa', icon: Sparkles },
  { name: 'Gym', icon: Flame },
  { name: 'Restaurant', icon: Award },
  { name: 'WiFi', icon: Wifi },
  { name: 'Parking', icon: Shield },
  { name: 'Room Service', icon: Compass },
  { name: 'Bar', icon: Flame }
];

const sortOptions = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Match Score' }
];

// Helper to construct exactly 5 high quality unique images for hotel carousels
const getHotelImages = (service: any, index: number) => {
  const customList = Array.isArray(service.images) && service.images.filter(Boolean).length > 0
    ? service.images.filter(Boolean)
    : [];
  const fallbacks = luxuryHotelImages[index % luxuryHotelImages.length];
  const combined = Array.from(new Set([...customList, ...fallbacks]));
  return combined.slice(0, 5);
};

export default function HotelsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-[#020208] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-white/[0.08] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest font-mono">Accessing Stays Registry</p>
        </div>
      </div>
    }>
      <HotelsContent />
    </Suspense>
  );
}

// Sub-component to cycle images automatically every 3 seconds ONLY when hovered
function HotelImageCarousel({ images, title, isHovered }: { images: string[]; title: string; isHovered: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1 || !isHovered) {
      if (!isHovered) {
        setIndex(0); // Reset to first slide when hover leaves
      }
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={`${title} - view ${index + 1}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-[#020208] via-[#020208]/10 to-transparent pointer-events-none z-10" />
      
      {/* Slide dots indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === index ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StayCard({ service, index }: { service: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const rating = parseFloat(service.rating) || 4.5;
  const stars = service.hotel?.starRating || 3;
  const location = service.description?.split(',').pop()?.trim() || 'India';
  const carouselImages = getHotelImages(service, index);

  return (
    <motion.div 
      variants={fadeInUp}
      className="accelerate-gpu"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/services/${service.id}`} className="block group">
        <div className="relative glass rounded-3xl border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-amber-500/20 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(245,158,11,0.06)] bg-gradient-to-b from-white/[0.01] to-transparent p-1">
          
          {/* Image Frame with Auto Scroll Carousel */}
          <div className="aspect-[16/10] relative overflow-hidden rounded-2xl bg-black/50">
            <HotelImageCarousel images={carouselImages} title={service.title} isHovered={isHovered} />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex gap-1.5 z-20 text-[9px] font-semibold tracking-wider">
              <Badge className="bg-black/75 backdrop-blur-xl border border-white/10 text-white px-2 py-0.5 rounded-md uppercase">
                STAY
              </Badge>
              <Badge className="bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-md">
                {stars}-STAR
              </Badge>
            </div>

            {/* Wishlist Button */}
            <div className="absolute top-4 right-4 z-20">
              <WishlistButton serviceId={service.id} />
            </div>
          </div>

          {/* Info Details Grid */}
          <div className="p-5 space-y-4">
            <div>
              <h3 
                className="text-white font-extrabold text-lg sm:text-xl truncate tracking-tight group-hover:text-amber-300 transition-colors duration-300"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {service.title}
              </h3>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5 font-medium">
                {service.hotel?.propertyType || 'Luxury Residence'}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/50 border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-1.5 text-white/60">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[150px]">{location}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-white/80 font-bold">{rating}</span>
                <span className="text-white/35 text-[9px]">({service.reviewCount || 0} reviews)</span>
              </div>
            </div>

            {/* Price & Booking Button */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold leading-none">Starting From</p>
                <p className="text-xl font-black text-amber-400 tracking-tight mt-1">
                  {formatCurrency(service.basePrice)}
                </p>
              </div>

              {/* Reserve sanctuary button */}
              <Button className="h-11 bg-white/[0.02] hover:bg-amber-500 hover:text-black border border-white/[0.06] hover:border-amber-500 rounded-xl flex items-center justify-center gap-1.5 group/btn text-xs font-semibold uppercase tracking-wider text-amber-300 transition-all duration-300 px-4">
                <span>Reserve</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform text-amber-300 group-hover:text-black" />
              </Button>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
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
  const [isOpenSort, setIsOpenSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsOpenSort(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const activeSortLabel = sortOptions.find(o => o.value === sort)?.label || 'Price: Low to High';

  return (
    <div className="min-h-screen bg-[#020208] text-white pt-28 pb-16 relative overflow-hidden">
      {/* ═══ Background Glow FX ═══ */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-300px] left-[-100px] w-[800px] h-[800px] rounded-full bg-amber-500/[0.02] blur-[160px] animate-orb-pulse" />
        <div className="absolute bottom-[-100px] right-[-200px] w-[700px] h-[700px] rounded-full bg-amber-600/[0.01] blur-[150px] animate-orb-pulse animation-delay-4000" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ═══ Header Section ═══ */}
        <motion.div 
          className="text-center mb-14"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Badge className="mb-4 px-4 py-1.5 text-[10px] tracking-widest uppercase bg-amber-500/10 text-amber-300 border-amber-500/20 backdrop-blur-md">
            Premium Stay Directory
          </Badge>
          <h1 
            className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Discover Curated <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">Sanctuaries</span>
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto font-light text-sm md:text-base leading-relaxed">
            Experience absolute comfort. Discover curated luxury hotels, boutique resorts, and premium villas handpicked for outstanding quality and service.
          </p>
        </motion.div>

        {/* ═══ Refined Control Console ═══ */}
        <motion.div 
          className="glass p-3 rounded-2xl border border-white/[0.06] flex flex-col md:flex-row gap-3 items-center justify-between mb-8 shadow-2xl backdrop-blur-3xl animate-gpu"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="Search by city, destination, or resort name..." 
              className="pl-11 h-12 bg-white/[0.01] border-white/[0.06] focus:border-amber-500/40 rounded-xl placeholder:text-white/20 text-white text-sm focus:ring-1 focus:ring-amber-500/10"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2 w-full md:w-auto shrink-0 z-30">
            <Button 
              variant="outline" 
              className={`h-12 rounded-xl gap-2 px-5 border-white/[0.06] text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                showFilters ? 'bg-amber-500/10 text-amber-300 border-amber-500/25' : 'glass-button'
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> 
              Filters {selectedAmenities.length > 0 && <Badge className="bg-amber-400 text-black font-bold ml-1.5 rounded-md text-[10px] px-1">{selectedAmenities.length}</Badge>}
            </Button>

            {/* Custom Animated Sort Dropdown */}
            <div className="relative w-full md:w-52" ref={sortRef}>
              <button
                onClick={() => setIsOpenSort(!isOpenSort)}
                className="w-full h-12 rounded-xl glass border border-white/[0.06] hover:border-white/[0.12] px-4 flex items-center justify-between text-xs uppercase tracking-wider text-white/70 hover:text-white transition-all cursor-pointer bg-[#05050c]"
              >
                <span className="truncate">{activeSortLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-300 ${isOpenSort ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpenSort && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease }}
                    className="absolute right-0 left-0 mt-2 z-50 rounded-xl border border-white/[0.08] bg-[#05050d]/95 backdrop-blur-2xl shadow-2xl p-1.5 space-y-1"
                  >
                    {sortOptions.map((opt) => {
                      const isSelected = opt.value === sort;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSort(opt.value);
                            setIsOpenSort(false);
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-left text-xs uppercase tracking-wider transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                              : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                          }`}
                        >
                          {opt.label}
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ═══ Filters Drawer ═══ */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }} 
              animate={{ opacity: 1, height: 'auto', y: 0 }} 
              exit={{ opacity: 0, height: 0, y: -10 }} 
              className="overflow-hidden mb-8"
              transition={{ duration: 0.4, ease }}
            >
              <div className="glass p-6 rounded-2xl border border-amber-500/10 bg-gradient-to-b from-amber-950/[0.02] to-transparent space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold">Filter by Amenities</h3>
                    <button 
                      onClick={() => setSelectedAmenities([])} 
                      className="text-[10px] uppercase tracking-wider text-white/30 hover:text-amber-400 transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map(a => {
                      const Icon = a.icon;
                      const isSelected = selectedAmenities.includes(a.name);
                      return (
                        <button 
                          key={a.name} 
                          onClick={() => setSelectedAmenities(prev => prev.includes(a.name) ? prev.filter(x => x !== a.name) : [...prev, a.name])}
                          className={`px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all duration-300 border ${
                            isSelected 
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                              : 'bg-white/[0.01] text-white/60 border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-white/30'}`} />
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/[0.05]">
                  <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4">Price Range (₹)</h3>
                  <div className="flex items-center gap-4 max-w-md">
                    <Input
                      type="number"
                      placeholder="Minimum"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      className="glass border-white/[0.06] h-11 rounded-xl pl-4 text-xs focus:border-amber-500/30 text-white"
                    />
                    <span className="text-white/20">&mdash;</span>
                    <Input
                      type="number"
                      placeholder="Maximum"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="glass border-white/[0.06] h-11 rounded-xl pl-4 text-xs focus:border-amber-500/30 text-white"
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => { setMinPrice(''); setMaxPrice(''); }} 
                      className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white rounded-xl h-11 px-4 shrink-0 transition-colors"
                    >
                      Reset Range
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ matched log banner ═══ */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/30 mb-6 px-1">
            <div>
              Showing {filtered.length} matching sanctuaries
            </div>
            <div>
              Auto-scrolling views enabled
            </div>
          </div>
        )}

        {/* ═══ Main Listings Grid ═══ */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass rounded-3xl overflow-hidden border border-white/[0.04] accelerate-gpu p-1">
                <div className="aspect-[16/10] shimmer rounded-2xl" />
                <div className="p-6 space-y-4">
                  <div className="h-5 shimmer rounded-lg w-3/4" />
                  <div className="h-3.5 shimmer rounded w-1/2" />
                  <div className="h-8 shimmer rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            className="text-center py-24 glass rounded-3xl border border-white/[0.06] backdrop-blur-md"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="w-20 h-20 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <MapPin className="w-8 h-8 text-amber-400/80 animate-pulse" />
            </div>
            <h3 
              className="text-xl font-bold mb-2 tracking-tight text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              No Sanctuaries Found
            </h3>
            <p className="text-white/40 text-xs max-w-xs mx-auto mb-8">
              No stays matching your query parameters exist. Try clearing or expanding your filters.
            </p>
            <Button 
              onClick={() => { setSearchTerm(''); setSelectedAmenities([]); setMinPrice(''); setMaxPrice(''); }}
              className="px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black border-0 shadow-lg shadow-amber-500/25"
            >
              Reset Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {filtered.map((service, i) => (
              <StayCard key={service.id} service={service} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
