'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck, HeartHandshake, KeyRound, Radio, Eye } from 'lucide-react';

const blocks = [
  { icon: KeyRound, title: 'Quantum-Encrypted Bookings', desc: 'Financial processing pipelines are hardened using 256-bit cryptographic locks, isolating payment vectors entirely from core user registries.' },
  { icon: ShieldCheck, title: 'Verified Travel Operators', desc: 'All transport operators, buses, hotel networks, and event organizers undergo detailed security checks and active compliance verification before onboarding.' },
  { icon: Eye, title: 'Privacy First Architecture', desc: 'We do not sell traveler itineraries or search behavior histories. Commuters maintain full authority to purge active session caches.' },
];

export default function SafetyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/10 top-10 -left-48" />
      <div className="orb w-[450px] h-[450px] bg-blue-500/10 bottom-10 -right-48" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Trust & Safety</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Travel With Confidence
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Discover the infrastructure measures keeping your reservations secure, your data private, and your journeys stress-free.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blocks.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all p-6 rounded-[28px] h-full">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{b.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
