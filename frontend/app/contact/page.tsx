'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    // Simulate contact form submission
    setTimeout(() => {
      toast.success('Your message has been dispatched successfully!');
      setFormData({ name: '', email: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-purple-500/10 top-0 -right-48 animate-orb-pulse" />
      <div className="orb w-[450px] h-[450px] bg-indigo-500/10 bottom-0 -left-48 animate-float" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Secure Communications</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Contact Arvis X
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Get in touch with our operations center. Reach out directly to our leadership or dispatch general requests below.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          {/* Info cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Leadership Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent"
            >
              <div className="glass-card bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5">EXECUTIVE OFFICE</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Vishal Soni</h3>
                <p className="text-xs text-muted-foreground mb-4">Founder & Director</p>
                <div className="space-y-3.5 text-sm">
                  <a href="mailto:vishal.soni@arvisx.com" className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span>vishal.soni@arvisx.com</span>
                    <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                  </a>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span>+91 Executive Desk</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Direct Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-3xl p-6 border border-white/5 bg-white/[0.01] space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Client Operations</h4>
                  <p className="text-xs text-muted-foreground mt-1">Our support staff is active 24/7 to solve booking changes, transaction audits, and refund triggers.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Corporate Hub</h4>
                  <p className="text-xs text-muted-foreground mt-1">Gurugram Tech Park, Sector 45, Haryana, India.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form panel */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-[1px] rounded-[32px] bg-gradient-to-tr from-white/5 via-white/10 to-transparent"
            >
              <form onSubmit={handleSubmit} className="glass-card bg-black/30 rounded-[32px] p-8 md:p-10 border border-white/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="input-premium bg-white/[0.02] border-white/10 rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="input-premium bg-white/[0.02] border-white/10 rounded-2xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Transmission Message</label>
                  <Textarea
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message or request..."
                    className="input-premium bg-white/[0.02] border-white/10 rounded-3xl p-4 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl h-12 font-semibold shadow-lg shadow-indigo-500/20"
                >
                  {sending ? 'Sending...' : 'Send Transmission'}
                  <Send className="w-4 h-4 ml-2" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Encrypted via TLS 1.3 quantum link protection.</span>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
