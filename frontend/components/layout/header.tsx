'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore, useUiStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
Menu, X, Search, User, Bell, LogOut,
  Settings, LayoutDashboard, Compass, ChevronDown, Heart, Wallet, Plane, Train,
  Bus, Hotel, Calendar, Command,
} from 'lucide-react';

const navLinks = [
  { href: '/buses', label: 'Buses', icon: Bus },
  { href: '/trains', label: 'Trains', icon: Train },
  { href: '/flights', label: 'Flights', icon: Plane },
  { href: '/hotels', label: 'Hotels', icon: Hotel },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/ai-assistant', label: 'AI Planner', icon: Compass },
];

const dropdownLinks = [
  { href: '', label: 'Dashboard', icon: LayoutDashboard, roleKey: true },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/ai-assistant', label: 'AI Planner', icon: Compass },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isMobileMenuOpen, setMobileMenuOpen, setSearchOpen, isSearchOpen } = useUiStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only prefetch in production to avoid flooding the Next.js compiler in dev mode
    if (process.env.NODE_ENV === 'production') {
      router.prefetch('/trains');
      router.prefetch('/buses');
      router.prefetch('/flights');
      router.prefetch('/hotels');
      router.prefetch('/events');
      router.prefetch('/ai-assistant');
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) setIsDropdownOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    const { setAuthTransition } = useUiStore.getState();
    setAuthTransition(true, 'signout');

    setTimeout(() => {
      useAuthStore.getState().logout();
      setAuthTransition(false);
    }, 1200);
  };

  const getDashboardHref = () => {
    if (!user) return '/user';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'VENDOR') return '/vendor';
    return '/user';
  };

  return (
    <header
      className={cn(
        'fixed left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        isScrolled ? 'top-3 px-4 md:px-6' : 'top-0 px-0'
      )}
    >
      <div
        className={cn(
          'max-w-7xl mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isScrolled
            ? 'rounded-2xl border border-white/[0.06] bg-black/60 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_1px_rgba(255,255,255,0.05)_inset]'
            : 'rounded-none border-b border-white/[0.04] bg-black/20 backdrop-blur-xl'
        )}
      >
        <div className="flex items-center justify-between h-16 md:h-[68px] px-4 md:px-6">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group relative">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <img src="/favicon.png" alt="Arvis X" className="w-full h-full object-contain" />
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/20 transition-all duration-500 rounded-xl" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                Arvis
              </span>
              {' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                X
              </span>
            </span>
          </Link>

          {/* ── Nav Links (Desktop) ── */}
          <nav className="hidden lg:flex items-center gap-0.5 relative">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => router.prefetch(link.href)}
                  className={cn(
                    'relative px-3.5 py-2 text-[13px] font-medium rounded-xl transition-all duration-300 flex items-center gap-1.5 group/link',
                    isActive
                      ? 'text-white'
                      : 'text-white/45 hover:text-white/80',
                  )}
                >
                  <Icon className={cn(
                    'w-3.5 h-3.5 transition-all duration-300',
                    isActive ? 'text-indigo-400' : 'text-white/30 group-hover/link:text-white/60'
                  )} />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08] -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!isSearchOpen)}
              className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="font-light">Search</span>
              <kbd className="hidden lg:inline-flex h-5 px-1.5 rounded bg-white/[0.06] border border-white/[0.08] items-center text-[10px] text-white/30 font-mono ml-3">
                ⌘K
              </kbd>
            </button>


            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative" data-dropdown>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.06] transition-all duration-300 group/avatar"
                >
                  <Avatar className="w-8 h-8 border border-white/[0.1] group-hover/avatar:border-indigo-500/30 transition-all duration-300">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-300">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className={cn(
                    'w-3 h-3 text-white/30 hidden md:block transition-transform duration-300',
                    isDropdownOpen && 'rotate-180'
                  )} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-3 w-64 z-50 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                      >
                        {/* User info */}
                        <div className="p-4 border-b border-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-white/[0.1]">
                              <AvatarImage src={user.image} />
                              <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-300">
                                {user.name?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                              <p className="text-[11px] text-white/40 truncate font-light">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Links */}
                        <div className="p-1.5">
                          {dropdownLinks.map((item) => {
                            const Icon = item.icon;
                            const href = item.roleKey ? getDashboardHref() : item.href;
                            return (
                              <Link
                                key={item.label}
                                href={href}
                                className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/60 rounded-xl hover:bg-white/[0.06] hover:text-white transition-all duration-200 group/item"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <Icon className="w-4 h-4 text-white/30 group-hover/item:text-indigo-400 transition-colors" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>

                        {/* Sign out */}
                        <div className="p-1.5 border-t border-white/[0.06]">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-red-400/80 rounded-xl hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-200 group/sign"
                          >
                            <LogOut className="w-4 h-4 text-red-400/40 group-hover/sign:text-red-400 transition-colors" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] text-[13px] h-9 px-4 font-medium transition-all duration-300"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white text-[13px] h-9 px-5 font-semibold border-0 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-300 ml-1"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'lg:hidden overflow-hidden mt-2 mx-4 rounded-2xl border border-white/[0.06] bg-black/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
            )}
          >
            <nav className="p-3 space-y-0.5">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onMouseEnter={() => router.prefetch(link.href)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-300',
                        isActive
                          ? 'bg-white/[0.06] text-white font-medium border border-white/[0.08]'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.04]',
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className={cn(
                        'w-4 h-4',
                        isActive ? 'text-indigo-400' : 'text-white/30'
                      )} />
                      {link.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Divider + Search */}
              <div className="pt-2 mt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 w-full rounded-xl hover:bg-white/[0.04] hover:text-white transition-all duration-300"
                >
                  <Search className="w-4 h-4 text-white/30" />
                  Search services...
                  <kbd className="ml-auto h-5 px-1.5 rounded bg-white/[0.06] border border-white/[0.08] flex items-center text-[10px] text-white/30 font-mono">
                    ⌘K
                  </kbd>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
