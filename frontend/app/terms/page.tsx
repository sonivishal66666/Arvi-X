'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Gavel, Scale, ShieldCheck } from 'lucide-react';

const sections = [
  { icon: Gavel, title: '1. Core Ticketing Agreement', text: 'Arvis X operates as a secondary portal interface connecting passengers to municipal, national, and corporate travel operators (buses, trains, airlines, hotels). Bookings completed on this app establish direct carriage contracts with the relevant service provider.' },
  { icon: Scale, title: '2. Financial Liabilities & Fees', text: 'All base rates, dynamic multipliers, checkouts, and transactional taxes are calculated transparently prior to authorization. Payment failures, signature anomalies, or card rejections are handled by the integrated payment processors.' },
  { icon: ShieldCheck, title: '3. Acceptable Account Usage', desc: 'Commuters must supply authentic name records, email references, and contact details during account onboarding. Failure to verify credentials may trigger administrative account suspensions or ticket locking actions.' },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/10 top-10 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/10 bottom-10 -right-48" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Legal Registry</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Terms of Service
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Please read these terms carefully before initializing bookings, executing wallet transfers, or querying local schedules.
          </p>
        </motion.div>

        {/* Policy list */}
        <div className="space-y-6">
          {sections.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <motion.div
                key={sec.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="glass-card border-white/5 bg-white/[0.01] p-6 rounded-2xl">
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 text-indigo-400">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{sec.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{sec.text || sec.desc}</p>
                      </div>
                    </div>
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
