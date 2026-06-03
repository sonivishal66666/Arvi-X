'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, HelpCircle, CheckCircle, Clock } from 'lucide-react';

const rules = [
  { time: 'Within 1 hour', fee: 'No cancellation fee (100% refund)', note: 'Applies to all confirmed tickets immediately following booking.' },
  { time: 'Up to 24 hours before departure', fee: '10% cancellation fee', note: 'Standard provider network fee applies.' },
  { time: 'Within 24 hours of departure', fee: '50% cancellation fee', note: 'Last minute seat release fee applies.' },
  { time: 'After service departure', fee: 'No refund available', note: 'Missed departures are classified as no-show reservations.' },
];

export default function CancellationPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-orange-500/10 top-20 -left-48" />
      <div className="orb w-[450px] h-[450px] bg-red-500/10 bottom-20 -right-48" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Cancellation Policy</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ticket Cancellation Rules
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Review detailed timelines, processing fees, and free cancellation margins before triggering ticket adjustments.
          </p>
        </motion.div>

        {/* Cancellation Schedule */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4 text-white/90" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Standard Fee Matrices</h2>
          {rules.map((rule, i) => (
            <motion.div
              key={rule.time}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="glass-card border-white/5 bg-white/[0.01] rounded-2xl p-6">
                <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 text-orange-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{rule.time}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{rule.note}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/5 px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold uppercase tracking-wider self-start md:self-auto">
                    {rule.fee}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
