'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plane, Bus, Train, Building2, Ticket, X, Calendar, MapPin, ArrowRightLeft, Users, Loader2 } from 'lucide-react';
import { searchApi } from '@/lib/api';
import { useUiStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryTab {
  id: string;
  label: string;
  icon: any;
  gradient: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  dateLabel: string;
}

const categories: CategoryTab[] = [
  { id: 'BUS', label: 'Bus', icon: Bus, gradient: 'from-blue-500/20 to-cyan-500/20', fromPlaceholder: 'From city', toPlaceholder: 'To city', dateLabel: 'Departure' },
  { id: 'TRAIN', label: 'Train', icon: Train, gradient: 'from-orange-500/20 to-red-500/20', fromPlaceholder: 'From station', toPlaceholder: 'To station', dateLabel: 'Departure' },
  { id: 'FLIGHT', label: 'Flight', icon: Plane, gradient: 'from-purple-500/20 to-pink-500/20', fromPlaceholder: 'From city', toPlaceholder: 'To city', dateLabel: 'Departure' },
  { id: 'HOTEL', label: 'Hotel', icon: Building2, gradient: 'from-emerald-500/20 to-teal-500/20', fromPlaceholder: 'Destination', toPlaceholder: 'Area/Location', dateLabel: 'Check-in' },
  { id: 'EVENT', label: 'Event', icon: Ticket, gradient: 'from-amber-500/20 to-yellow-500/20', fromPlaceholder: 'City', toPlaceholder: 'Venue', dateLabel: 'Date' },
];

const quickRoutes: Record<string, { from: string; to: string }[]> = {
  BUS: [
    { from: 'Mumbai', to: 'Delhi' },
    { from: 'Bangalore', to: 'Chennai' },
    { from: 'Delhi', to: 'Jaipur' },
    { from: 'Pune', to: 'Mumbai' },
  ],
  TRAIN: [
    { from: 'Mumbai', to: 'Delhi' },
    { from: 'Kolkata', to: 'Chennai' },
    { from: 'Delhi', to: 'Varanasi' },
    { from: 'Bangalore', to: 'Hyderabad' },
  ],
  FLIGHT: [
    { from: 'Mumbai', to: 'Delhi' },
    { from: 'Delhi', to: 'Bangalore' },
    { from: 'Mumbai', to: 'Goa' },
    { from: 'Delhi', to: 'Kolkata' },
  ],
  HOTEL: [
    { from: 'Mumbai', to: 'Business District' },
    { from: 'Goa', to: 'Beach Area' },
    { from: 'Jaipur', to: 'City Center' },
    { from: 'Manali', to: 'Hill Station' },
  ],
  EVENT: [
    { from: 'Mumbai', to: 'Any' },
    { from: 'Delhi', to: 'Any' },
    { from: 'Bangalore', to: 'Any' },
    { from: 'Pune', to: 'Any' },
  ],
};

const categoryIcons: Record<string, any> = {
  BUS: Bus, TRAIN: Train, FLIGHT: Plane, HOTEL: Building2, EVENT: Ticket,
};

export function CategorySearchDialog() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useUiStore();
  const [category, setCategory] = useState('BUS');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const performSearch = useCallback(
    debounce(async (q: string, cat: string) => {
      if (q.length < 2) { setResults([]); return; }
      setIsLoading(true);
      try {
        const { data } = await searchApi.search({ q, category: cat, limit: 6 });
        setResults(data.results || []);
      } catch { setResults([]); }
      setIsLoading(false);
    }, 300),
    [],
  );

  useEffect(() => {
    if (from || to) performSearch(`${from} ${to}`, category);
    else setResults([]);
  }, [from, to, category, performSearch]);

  const handleSearch = () => {
    setSearchOpen(false);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    const categoryRoutes: Record<string, string> = { BUS: '/buses', TRAIN: '/trains', FLIGHT: '/flights', HOTEL: '/hotels', EVENT: '/events' };
    router.push(`${categoryRoutes[category] || `/search?q=${from || to}`}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleQuickRoute = (route: { from: string; to: string }) => {
    setFrom(route.from);
    setTo(route.to);
  };

  const currentCat = categories.find(c => c.id === category)!;
  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -30 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card overflow-hidden">
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Search</h2>
                  <div className="flex items-center gap-2">
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary rounded-md text-muted-foreground">
                      ⌘K
                    </kbd>
                    <button onClick={() => setSearchOpen(false)} className="p-1 rounded-lg hover:bg-secondary/80 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => {
                    const isActive = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                          isActive
                            ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent',
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-end">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={from}
                        onChange={e => { setFrom(e.target.value); setSelectedIndex(0); }}
                        placeholder={currentCat.fromPlaceholder}
                        className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center pb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={to}
                        onChange={e => { setTo(e.target.value); setSelectedIndex(0); }}
                        placeholder={currentCat.toPlaceholder}
                        className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{currentCat.dateLabel}</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        min={category === 'EVENT' ? undefined : today}
                        className="w-full h-11 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search {currentCat.label}s
                </Button>
              </div>

              <div className="max-h-72 overflow-y-auto px-5 pb-4">
                {!from && !to && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Popular Routes</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(quickRoutes[category] || []).map((route, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickRoute(route)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
                        >
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs truncate">{route.from} → {route.to}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(from || to) && results.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Quick Results</p>
                    {results.map((item: any, i: number) => {
                      const Icon = categoryIcons[item.category] || Search;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setSearchOpen(false); router.push(`/services/${item.id}`); }}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all mb-1',
                            selectedIndex === i ? 'bg-secondary/80' : 'hover:bg-secondary/50',
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.vendor?.businessName || item.category}</p>
                          </div>
                          <span className="text-xs font-semibold">₹{item.basePrice}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(from || to) && !isLoading && results.length === 0 && (
                  <div className="text-center py-6">
                    <Search className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Press Enter to search all {currentCat.label.toLowerCase()}s</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
