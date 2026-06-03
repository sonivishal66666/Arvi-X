'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Star, Shield, Zap, Globe2, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { servicesApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { useAuthStore, useUiStore } from '@/lib/store';

const categories = [
  { name: 'Bus', href: '/buses', icon: '🚌', gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80', desc: '12,000+ active routes' },
  { name: 'Train', href: '/trains', icon: '🚄', gradient: 'from-orange-500/20 via-red-500/10 to-transparent', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&q=80', desc: '8,500+ express lines' },
  { name: 'Flight', href: '/flights', icon: '✈️', gradient: 'from-purple-500/20 via-pink-500/10 to-transparent', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80', desc: '5,200+ global air routes' },
  { name: 'Hotel', href: '/hotels', icon: '🏨', gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', desc: '25,000+ luxury stays' },
  { name: 'Event', href: '/events', icon: '🎫', gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80', desc: '3,800+ exclusive VIP tickets' },
];

const features = [
  { icon: Zap, title: 'AI Booking Engine', description: 'Smart seat allocation and real-time flight path adjustments using neural routing.' },
  { icon: Shield, title: 'Quantum Security', description: 'Multi-factor quantum-encrypted financial transactions with instant wallet check.' },
  { icon: Globe2, title: 'Pan-Global Travel', description: 'Connecting over 50,000 modern travel destinations with hyper-fast dispatching.' },
  { icon: Star, title: '24/7 Virtual Concierge', description: 'Luxury custom itineraries, automated updates, and zero-delay refunds.' },
];

const heroImages = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80', // Airplane airliner in flight
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80', // Luxury hotel exterior and pool
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1600&q=80', // Premium high-speed train
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1600&q=80', // Luxury sleeper coach bus
];

const fadeInUp = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] }
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } }
};

function StatCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <>{target >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}</>;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImage, setHeroImage] = useState(0);
  const { setSearchOpen } = useUiStore();

  useEffect(() => {
    const interval = setInterval(() => setHeroImage(prev => (prev + 1) % heroImages.length), 6000);
    servicesApi.featured()
      .then(({ data }) => setFeaturedServices(data.services || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="overflow-hidden min-h-screen bg-[#020208] text-white">
      {/* Hero Canvas */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroImage}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <img src={heroImages[heroImage]} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#020208]/80 via-[#020208]/40 to-[#020208]" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge className="mb-6 px-4 py-1.5 text-xs rounded-full glass border border-white/[0.08] text-indigo-300 font-medium tracking-wide animate-pulse-glow">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              THE FUTURE OF TRAVEL IS HERE
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Travel Beyond
              <br />
              <span className="premium-gradient-text">The Horizon</span>
            </h1>

            <p className="text-base md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Experience next-generation orbital travel coordination, quantum booking systems,
              and AI-driven itinerary paths for flights, luxury hotels, trains, and curated events.
            </p>


            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-white/40 font-light">
              <span>Hyperlinks:</span>
              {['Mumbai Orbit', 'Bangalore Hub', 'Delhi Terminal'].map((route) => (
                <Link
                  key={route}
                  href={`/search?q=${encodeURIComponent(route)}`}
                  className="hover:text-indigo-400 transition-colors underline underline-offset-4 decoration-white/10"
                >
                  {route}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-[10px] uppercase tracking-widest">Dock Entry</span>
          <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 rounded-full bg-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Grid Categories Section */}
      <section className="py-24 relative border-t border-white/[0.04] bg-black/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.05)_0%,transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <Badge className="mb-4 px-3 py-1 rounded-full glass border border-white/[0.08] text-indigo-400 text-[10px] tracking-widest uppercase">
              Dimensions
            </Badge>
            <h2 className="section-title mb-4">Select Domain</h2>
            <p className="section-subtitle mx-auto">Explore state-of-the-art booking portals across our main categories</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {categories.map((cat) => (
              <motion.div key={cat.name} variants={fadeInUp} className="group">
                <Link
                  href={cat.href}
                  className="relative block h-72 rounded-[24px] overflow-hidden border border-white/[0.05] bg-black/20 card-hover"
                >
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-start">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-md flex items-center justify-center mb-3 border border-white/[0.08] text-xl group-hover:scale-115 transition-transform duration-500">
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-1 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cat.name}</h3>
                    <p className="text-[11px] text-white/50 font-light">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Features Section */}
      <section className="py-24 relative border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <Badge className="mb-4 px-3 py-1 rounded-full glass border border-white/[0.08] text-indigo-400 text-[10px] tracking-widest uppercase">
              Engines
            </Badge>
            <h2 className="section-title mb-4">Core Specifications</h2>
            <p className="section-subtitle mx-auto">Engineered to support a smooth, premium travel dispatch cycle</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="glass-card border border-white/[0.06] p-6 relative hover:border-indigo-500/20 hover:shadow-[0_15px_40px_rgba(99,102,241,0.1)] transition-all duration-500 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-white/[0.08] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-base mb-2 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{feature.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Counters Section */}
      <section className="py-16 relative border-t border-white/[0.04] bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { label: 'Registered Portals', value: 420, suffix: '+', icon: '⚡' },
              { label: 'Active Terminals', value: 50, suffix: '+', icon: '🛰️' },
              { label: 'System Commits', value: 10000, suffix: '+', icon: '💎' },
              { label: 'Uptime Index', value: 4.9, suffix: '/5', icon: '⭐' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="glass border border-white/[0.05] p-6 rounded-2xl text-center hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold premium-gradient-text tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <StatCounter target={stat.value} />
                  {stat.suffix}
                </div>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wider font-light">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Rated Services */}
      <section className="py-24 relative border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12" {...fadeInUp}>
            <div>
              <Badge className="mb-4 px-3 py-1 rounded-full glass border border-white/[0.08] text-indigo-400 text-[10px] tracking-widest uppercase">
                Consignments
              </Badge>
              <h2 className="section-title mb-2">Featured Services</h2>
              <p className="section-subtitle">Premium selected transits and luxury spaces currently online</p>
            </div>
            <Link
              href="/search"
              className="mt-4 md:mt-0 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors uppercase tracking-wider font-medium"
            >
              View Grid <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass rounded-[20px] overflow-hidden border border-white/[0.04] h-72 shimmer" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredServices.slice(0, 8).map((service: any) => (
                <motion.div key={service.id} variants={fadeInUp}>
                  <Link href={`/services/${service.id}`} className="block group">
                    <div className="glass-card overflow-hidden border border-white/[0.06] hover:border-indigo-500/20 transition-all duration-300">
                      <div className="aspect-[16/10] relative overflow-hidden">
                        <img
                          src={service.images?.[0] || 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&q=80'}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="glass text-white/80 border-white/20 text-[10px] font-light">{service.category}</Badge>
                          {service.discountPercent > 0 && (
                            <Badge className="bg-red-500/80 text-white border-0 text-[10px] font-semibold">-{service.discountPercent}%</Badge>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <WishlistButton serviceId={service.id} />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-sm truncate mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{service.title}</h3>
                        <p className="text-xs text-white/40 mb-4 font-light">{service.vendor?.businessName || 'Premium Transit'}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-semibold">{service.rating || '4.5'}</span>
                            <span className="text-[10px] text-white/40">({service._count?.reviews || 0})</span>
                          </div>
                          <span className="text-sm font-bold text-indigo-400">{formatCurrency(service.basePrice)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* AI Promotion Area */}
      <section className="py-24 relative border-t border-white/[0.04] bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[32px] border border-white/[0.08]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-950/40 to-pink-900/10 backdrop-blur-3xl" />
            <div className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <Badge className="mb-4 bg-indigo-500/15 text-indigo-300 border-indigo-500/20 text-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  Neural AI Core
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Deploy Travel Agent Intelligence
                </h2>
                <p className="text-sm md:text-base text-white/50 mb-8 leading-relaxed font-light">
                  Our advanced AI travel concierge compiles hyper-tailored luxury itineraries, monitors seat pricing anomalies, and streamlines checkout pathways.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/ai-assistant">
                    <Button className="rounded-xl bg-white hover:bg-white/90 text-black font-semibold px-6 h-11 border-0 shadow-lg shadow-white/5 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Initialize Agent
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="ghost" className="rounded-xl text-white hover:bg-white/[0.08] px-6 h-11">
                      Query Registry
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-80 aspect-square relative flex items-center justify-center select-none">
                <div className="absolute w-64 h-64 rounded-full border border-indigo-500/20 animate-orb-pulse" />
                <div className="absolute w-48 h-48 rounded-full border border-purple-500/10 animate-float" />
                <div className="absolute w-32 h-32 rounded-full border border-pink-500/20 animate-orb-pulse animation-delay-2000" />
                <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse-glow" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Registration CTA */}
      <section className="py-24 relative border-t border-white/[0.04] bg-[#020208]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Begin Registration Flow
            </h2>
            <p className="text-sm text-white/40 max-w-lg mx-auto mb-8 font-light">
              Provision your digital wallet, set category rules, and explore travel services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 border-0 px-8 h-12">
                  Create Account
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="rounded-xl glass-button px-8 h-12">
                  Query Portals
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
