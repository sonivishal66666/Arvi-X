'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
Search, ArrowRight, Star, Shield, Zap, Globe2, Compass, ChevronRight,
  ChevronLeft, Plane, Train, Bus, Hotel, Calendar, ArrowUpRight, Play,
  Pause, MapPin, Clock, Users, Cpu, Fingerprint, Radar, Orbit,
  ScanLine, Layers, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { servicesApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { useUiStore } from '@/lib/store';
import { ClientOnly } from '@/components/shared/client-only';

/* ─────────────────── Data ─────────────────── */

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80',
    title: 'Fly Beyond',
    subtitle: 'Limits',
    tagline: 'AI-optimized routes across 5,200+ global air corridors',
    accent: 'from-indigo-500 to-cyan-400',
    category: 'Flights',
  },
  {
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80',
    title: 'Stay In',
    subtitle: 'Luxury',
    tagline: '25,000+ curated premium stays worldwide',
    accent: 'from-amber-400 to-orange-500',
    category: 'Hotels',
  },
  {
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=80',
    title: 'Ride The',
    subtitle: 'Future',
    tagline: '8,500+ express rail lines with instant e-tickets',
    accent: 'from-emerald-400 to-teal-500',
    category: 'Trains',
  },
  {
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1920&q=80',
    title: 'Journey',
    subtitle: 'Anywhere',
    tagline: '12,000+ smart routes with live tracking',
    accent: 'from-purple-500 to-pink-500',
    category: 'Buses',
  },
  {
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&q=80',
    title: 'Experience',
    subtitle: 'The Moment',
    tagline: '3,800+ exclusive events and VIP experiences',
    accent: 'from-rose-500 to-red-500',
    category: 'Events',
  },
];

const categories = [
  { name: 'Flights', href: '/flights', icon: Plane, gradient: 'from-indigo-600 to-blue-500', glow: 'rgba(99,102,241,0.3)', count: '5,200+', metric: 'Global Routes' },
  { name: 'Hotels', href: '/hotels', icon: Hotel, gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.3)', count: '25,000+', metric: 'Properties' },
  { name: 'Trains', href: '/trains', icon: Train, gradient: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.3)', count: '8,500+', metric: 'Express Lines' },
  { name: 'Buses', href: '/buses', icon: Bus, gradient: 'from-purple-500 to-pink-500', glow: 'rgba(168,85,247,0.3)', count: '12,000+', metric: 'Active Routes' },
  { name: 'Events', href: '/events', icon: Calendar, gradient: 'from-rose-500 to-red-500', glow: 'rgba(244,63,94,0.3)', count: '3,800+', metric: 'VIP Tickets' },
];

const testimonials = [
  { name: 'Aarav Mehta', role: 'Frequent Traveler', text: 'Arvis X completely transformed how I book travel. The AI suggestions are incredibly accurate and the interface is pure luxury.', rating: 5, avatar: 'AM' },
  { name: 'Priya Sharma', role: 'Business Executive', text: 'The multi-modal booking is a game-changer. I can plan my entire trip — flights, hotels, and local transport — in under 2 minutes.', rating: 5, avatar: 'PS' },
  { name: 'Rohit Kumar', role: 'Travel Blogger', text: 'Never seen a travel platform this beautiful. The dark AMOLED theme is stunning and the booking flow is butter smooth.', rating: 5, avatar: 'RK' },
  { name: 'Ananya Iyer', role: 'Digital Nomad', text: 'Real-time tracking and instant e-tickets make traveling stress-free. Arvis X is the future of travel booking.', rating: 5, avatar: 'AI' },
];

const marqueeDestinations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Tokyo', 'Dubai', 'Singapore', 'Paris', 'London',
  'New York', 'Sydney', 'Goa', 'Jaipur', 'Bangkok', 'Bali', 'Maldives', 'Switzerland',
];

const stats = [
  { value: 50000, suffix: '+', label: 'Destinations', icon: MapPin },
  { value: 420, suffix: '+', label: 'Partner Networks', icon: Globe2 },
  { value: 10, suffix: 'M+', label: 'Happy Travelers', icon: Users },
  { value: 4.9, suffix: '/5', label: 'User Rating', icon: Star },
];

/* ─────────────────── Animation Presets ─────────────────── */

const ease = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.8, ease },
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.8 },
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.08 },
  },
  viewport: { once: true },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.7, ease },
};

/* ─────────────────── Particle System ─────────────────── */

function ParticleField() {
  return (
    <ClientOnly>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -600 - Math.random() * 400],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </ClientOnly>
  );
}

/* ─────────────────── Animated Counter ─────────────────── */

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const isDecimal = target % 1 !== 0;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, isInView]);

  const display = target >= 1000 && target < 1000000
    ? `${(count / 1000).toFixed(count >= target ? 0 : 0)}K`
    : count.toString();

  return (
    <span ref={ref} className="tabular-nums">
      {target >= 10000 ? `${Math.floor(count / 1000)}K` : count}
      {suffix}
    </span>
  );
}

/* ─────────────────── Slideshow Progress ─────────────────── */

function SlideProgress({ total, current, onSelect }: { total: number; current: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
          style={{ width: i === current ? 48 : 16 }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full" />
          {i === current && (
            <motion.div
              className="absolute inset-0 bg-white rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 6, ease: 'linear' }}
              key={`progress-${current}`}
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────── Horizontal Scroll Section ─────────────────── */

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -380 : 380, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  return (
    <div className="relative group/scroll">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all opacity-0 group-hover/scroll:opacity-100 -translate-x-2 group-hover/scroll:translate-x-2"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all opacity-0 group-hover/scroll:opacity-100 translate-x-2 group-hover/scroll:-translate-x-2"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-none pb-4 px-1 snap-x snap-mandatory"
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────────── Glowing Orb BG ─────────────────── */

function GlowingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[300px] -left-[200px] w-[700px] h-[700px] rounded-full bg-indigo-600/[0.07] blur-[150px] animate-orb-pulse" />
      <div className="absolute -bottom-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-purple-600/[0.05] blur-[150px] animate-orb-pulse animation-delay-4000" />
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[150px] animate-float-slow" />
    </div>
  );
}

const LOG_MOCK_MESSAGES = [
  { service: 'SECURE-GATEWAY', message: 'Rotating quantum cryptography seed keys', status: 'OK' },
  { service: 'AI-ROUTING-ENGINE', message: 'Recalculating flight corridor wind-drift latency vectors', status: 'INFO' },
  { service: 'PRICE-LOCK', message: 'Sealed maximum fare tariff cap for 48h (ID: pl_8819)', status: 'OK' },
  { service: 'INVENTORY-SYNC', message: 'Updated booking buffers for 12 partnering rail operators', status: 'OK' },
  { service: 'DISPATCHER', message: 'Re-routing smart bus loop delta parameters for weather delay', status: 'WARN' },
  { service: 'GEO-LOCATOR', message: 'Relayed satellite GPS lock telemetry on 4,921 buses', status: 'OK' },
  { service: 'AUTH-NODE', message: 'Validated cryptographic JWT credential tokens', status: 'OK' },
  { service: 'AI-PLANNER', message: 'Synthesized 5-stage customized traveler itinerary dossier', status: 'INFO' },
  { service: 'CACHE-DAEMON', message: 'Purged HMR hydration buffers; re-indexing dynamic layout', status: 'OK' },
  { service: 'RATE-ENGINE', message: 'Fetched live currency rates from central bank nodes', status: 'OK' },
];

/* ═══════════════════════════════════════════════════════ */
/*                     HOMEPAGE                            */
/* ═══════════════════════════════════════════════════════ */

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { setSearchOpen } = useUiStore();

  // Live Telemetry Ledger Logs
  const [logs, setLogs] = useState([
    { id: 1, time: '17:08:00', service: 'SECURE-GATEWAY', message: 'Rotating TLS session keys...', status: 'OK' },
    { id: 2, time: '17:08:02', service: 'AI-ROUTING-ENGINE', message: 'Computing multi-modal route Mumbai -> Paris...', status: 'INFO' },
    { id: 3, time: '17:08:05', service: 'PRICE-LOCK', message: 'Applied 24h price lock on Flight #F-2940', status: 'OK' },
    { id: 4, time: '17:08:08', service: 'INVENTORY-SYNC', message: 'Synchronized 25,000 hotel nodes globally...', status: 'OK' },
    { id: 5, time: '17:08:11', service: 'DISPATCHER', message: 'Optimizing seat maps for Train IR-104...', status: 'INFO' },
  ]);

  const [inferenceTime, setInferenceTime] = useState(120);

  // Dynamic status nodes latencies
  const [nodes, setNodes] = useState([
    { name: 'Flight Hub', icon: Plane, latency: 14, status: 'SYNCED', accent: 'from-purple-500 to-pink-500', color: 'text-purple-400', dotColor: 'bg-purple-400' },
    { name: 'Stay Registry', icon: Hotel, latency: 22, status: 'ONLINE', accent: 'from-emerald-500 to-teal-500', color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
    { name: 'Express Rail', icon: Train, latency: 8, status: 'OPTIMIZED', accent: 'from-blue-500 to-cyan-500', color: 'text-blue-400', dotColor: 'bg-blue-400' },
    { name: 'Smart Transit', icon: Bus, latency: 31, status: 'ONLINE', accent: 'from-amber-500 to-orange-500', color: 'text-amber-400', dotColor: 'bg-amber-400' },
    { name: 'VIP Events', icon: Calendar, latency: 12, status: 'READY', accent: 'from-rose-500 to-red-500', color: 'text-rose-400', dotColor: 'bg-rose-400' },
    { name: 'Cognitive AI', icon: Cpu, latency: 45, status: 'RESOLVED', accent: 'from-teal-500 to-cyan-500', color: 'text-teal-400', dotColor: 'bg-teal-400' },
  ]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const randomMsg = LOG_MOCK_MESSAGES[Math.floor(Math.random() * LOG_MOCK_MESSAGES.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      setLogs(prev => {
        const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
        const newLog = {
          id: nextId,
          time: timeStr,
          service: randomMsg.service,
          message: randomMsg.message,
          status: randomMsg.status
        };
        return [...prev, newLog].slice(-8);
      });

      setInferenceTime(prev => Math.max(80, Math.min(250, prev + Math.floor(Math.random() * 11) - 5)));

      setNodes(prev => prev.map(n => {
        const change = Math.floor(Math.random() * 5) - 2;
        const nextLat = Math.max(4, Math.min(99, n.latency + change));
        return { ...n, latency: nextLat };
      }));
    }, 2500);

    return () => clearInterval(logInterval);
  }, []);

  // Hero slideshow
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Testimonials auto-rotate
  useEffect(() => {
    const interval = setInterval(() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured services
  useEffect(() => {
    servicesApi
      .featured()
      .then(({ data }) => setFeaturedServices(data.services || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div className="overflow-hidden min-h-screen bg-black text-white relative">
      {/* Subtle scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-40" />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Background Slideshow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Animated mesh gradient */}
        <div className="absolute inset-0 hero-mesh-gradient animate-hero-gradient-shift pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-20" />

        {/* Particles */}
        <ParticleField />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-32">
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12">
            {/* Left — Main Content */}
            <div className="flex-1 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease }}
              >
                <Badge className="mb-6 px-4 py-1.5 text-[11px] rounded-full glass border border-white/[0.1] text-indigo-300 font-medium tracking-[0.2em] uppercase animate-pulse-glow">
                  <Compass className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                  Next-Gen Travel Platform
                </Badge>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, ease }}
                >
                  <h1
                    className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter leading-[0.9] mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {slide.title}
                    <br />
                    <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                      {slide.subtitle}
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-white/50 max-w-xl mt-6 font-light leading-relaxed">
                    {slide.tagline}
                  </p>
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease }}
                className="mt-10 flex flex-col sm:flex-row items-start gap-4"
              >
                <Link href={`/${slide.category.toLowerCase()}`}>
                  <Button
                    size="lg"
                    className="group rounded-2xl bg-white text-black hover:bg-white/90 font-semibold px-8 h-14 text-base border-0 shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]"
                  >
                    Explore {slide.category}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => setSearchOpen(true)}
                  className="rounded-2xl text-white/70 hover:text-white hover:bg-white/[0.06] px-8 h-14 text-base backdrop-blur-sm border border-white/[0.06]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search All
                </Button>
              </motion.div>
            </div>

            {/* Right — Slide Controls & Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
              className="flex flex-col items-end gap-6"
            >
              {/* Slide counter */}
              <div className="flex items-center gap-3">
                <span className="text-5xl font-bold text-white/90 tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  0{currentSlide + 1}
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">of</span>
                  <span className="text-lg text-white/30 font-light">0{heroSlides.length}</span>
                </div>
              </div>

              {/* Progress bars */}
              <SlideProgress total={heroSlides.length} current={currentSlide} onSelect={setCurrentSlide} />

              {/* Play/Pause */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                {isPaused ? <Play className="w-4 h-4 text-white/70" /> : <Pause className="w-4 h-4 text-white/70" />}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient edge */}
        <div className="absolute bottom-0 left-0 right-0 h-px">
          <div className="line-glow w-full animate-gradient-x" />
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-light">Scroll to explore</span>
          <div className="w-5 h-9 rounded-full border border-white/10 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-1 rounded-full bg-indigo-400"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════ MARQUEE DESTINATION STRIP ═══════════ */}
      <section className="relative py-6 border-t border-b border-white/[0.04] bg-black/50 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeDestinations, ...marqueeDestinations].map((dest, i) => (
            <span key={i} className="mx-8 text-sm text-white/20 font-light tracking-widest uppercase flex items-center gap-3">
              <span className="w-1 h-1 rounded-full bg-indigo-500/50" />
              {dest}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════ CATEGORIES SECTION ═══════════ */}
      <section className="py-28 relative">
        <GlowingOrbs />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-white/[0.08] text-indigo-400 text-[10px] tracking-[0.25em] uppercase font-medium">
              Travel Domains
            </Badge>
            <h2 className="section-title mb-5 text-glow">
              Choose Your <span className="premium-gradient-text">Dimension</span>
            </h2>
            <p className="section-subtitle mx-auto text-white/40 font-light">
              Five portals. Infinite possibilities. Select your travel category and let our AI handle the rest.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.name} variants={fadeUp}>
                  <Link href={cat.href} className="group block">
                    <div className="relative p-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden transition-all duration-700 hover:border-white/[0.15] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] card-3d">
                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl blur-xl"
                        style={{ background: `radial-gradient(circle at 50% 50%, ${cat.glow}, transparent 70%)` }}
                      />

                      <div className="relative z-10">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Title */}
                        <h3
                          className="text-xl font-bold text-white mb-1 tracking-tight"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {cat.name}
                        </h3>

                        {/* Stats */}
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className={`text-2xl font-bold bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent`}>
                            {cat.count}
                          </span>
                          <span className="text-[11px] text-white/40 font-light">{cat.metric}</span>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center gap-1.5 text-xs text-white/30 group-hover:text-white/70 transition-colors">
                          <span className="font-medium">Explore</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS SECTION ═══════════ */}
      <section className="py-20 relative border-t border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/10 via-purple-950/5 to-pink-950/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="relative p-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm text-center group hover:border-white/[0.12] transition-all duration-500"
                >
                  <Icon className="w-5 h-5 text-indigo-400/60 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div
                    className="text-4xl md:text-5xl font-bold premium-gradient-text mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-white/35 uppercase tracking-[0.2em] font-light">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ QUANTUM TELEMETRY SYSTEM ═══════════ */}
      <section className="py-28 relative overflow-hidden">
        <GlowingOrbs />
        
        {/* Dynamic background tech grid line */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-indigo-500/20 text-indigo-400 text-[10px] tracking-[0.25em] uppercase font-medium shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse-glow">
              Quantum Sync Engine
            </Badge>
            <h2 className="section-title mb-5 text-glow" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Live System <span className="premium-gradient-text">Telemetry</span>
            </h2>
            <p className="section-subtitle mx-auto text-white/40 font-light max-w-2xl">
              Real-time multi-modal transit synchronization, AI path optimizations, and quantum-encrypted booking ledger operations.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box: Live Ledger Terminal (7 columns) */}
            <motion.div 
              className="lg:col-span-7 rounded-3xl border border-white/[0.06] bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[480px] shadow-2xl shadow-indigo-500/5"
              {...fadeUp}
            >
              {/* Terminal header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <span className="text-xs text-white/40 font-mono tracking-wider ml-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    arvis-x@quantum-core:~
                  </span>
                </div>
                <div className="text-[10px] text-white/20 font-mono">
                  SECURE LEDGER CHANNEL
                </div>
              </div>

              {/* Terminal screen */}
              <div className="flex-1 font-mono text-[11px] leading-relaxed text-indigo-300/80 overflow-y-auto space-y-2 pr-2 scrollbar-none min-h-[300px]">
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-2 py-0.5 hover:bg-white/[0.02] rounded px-1 transition-colors"
                    >
                      <span className="text-white/20 select-none">[{log.time}]</span>
                      <span className="text-indigo-400 font-semibold">{log.service}:</span>
                      <span className="text-white/70">{log.message}</span>
                      {log.status === 'OK' && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-bold">
                          SECURED
                        </span>
                      )}
                      {log.status === 'WARN' && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans font-bold">
                          RESOLVING
                        </span>
                      )}
                      {log.status === 'INFO' && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-sans font-bold">
                          ROUTING
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Terminal footer status metrics */}
              <div className="border-t border-white/[0.08] pt-4 mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Inference Time</div>
                  <div className="text-sm font-semibold text-white font-mono">{inferenceTime}ms</div>
                </div>
                <div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Queue Load</div>
                  <div className="text-sm font-semibold text-emerald-400 font-mono">0.02%</div>
                </div>
                <div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Sync Integrity</div>
                  <div className="text-sm font-semibold text-indigo-400 font-mono">100.00%</div>
                </div>
              </div>
            </motion.div>

            {/* Right Box: Global System Node Grid (5 columns) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {/* Radar Widget */}
              <motion.div 
                className="rounded-3xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-xl p-6 relative overflow-hidden flex items-center justify-between shadow-xl"
                {...fadeUp}
              >
                {/* Circular Radar Graphic */}
                <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center border border-white/[0.05] rounded-full">
                  <div className="absolute inset-1.5 border border-dashed border-indigo-500/10 rounded-full" />
                  <div className="absolute inset-5 border border-white/[0.03] rounded-full animate-[spin_12s_linear_infinite]" />
                  
                  {/* Glowing core */}
                  <div className="w-4 h-4 rounded-full bg-indigo-500/30 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  </div>
                  
                  {/* Sweeper arm */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-transparent animate-[spin_3s_linear_infinite]" style={{ transformOrigin: '50% 50%' }} />

                  {/* Pulsing signal dots */}
                  <div className="absolute top-4 left-6 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="absolute bottom-8 right-6 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.8s' }} />
                  <div className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '1.4s' }} />
                </div>

                <div className="flex-1 pl-6">
                  <div className="flex items-center gap-1.5 text-white/30 uppercase tracking-widest text-[9px] font-semibold mb-1">
                    <Radar className="w-3 h-3 text-indigo-400 animate-pulse" />
                    Telemetry Status
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Active Radar Scans
                  </h4>
                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    Constantly scanning 50,000+ booking endpoints to verify instant seat occupancy locks.
                  </p>
                </div>
              </motion.div>

              {/* Service Node Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                {nodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <motion.div
                      key={node.name}
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      className="group relative p-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:border-indigo-500/20 transition-all duration-300 overflow-hidden"
                    >
                      {/* Accent background pulse */}
                      <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-gradient-to-br ${node.accent} opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-300 blur-xl`} />

                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:scale-105 transition-all">
                          <Icon className={`w-4 h-4 ${node.color}`} />
                        </div>
                        <div className="text-[10px] text-white/20 font-mono tracking-wider">
                          {node.latency}ms
                        </div>
                      </div>

                      <h5 className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {node.name}
                      </h5>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`w-1 h-1 rounded-full ${node.dotColor} animate-pulse`} />
                        <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono font-bold">
                          {node.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED SERVICES ═══════════ */}
      <section className="py-28 relative border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14" {...fadeUp}>
            <div>
              <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-white/[0.08] text-indigo-400 text-[10px] tracking-[0.25em] uppercase font-medium">
                Curated Collection
              </Badge>
              <h2 className="section-title mb-3 text-glow">
                Featured <span className="premium-gradient-text">Services</span>
              </h2>
              <p className="section-subtitle text-white/40 font-light">
                Handpicked premium transits and luxury experiences
              </p>
            </div>
            <Link
              href="/search"
              className="mt-6 md:mt-0 flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em] font-medium group"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl overflow-hidden border border-white/[0.04] h-80 shimmer bg-white/[0.02]" />
              ))}
            </div>
          ) : (
            <HorizontalScroll>
              {featuredServices.slice(0, 10).map((service: any, idx: number) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.05, ease }}
                  className="flex-shrink-0 w-[320px] snap-start"
                >
                  <Link href={`/services/${service.id}`} className="block group">
                    <div className="rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)]">
                      <div className="aspect-[16/10] relative overflow-hidden">
                        <img
                          src={service.images?.[0] || 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&q=80'}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="glass text-white/80 border-white/15 text-[10px] font-light backdrop-blur-md">
                            {service.category}
                          </Badge>
                          {service.discountPercent > 0 && (
                            <Badge className="bg-red-500/80 text-white border-0 text-[10px] font-semibold">
                              -{service.discountPercent}%
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <WishlistButton serviceId={service.id} />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3
                          className="font-semibold text-sm truncate mb-1 text-white"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {service.title}
                        </h3>
                        <p className="text-xs text-white/35 mb-4 font-light">
                          {service.vendor?.businessName || 'Premium Transit'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-semibold text-white">{service.rating || '4.5'}</span>
                            <span className="text-[10px] text-white/30">
                              ({service._count?.reviews || 0})
                            </span>
                          </div>
                          <span className="text-base font-bold text-indigo-400">
                            {formatCurrency(service.basePrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </HorizontalScroll>
          )}
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-28 relative border-t border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-white/[0.08] text-indigo-400 text-[10px] tracking-[0.25em] uppercase font-medium">
              Testimonials
            </Badge>
            <h2 className="section-title mb-5 text-glow">
              Trusted By <span className="premium-gradient-text">Travelers</span>
            </h2>
            <p className="section-subtitle mx-auto text-white/40 font-light">
              Real experiences from our global community
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease }}
                className="relative p-10 md:p-14 rounded-[32px] border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl text-center"
              >
                {/* Quote decoration */}
                <div className="absolute top-8 left-10 text-6xl text-indigo-500/10 font-serif leading-none">&ldquo;</div>

                <div className="flex items-center justify-center gap-1 mb-8">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-lg md:text-2xl text-white/80 font-light leading-relaxed mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{testimonials[activeTestimonial].name}</div>
                    <div className="text-xs text-white/40 font-light">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial navigation */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === activeTestimonial
                      ? 'bg-indigo-500 scale-125 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                      : 'bg-white/15 hover:bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ AI PROMOTION ═══════════ */}
      <section className="py-28 relative border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...scaleIn}
            className="relative overflow-hidden rounded-[40px] border border-white/[0.08]"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-black backdrop-blur-3xl" />
            <div className="absolute inset-0 holographic animate-gradient-x" />
            <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-indigo-500/[0.08] rounded-full blur-[100px] animate-orb-pulse" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[100px] animate-orb-pulse animation-delay-4000" />

            <div className="relative z-10 p-10 md:p-20 flex flex-col lg:flex-row items-center justify-between gap-16">
              {/* Left Content */}
              <div className="flex-1 max-w-xl">
                <Badge className="mb-6 bg-indigo-500/15 text-indigo-300 border-indigo-500/20 text-xs px-4 py-1.5 rounded-full">
                  <Compass className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                  AI Travel Intelligence
                </Badge>
                <h2
                  className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Your Personal
                  <br />
                  <span className="premium-gradient-text">AI Concierge</span>
                </h2>
                <p className="text-base md:text-lg text-white/50 mb-10 leading-relaxed font-light">
                  Powered by advanced neural networks, our AI concierge crafts hyper-personalized travel itineraries,
                  monitors fare fluctuations in real-time, and handles every booking detail seamlessly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/ai-assistant">
                    <Button className="rounded-2xl bg-white hover:bg-white/90 text-black font-semibold px-8 h-13 border-0 shadow-[0_0_40px_rgba(255,255,255,0.1)] text-base flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      Launch AI Agent
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="ghost" className="rounded-2xl text-white hover:bg-white/[0.08] px-8 h-13 text-base border border-white/[0.08]">
                      Explore Services
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right — Animated Orb */}
              <div className="w-full lg:w-[340px] aspect-square relative flex items-center justify-center select-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-72 h-72 rounded-full border border-indigo-500/20"
                  style={{ borderStyle: 'dashed' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-56 h-56 rounded-full border border-purple-500/15"
                  style={{ borderStyle: 'dashed' }}
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/10 blur-xl"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 flex items-center justify-center backdrop-blur-xl border border-white/10"
                >
                  <Compass className="w-10 h-10 text-indigo-300" />
                </motion.div>

                {/* Orbiting dots */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                    className="absolute"
                    style={{ width: 180 + i * 30, height: 180 + i * 30 }}
                  >
                    <div
                      className="absolute w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                      style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-32 relative border-t border-white/[0.04]">
        <div className="absolute inset-0 hero-mesh-gradient opacity-50" />
        <ParticleField />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div {...fadeUp}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-8 rounded-full border border-indigo-500/20 flex items-center justify-center"
              style={{ borderStyle: 'dashed' }}
            >
              <Compass className="w-8 h-8 text-indigo-400" />
            </motion.div>

            <h2
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-glow"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Ready To <span className="premium-gradient-text">Travel?</span>
            </h2>
            <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto mb-12 font-light leading-relaxed">
              Join millions of travelers who trust Arvis X for seamless, AI-powered booking experiences across the globe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 text-white font-semibold shadow-[0_0_50px_rgba(99,102,241,0.25)] border-0 px-10 h-14 text-base transition-all duration-500 hover:shadow-[0_0_70px_rgba(99,102,241,0.35)]"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl glass-button px-10 h-14 text-base text-white/70 hover:text-white border border-white/[0.08]"
                >
                  Browse Services
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 mt-14 text-white/20">
              <div className="flex items-center gap-2 text-xs font-light">
                <Shield className="w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-light">
                <Zap className="w-4 h-4" />
                <span>Instant Booking</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-light">
                <Globe2 className="w-4 h-4" />
                <span>190+ Countries</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
