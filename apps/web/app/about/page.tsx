'use client';

import { motion } from 'framer-motion';
import { Shield, Sparkles, Target, Users, Landmark, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  { icon: Target, title: 'AI-Powered Orchestration', description: 'Driving travel planning efficiency to the absolute edge with automated neural networks.' },
  { icon: Shield, title: 'Uncompromising Trust', description: 'Securing client booking data with high-grade quantum transaction safeguards.' },
  { icon: Users, title: 'Global Connectivity', description: 'Empowering commuters with instant transport integrations worldwide.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/10 top-20 -left-48" />
      <div className="orb w-[500px] h-[500px] bg-purple-500/10 bottom-20 -right-48" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">About Arvis X</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Next-Gen Orbital Travel
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-base md:text-lg">
            Reimagining global and municipal transportation booking systems through state-of-the-art AI-driven automation, sleek design frameworks, and quantum security standards.
          </p>
        </motion.div>

        {/* Founder Spotlights */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-20"
        >
          <div className="relative p-[1px] rounded-[32px] overflow-hidden bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30">
            <div className="bg-black/55 backdrop-blur-3xl rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-5xl font-extrabold text-white">VS</span>
                {/* Glow ring */}
                <div className="absolute -inset-2 rounded-3xl border border-indigo-500/30 border-t-transparent border-b-transparent animate-spin-slow pointer-events-none" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <Badge variant="outline" className="mb-2 border-indigo-500/30 text-indigo-400 bg-indigo-500/5 px-3 py-1 text-xs">FOUNDER & DIRECTOR</Badge>
                <h2 className="text-3xl font-bold mb-3 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Vishal Soni</h2>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-6">
                  "At Arvis X, we are setting a new paradigm for how the world navigates travel coordination. Our mission is clear: to fuse ultimate transactional speed, elegant design interfaces, and real-time algorithmic routes into an elite-level experience. We believe travel should not just be automated, but absolute perfection."
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><Landmark className="w-4 h-4 text-indigo-400" /> Strategic Direction</span>
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-purple-400" /> Technology Innovation</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mission Statements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
              >
                <Card className="glass-card h-full border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 rounded-3xl">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6">
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{v.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card rounded-[32px] border border-white/5 p-8 text-center bg-white/[0.01]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-extrabold text-white">420+</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Active Schedules</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white">100%</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Seat Verification</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white">0s</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">Refunding Latency</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white">24/7</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">AI Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
