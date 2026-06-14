'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, Settings, Eye, BarChart3 } from 'lucide-react';

const cookiesInfo = [
  { icon: Settings, title: 'Essential Session Cookies', text: 'Required to authorize passenger accounts, store active local session tokens (JWT), and manage active seat locks during checkout.' },
  { icon: BarChart3, title: 'Analytical & Performance Cookies', text: 'Provide aggregate traffic logs, routing performance metrics, and latency reports to optimize search queries.' },
  { icon: Cookie, title: 'Preference Settings', text: 'Preserve user choices such as dark mode settings, search history cache filters, and regional location structures.' },
];

export default function CookiesPage() {
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
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Cookies Management</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Cookies Policy
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Review how Arvis X utilizes small browser cookie files to ensure instant navigation, session persistence, and system speed.
          </p>
        </motion.div>

        {/* Policy list */}
        <div className="space-y-6">
          {cookiesInfo.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
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
                        <h3 className="font-bold text-white text-base mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
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
