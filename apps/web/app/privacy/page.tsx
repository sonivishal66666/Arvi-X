'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ShieldCheck, FileKey, Database } from 'lucide-react';

const policies = [
  { icon: Database, title: 'Data Collection Frameworks', text: 'We strictly archive account details (name, validated email, contact numbers) and specific booking logs (schedules, classes, seat coordinates) to facilitate route dispatch audits.' },
  { icon: ShieldCheck, title: 'Commuter Privacy Controls', text: 'Arvis X operates under GDPR and local data protection regulations. Commuters maintain full rights to query active records, request data exports, or request direct profile deletions.' },
  { icon: FileKey, title: 'No Third-Party Interceptions', text: 'Your travel history, category queries, and search telemetry are never shared with marketing brokers. Cookies are solely utilized for active user sessions and analytics.' },
];

export default function PrivacyPage() {
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
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Privacy Registry</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Discover how Arvis X collects, encrypts, and handles customer booking details and payment histories.
          </p>
        </motion.div>

        {/* Policy list */}
        <div className="space-y-6">
          {policies.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
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
                        <h3 className="font-bold text-white text-base mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{p.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{p.text}</p>
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
