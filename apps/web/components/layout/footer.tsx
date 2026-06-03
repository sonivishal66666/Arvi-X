'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const footerLinks = {
  Services: [
    { href: '/buses', label: 'Bus Booking' },
    { href: '/trains', label: 'Train Booking' },
    { href: '/flights', label: 'Flight Booking' },
    { href: '/hotels', label: 'Hotel Booking' },
    { href: '/events', label: 'Event Tickets' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  Support: [
    { href: '/help', label: 'Help Center' },
    { href: '/safety', label: 'Safety' },
    { href: '/cancellation', label: 'Cancellation' },
    { href: '/refunds', label: 'Refunds' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Arvis <span className="text-muted-foreground">X</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Premium AI-powered travel platform for the modern explorer. Book smarter, travel better.
            </p>
            <div className="flex items-center gap-3">
              {['Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <span className="text-xs font-medium">{social[0]}</span>
                </Link>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Arvis X. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
