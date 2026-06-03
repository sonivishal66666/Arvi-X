'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, ArrowRight, BookOpen, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

const posts = [
  { id: '1', title: 'Top 5 Scenic Bullet Train Routes in India for 2026', readTime: '5 min read', category: 'Guides', author: 'Arvis Travel Desk', desc: 'Discover breathtaking landscapes, clean modern coaches, and ultra-high-speed transit lines operating this summer.', image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=800&q=80' },
  { id: '2', title: 'The Modern Business Commuter Packing Guide', readTime: '4 min read', category: 'Tips', author: 'Vishal Soni', desc: 'Packing light while remaining technologically connected. Essential gear, premium luggage suggestions, and workflow sync.', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80' },
  { id: '3', title: 'How AI Assistants are Revolutionizing Personal Itineraries', readTime: '6 min read', category: 'Technology', author: 'Neural Ops Team', desc: 'Understanding neural travel routing: How real-time telemetry maps out tourist attractions instantly for custom bookings.', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80' },
];

export default function BlogPage() {
  const handleRead = (title: string) => {
    toast.success(`Opening article: ${title}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#020208] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-purple-500/10 top-0 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-pink-500/10 bottom-0 -right-48" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-4 py-1.5 text-sm rounded-full glass border-white/10">Travel Insights</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight premium-gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            The Arvis X Journal
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Your destination for high-speed travel recommendations, packing secrets, and digital assistant breakthroughs.
          </p>
        </motion.div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => handleRead(post.title)}
              className="cursor-pointer group"
            >
              <Card className="glass-card border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 rounded-[28px] overflow-hidden h-full flex flex-col justify-between">
                <div>
                  <div className="relative h-48 overflow-hidden rounded-t-[28px] bg-secondary/35">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black/60 backdrop-blur-md border-white/10 px-3 py-1 rounded-full text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">{post.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{post.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{post.desc}</p>
                  </CardContent>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-all">
                    Read Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
