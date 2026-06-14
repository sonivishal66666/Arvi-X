'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ticket, Clock, Search, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { userApi } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    userApi.bookings({ limit: 50 })
      .then(({ data }) => setBookings(data.bookings || []))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = bookings.filter(b =>
    !searchTerm || b.service?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 min-h-screen">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-muted-foreground mt-1">View and manage all your bookings</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search bookings..."
                className="pl-10 glass border-white/10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-medium mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try a different search term' : 'Start your travel journey with Arvis X'}
              </p>
              <Link href="/search"><Button className="rounded-xl">Browse Services</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((booking, i) => {
                const svc = booking.service || {};
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="block glass rounded-2xl p-5 card-hover"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {svc.category === 'BUS' ? '🚌' : svc.category === 'TRAIN' ? '🚄' : svc.category === 'FLIGHT' ? '✈️' : svc.category === 'HOTEL' ? '🏨' : '🎫'}
                          </span>
                          <div>
                            <h3 className="font-medium">{svc.title || 'Service'}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatDate(booking.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                            <p className="text-sm font-medium mt-1 premium-gradient-text">{formatCurrency(booking.finalAmount)}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
