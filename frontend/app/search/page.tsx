'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Loader2, Grid3X3, List, Mic, MicOff, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import toast from 'react-hot-toast';

const categories = ['All', 'BUS', 'TRAIN', 'FLIGHT', 'HOTEL', 'EVENT'];

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-[#020208] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search not supported on this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast('Neural voice input active...');
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice input failed.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsLoading(true);
      try {
        const { data } = await searchApi.voice(transcript);
        setResults(data.results || []);
        toast.success(`Search query synced: "${transcript}"`);
      } catch {
        const { data } = await searchApi.search({ q: transcript, limit: 30 });
        setResults(data.results || []);
      } finally {
        setIsLoading(false);
      }
    };

    recognition.start();
  };

  useEffect(() => {
    if (query) performSearch();
  }, [query, category]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const { data } = await searchApi.search({
        q: query,
        category: category === 'All' ? undefined : category,
        limit: 30,
      });
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setIsLoading(false);
  };

  return (
    <div className="pt-24 min-h-screen bg-[#020208] text-white relative overflow-hidden pb-16">
      {/* Background orbs and grid */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
        {/* Title */}
        <div className="mb-8">
          <Badge className="mb-3 px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Registry Query
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Travel Services Registry
          </h1>
          <p className="text-xs text-white/40 mt-1 font-light">Search and book premium travel models registered in our local ports.</p>
        </div>

        {/* Search controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full max-w-2xl group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-10 transition-opacity" />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Search destinations, services..."
              className="pl-10 pr-12 h-12 text-sm input-premium w-full border-white/10"
            />
            <button
              type="button"
              onClick={startListening}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isListening 
                  ? "bg-rose-500/20 text-rose-400 animate-pulse" 
                  : "hover:bg-white/5 text-white/30 hover:text-white"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl shrink-0 self-stretch sm:self-auto justify-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-lg h-9 w-9', viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-white/40')}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4.5 h-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-lg h-9 w-9', viewMode === 'list' ? 'bg-white/[0.08] text-white' : 'text-white/40')}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl whitespace-nowrap border transition-all duration-300 active:scale-[0.98]',
                category === cat
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500/20 shadow-md'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white hover:bg-white/[0.08]'
              )}
            >
              {cat === 'All' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {/* Loaders and output */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24 glass border border-white/[0.08] rounded-3xl bg-black/20">
            <Search className="w-12 h-12 mx-auto mb-4 text-white/10 animate-float" />
            <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No results found</h3>
            <p className="text-xs text-white/40 max-w-xs mx-auto font-light">Try verifying search terms, correcting typos, or shifting category filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-white/40 mb-6 font-light uppercase tracking-wider">
              {results.length} nodes query matches synced
            </p>

            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4',
            )}>
              {results.map((item: any, i: number) => (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/services/${item.id}`}
                    className={cn(
                      'group block rounded-2xl border border-white/[0.06] bg-black/20 card-hover overflow-hidden hover:border-indigo-500/20 shadow-md bg-gradient-to-t from-transparent to-white/[0.01]',
                      viewMode === 'list' && 'flex h-36',
                    )}
                  >
                    {/* Media Thumbnail */}
                    <div className={cn(
                      'aspect-[16/10] bg-black/40 relative overflow-hidden flex items-center justify-center',
                      viewMode === 'list' && 'w-48 shrink-0 aspect-auto h-full',
                    )}>
                      <div className="text-4xl select-none group-hover:scale-108 transition-transform duration-500">
                        {item.category === 'BUS' ? '🚌' :
                         item.category === 'TRAIN' ? '🚄' :
                         item.category === 'FLIGHT' ? '✈️' :
                         item.category === 'HOTEL' ? '🏨' : '🎫'}
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="glass text-white border-white/20 text-[9px] font-light uppercase">{item.category}</Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <WishlistButton serviceId={item.id} />
                      </div>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-semibold text-sm truncate text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</h3>
                        <p className="text-xs text-white/40 truncate mt-0.5 font-light">
                          {item.vendor?.businessName || 'Premium Transit Partner'}
                        </p>
                      </div>

                      {item.bus?.boardingPoints && (
                        <p className="text-[10px] text-white/40 flex items-center gap-1.5 font-light">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          {item.bus.boardingPoints[0]?.city}
                        </p>
                      )}

                      <div className="flex items-end justify-between border-t border-white/[0.05] pt-2.5 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-semibold">{item.rating || '4.5'}</span>
                        </div>
                        <div className="text-right shrink-0">
                          {item.discountPercent > 0 && (
                            <p className="text-[10px] text-white/30 line-through font-light leading-none mb-0.5">
                              {formatCurrency(item.basePrice)}
                            </p>
                          )}
                          <p className="text-xs md:text-sm font-bold text-indigo-400 leading-none">
                            {formatCurrency(item.basePrice * (1 - item.discountPercent / 100))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
