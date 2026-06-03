'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarDays, Wallet, TrendingUp, Ticket, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { userApi } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function UserDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.stats(),
      userApi.bookings({ limit: 5 }),
    ]).then(([statsRes, bookingsRes]) => {
      setStats(statsRes.data.stats);
      setBookings(bookingsRes.data.bookings || []);
    }).finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Ticket, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Spent', value: formatCurrency(stats?.totalSpent || 0), icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { label: 'Upcoming', value: stats?.upcomingBookings || 0, icon: CalendarDays, color: 'from-emerald-500 to-teal-500' },
    { label: 'Wallet Balance', value: formatCurrency(stats?.walletBalance || 0), icon: Wallet, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your bookings and preferences</p>
            </div>
            <Link href="/search">
              <Button className="rounded-xl">
                <Ticket className="w-4 h-4 mr-2" /> Book Now
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link href="/user/bookings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium mb-2">No bookings yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start your travel journey with Arvis X</p>
                  <Link href="/search"><Button>Browse Services</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking: any) => (
                    <Link
                      key={booking.id}
                      href={`/bookings/${booking.id}`}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-all border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">
                          {booking.service?.category === 'BUS' ? '🚌' :
                           booking.service?.category === 'TRAIN' ? '🚄' :
                           booking.service?.category === 'FLIGHT' ? '✈️' :
                           booking.service?.category === 'HOTEL' ? '🏨' : '🎫'}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{booking.service?.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(booking.finalAmount)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
