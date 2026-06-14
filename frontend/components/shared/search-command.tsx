'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plane, Bus, Train, Building2, Ticket, X, Loader2, TrendingUp } from 'lucide-react';
import { searchApi } from '@/lib/api';
import { useUiStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

const categoryIcons: Record<string, any> = {
  BUS: Bus,
  TRAIN: Train,
  FLIGHT: Plane,
  HOTEL: Building2,
  EVENT: Ticket,
};

export function SearchCommand() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useUiStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const [searchRes, autoRes] = await Promise.all([
          searchApi.search({ q, limit: 8 }),
          searchApi.autocomplete(q),
        ]);
        setResults(searchRes.data.results || []);
        setSuggestions(autoRes.data.suggestions || []);
      } catch {
        setResults([]);
      }
      setIsLoading(false);
    }, 300),
    [],
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

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

  const handleSelect = (item: any) => {
    setSearchOpen(false);
    setQuery('');
    router.push(`/services/${item.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = results.length + suggestions.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, total - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIndex]) { handleSelect(results[selectedIndex]); }
  };

  const allItems = [...results, ...suggestions];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search destinations, services, places..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/50"
                />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary rounded-md text-muted-foreground">
                  ESC
                </kbd>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {query.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Start typing to search</p>
                  </div>
                )}

                {query.length > 0 && !isLoading && allItems.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found for &quot;{query}&quot;
                  </div>
                )}

                {results.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Services</p>
                    {results.map((item: any, i: number) => {
                      const Icon = categoryIcons[item.category] || Search;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all',
                            selectedIndex === i ? 'bg-secondary/80' : 'hover:bg-secondary/50',
                          )}
                        >
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-secondary')}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.vendor?.businessName || item.category}</p>
                          </div>
                          <span className="text-sm font-semibold">₹{item.basePrice}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Suggestions</p>
                    {suggestions.map((item: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setQuery(item.text)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all',
                          selectedIndex === results.length + i ? 'bg-secondary/80' : 'hover:bg-secondary/50',
                        )}
                      >
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{item.text}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{item.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 bg-secondary/30">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">↑↓</kbd> navigate</span>
                  <span><kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">↵</kbd> select</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
