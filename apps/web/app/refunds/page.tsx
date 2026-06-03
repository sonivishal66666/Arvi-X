'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, HelpCircle, RefreshCcw, Landmark } from 'lucide-react';

const channels = [
  { icon: Wallet, title: 'Local Digital Wallet', speed: 'Instant (under 1 second)', desc: 'Refund credits are dispatched directly to your Arvis X wallet immediately upon cancellation, ready for your next reservation.' },
  { icon: Landmark, title: 'Bank Account / Card (via Cashfree)', speed: '5 to 7 business days', desc: 'Gateway refunds are processed directly back to the original source card or bank network.' },
  { icon: RefreshCcw, title: 'Coupon Adjustments', speed: 'Immediate', desc: 'Any applied checkout vouchers are voided and their usage limits are reinstated for future bookings.' },
];

export default function RefundsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-purple-500/10 top-20 -left-48" />
      <div className="orb w-[450px] h-[450px] bg-indigo-500/10 bottom-20 -right-48" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Refunds Center</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Refund Processing Details
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Find out how cancelled ticket refunds are credited back to your digital wallet or bank card accounts.
          </p>
        </motion.div>

        {/* Channels */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4 text-white/90" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Refund Options & Timelines</h2>
          {channels.map((chan, i) => {
            const Icon = chan.icon;
            return (
              <motion.div
                key={chan.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="glass-card border-white/5 bg-white/[0.01] rounded-2xl p-6">
                  <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 text-indigo-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{chan.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">{chan.desc}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider self-start md:self-auto flex-shrink-0">
                      {chan.speed}
                    </Badge>
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
