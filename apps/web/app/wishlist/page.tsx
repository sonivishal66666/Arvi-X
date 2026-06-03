'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Trash2, ArrowRight, Star, Clock, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { wishlistApi, servicesApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = () => {
    setIsLoading(true);
    wishlistApi.list()
      .then(({ data }) => setItems(data.items || []))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = (serviceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlistApi.remove(serviceId)
      .then(() => { setItems(prev => prev.filter(i => i.serviceId !== serviceId)); toast.success('Removed from wishlist'); })
      .catch(() => toast.error('Failed to remove'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-pink-500/10 top-0 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/10 bottom-0 -right-48" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" {...fadeInUp}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 premium-gradient-text">Your Wishlist</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Save your favourite services and plan your next adventure</p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div className="text-center py-20" {...fadeInUp}>
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">Save services you love by tapping the heart icon</p>
            <Link href="/">
              <Button className="glass-button gap-2">
                <Sparkles className="w-4 h-4" /> Explore Services
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => {
              const service = item.service;
              const categoryIcon: Record<string, string> = { BUS: '🚌', TRAIN: '🚄', FLIGHT: '✈️', HOTEL: '🏨', EVENT: '🎫' };
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/services/${service.id}`} className="block group">
                    <div className="glass rounded-2xl overflow-hidden card-hover">
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <img
                          src={service.images?.[0] || ''}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="glass">{categoryIcon[service.category] || '📋'} {service.category}</Badge>
                          {service.discountPercent > 0 && (
                            <Badge className="bg-green-500/80 text-white">-{service.discountPercent}%</Badge>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleRemove(service.id, e)}
                          className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-semibold text-lg truncate">{service.title}</h3>
                          <p className="text-white/70 text-sm">{service.vendor?.businessName || 'Premium Travels'}</p>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{service.bus?.busType || service.train?.trainType || service.flight?.airline || service.hotel?.propertyType || service.event?.eventType || 'Service'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span className="font-medium">{service.rating || '4.5'}</span>
                            <span className="text-muted-foreground">({service.reviewCount || 0})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground line-through">
                              {service.discountPercent > 0 ? formatCurrency(service.basePrice * 1.2) : ''}
                            </p>
                            <p className="text-lg font-bold premium-gradient-text">{formatCurrency(service.basePrice)}</p>
                          </div>
                          <Button size="sm" className="rounded-xl gap-1">
                            Book <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
