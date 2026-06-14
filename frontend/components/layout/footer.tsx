'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
Compass, Plane, Train, Bus, Hotel, Calendar, ArrowUpRight, Globe2,
  Shield, Zap, Mail, MapPin, Phone, Clock,
} from 'lucide-react';

const serviceLinks = [
  { href: '/buses', label: 'Bus Booking', icon: Bus },
  { href: '/trains', label: 'Train Booking', icon: Train },
  { href: '/flights', label: 'Flight Booking', icon: Plane },
  { href: '/hotels', label: 'Hotel Booking', icon: Hotel },
  { href: '/events', label: 'Event Tickets', icon: Calendar },
];

const companyLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/careers', label: 'Careers' },
  { href: '/press', label: 'Press' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const supportLinks = [
  { href: '/help', label: 'Help Center' },
  { href: '/safety', label: 'Safety' },
  { href: '/cancellation', label: 'Cancellation' },
  { href: '/refunds', label: 'Refunds' },
  { href: '/terms', label: 'Terms of Service' },
];

const socialLinks = [
  { label: 'Twitter', letter: '𝕏', href: '#' },
  { label: 'Instagram', letter: 'IG', href: '#' },
  { label: 'LinkedIn', letter: 'in', href: '#' },
  { label: 'YouTube', letter: 'YT', href: '#' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export function Footer() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <footer className="relative bg-black border-t border-white/[0.04] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-purple-600/[0.03] rounded-full blur-[150px]" />
      </div>

      {/* Grid texture */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* ─── Main Footer Content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 lg:gap-16">

          {/* Brand Column */}
          <motion.div className="col-span-2 md:col-span-4" {...fadeUp}>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img src="/favicon.png" alt="Arvis X" className="w-full h-full object-contain" />
              </div>
              <span
                className="text-xl font-bold tracking-tight"
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

            <p className="text-sm text-white/35 leading-relaxed mb-8 max-w-xs font-light">
              Next-generation AI-powered travel platform. Smart bookings, real-time tracking, and premium experiences across the globe.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2.5 text-xs text-white/30 font-light">
                <Mail className="w-3.5 h-3.5 text-indigo-400/50" />
                <span>support@arvisx.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/30 font-light">
                <Clock className="w-3.5 h-3.5 text-indigo-400/50" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/30 font-light">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400/50" />
                <span>190+ Countries Covered</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 group/social"
                  title={social.label}
                >
                  <span className="text-[10px] font-bold tracking-tight group-hover/social:scale-110 transition-transform">{social.letter}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Services Column */}
          <motion.div className="col-span-1 md:col-span-3" {...fadeUp}>
            <h4
              className="text-xs font-semibold text-white/70 uppercase tracking-[0.2em] mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Services
            </h4>
            <ul className="space-y-1">
              {serviceLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2.5 py-2 text-sm text-white/35 hover:text-white transition-all duration-300 group/link font-light"
                    >
                      <Icon className="w-3.5 h-3.5 text-white/20 group-hover/link:text-indigo-400 transition-colors duration-300" />
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-50 group-hover/link:translate-x-0 transition-all duration-300 ml-auto" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Company Column */}
          <motion.div className="col-span-1 md:col-span-2" {...fadeUp}>
            <h4
              className="text-xs font-semibold text-white/70 uppercase tracking-[0.2em] mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Company
            </h4>
            <ul className="space-y-1">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2 text-sm text-white/35 hover:text-white transition-colors duration-300 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Column */}
          <motion.div className="col-span-1 md:col-span-3" {...fadeUp}>
            <h4
              className="text-xs font-semibold text-white/70 uppercase tracking-[0.2em] mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Support
            </h4>
            <ul className="space-y-1">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2 text-sm text-white/35 hover:text-white transition-colors duration-300 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter hint */}
            <div className="mt-8 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-white/60" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AI Travel Tips</span>
              </div>
              <p className="text-[11px] text-white/30 font-light leading-relaxed">
                Get personalized travel insights and exclusive deals powered by our AI engine.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── Trust Badges ─── */}
        <motion.div
          {...fadeUp}
          className="mt-16 pt-8 border-t border-white/[0.04] flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          {[
            { icon: Shield, label: 'SSL Encrypted' },
            { icon: Zap, label: 'Instant Confirmation' },
            { icon: Globe2, label: 'Global Coverage' },
            { icon: Clock, label: '24/7 Support' },
          ].map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2 text-white/20">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-light tracking-wide">{badge.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* ─── Bottom Bar ─── */}
        <div className="mt-8 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <p className="text-[11px] text-white/25 font-light">
              &copy; {new Date().getFullYear()} Arvis X. All systems operational.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {[
              { href: '/privacy', label: 'Privacy' },
              { href: '/terms', label: 'Terms' },
              { href: '/cookies', label: 'Cookies' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] text-white/25 hover:text-white/60 transition-colors duration-300 font-light"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom glow line ─── */}
      <div className="absolute bottom-0 left-0 right-0 h-px">
        <div className="line-glow w-full animate-gradient-x" />
      </div>
    </footer>
  );
}
