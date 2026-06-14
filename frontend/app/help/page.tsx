'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, LifeBuoy, CreditCard, Shield, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  { icon: LifeBuoy, name: 'Booking Help', desc: 'Schedules, seats, and routing updates' },
  { icon: CreditCard, name: 'Payments & Refunds', desc: 'Wallet credits, Cashfree verification, and coupons' },
  { icon: Shield, name: 'Trust & Safety', desc: 'Profile credentials, identity verification' },
  { icon: Settings, name: 'Technical Support', desc: 'AI Itineraries, OTP systems, notifications' },
];

const faqs = [
  { q: 'How does automated wallet refunder work?', a: 'When you cancel a ticket that qualifies for a refund, the amount paid is instantly credited to your Arvis X digital wallet balance. You can immediately use this balance to book other buses, trains, flights, hotels, or events without payment processing delays.', category: 'Payments & Refunds' },
  { q: 'What is the ticket cancellation timeline?', a: 'You can cancel any confirmed ticket up to 1 hour after creation for a 100% free cancellation refund. For cancellations initiated closer to departure times, service provider cancellation policies apply.', category: 'Booking Help' },
  { q: 'Why is my seat lock failing?', a: 'Arvis X operates live seat locking. When you click on a seat, it is locked to your session for 15 minutes to prevent double-booking. If you fail to check out within this window, the lock expires and returns to available inventory.', category: 'Booking Help' },
  { q: 'How do I apply checkout coupons?', a: 'During checkout on the booking screen, enter the active voucher code (e.g. WELCOME50) in the coupon input field. Pressing "Apply Coupon" instantly verifies bounds and reduces your final subtotal.', category: 'Payments & Refunds' },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/10 top-0 -left-48" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/10 bottom-0 -right-48" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Help Center</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            How Can We Assist You?
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto mb-8">
            Query our database of automated FAQs, browse support categories, or initiate a ticket directly.
          </p>

          <div className="relative w-full max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search help topics, error messages, policies..."
              className="pl-11 h-12 bg-white/[0.02] border-white/10 rounded-2xl glass input-premium"
            />
          </div>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-16">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.name;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => {
                  setActiveCategory(isSelected ? 'All' : cat.name);
                  setExpandedFaq(null);
                }}
                className="cursor-pointer"
              >
                <Card className={`glass-card border-white/5 h-full transition-all duration-300 rounded-[24px] ${isSelected ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/[0.01] hover:bg-white/[0.03]'}`}>
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.03] border border-white/10 text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{cat.name}</h3>
                    <p className="text-[11px] text-muted-foreground leading-normal">{cat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-white/90" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Frequently Asked Questions</h2>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm glass rounded-2xl border border-white/5">
              No matching help topics found. Reach out via the Contact hub for support.
            </div>
          ) : (
            filteredFaqs.map((faq, i) => {
              const isExpanded = expandedFaq === i;
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    onClick={() => setExpandedFaq(isExpanded ? null : i)}
                    className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer rounded-2xl overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-white text-base md:text-md" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{faq.q}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
