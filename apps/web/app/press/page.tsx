'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Newspaper, Calendar, ArrowRight, ArrowDownToLine, Radio, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const news = [
  { id: '1', date: 'May 28, 2026', title: 'Arvis X Unveils Quantum-Secured Ticketing Framework', source: 'TechCrunch', snippet: 'In an industry first, Arvis X has rolled out multi-factor quantum-encrypted ticket locks across its full national bus and railway networks.' },
  { id: '2', date: 'Apr 15, 2026', title: 'Arvis X Announces 5 Million Active Monthly Commuters', source: 'Economic Times', snippet: 'Marking a record 200% year-on-year growth, the premium travel provider has hit a milestone in pan-Indian transit scheduling.' },
  { id: '3', date: 'Mar 02, 2026', title: 'Founder Vishal Soni outlines vision for AI-driven transport models', source: 'Business Insider', snippet: 'An in-depth look at how Arvis X utilizes neural network pathfinders to minimize route delays and seat allocation times.' },
];

export default function PressPage() {
  const handleDownload = (asset: string) => {
    toast.success(`Media kit asset downloaded: ${asset}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-orange-500/10 top-20 -left-48" />
      <div className="orb w-[450px] h-[450px] bg-red-500/10 bottom-20 -right-48" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Press Room</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            News & Media Center
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Access direct corporate declarations, tech news stories, and visual resource archives relating to Arvis X.
          </p>
        </motion.div>

        {/* Media Kit Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all p-6 rounded-[28px] h-full flex flex-col justify-between">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
                  <Radio className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Official Media Kit</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Download high-resolution corporate vector assets, director biographies, founder photography, and product walkthrough guides.
                </p>
              </CardContent>
              <button
                onClick={() => handleDownload('Arvis_X_Media_Kit_v2.zip')}
                className="flex items-center justify-center gap-2 w-full border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl h-11 text-sm font-medium transition-all"
              >
                Download ZIP Package <ArrowDownToLine className="w-4 h-4 text-indigo-400" />
              </button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all p-6 rounded-[28px] h-full flex flex-col justify-between">
              <CardContent className="p-0">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Company Profile PDF</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  A comprehensive technical summary of Arvis X ticketing algorithms, transactional growth sheets, and customer service guarantees.
                </p>
              </CardContent>
              <button
                onClick={() => handleDownload('Arvis_X_Company_Profile.pdf')}
                className="flex items-center justify-center gap-2 w-full border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl h-11 text-sm font-medium transition-all"
              >
                Download Profile PDF <ArrowDownToLine className="w-4 h-4 text-purple-400" />
              </button>
            </Card>
          </motion.div>
        </div>

        {/* News Feed */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-white/95" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Latest Coverage</h2>
          {news.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all p-6 rounded-2xl">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {item.date}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5"><Newspaper className="w-3.5 h-3.5 text-purple-400" /> {item.source}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.snippet}</p>
                  <a href="#" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
