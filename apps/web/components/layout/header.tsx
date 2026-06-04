'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAuthStore, useUiStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu, X, Search, Sun, Moon, User, Bell, LogOut, Settings,
  LayoutDashboard, Sparkles, ChevronDown, Heart, Wallet,
} from 'lucide-react';

const navLinks = [
  { href: '/buses', label: 'Buses', icon: '🚌' },
  { href: '/trains', label: 'Trains', icon: '🚄' },
  { href: '/flights', label: 'Flights', icon: '✈️' },
  { href: '/hotels', label: 'Hotels', icon: '🏨' },
  { href: '/events', label: 'Events', icon: '🎫' },
  { href: '/ai-assistant', label: 'AI Planner', icon: '✨' },
];

export function Header() {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { isMobileMenuOpen, setMobileMenuOpen, setSearchOpen, isSearchOpen } = useUiStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    const { setAuthTransition } = useUiStore.getState();
    setAuthTransition(true, 'signout');
    
    setTimeout(() => {
      useAuthStore.getState().logout();
      setAuthTransition(false);
    }, 1200);
  };

  return (
    <header
      className={cn(
        'fixed left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8',
        isScrolled ? 'top-4 max-w-6xl mx-auto' : 'top-0 max-w-full'
      )}
    >
      <div
        className={cn(
          'w-full mx-auto transition-all duration-500 rounded-2xl px-4 md:px-6',
          isScrolled 
            ? 'glass border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.3)] bg-black/40 h-16' 
            : 'bg-transparent h-20'
        )}
      >
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
              <img src="/favicon.png" alt="Arvis X" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Arvis <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">X</span>
            </span>
          </Link>


          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300',
                    isActive
                      ? 'text-foreground bg-secondary/80'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                  )}
                >
                  <span className="mr-1.5">{link.icon}</span>
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-secondary/50 -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex rounded-xl"
              onClick={() => setSearchOpen(!isSearchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && (
                <>
                  <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              )}
            </Button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary/80 transition-all duration-300"
                >
                  <Avatar className="w-8 h-8 border-2 border-border">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 glass-card p-1.5"
                    >
                      <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href={user.role === 'ADMIN' ? '/admin' : user.role === 'VENDOR' ? '/vendor' : '/user'}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-secondary/80 transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/wallet"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-secondary/80 transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Wallet className="w-4 h-4" />
                        Wallet
                      </Link>
                      <Link
                        href="/ai-assistant"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-secondary/80 transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Planner
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-secondary/80 transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-secondary/80 transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive w-full transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-xl">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all',
                    pathname.startsWith(link.href)
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary/50',
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border/50 mt-2">
                <button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground w-full rounded-xl hover:bg-secondary/50 transition-all"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
