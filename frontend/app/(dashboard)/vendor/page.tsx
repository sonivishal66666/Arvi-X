'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, DollarSign, Users, Ticket, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vendorApi } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendorDashboard() {
  const [data, setData] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vendorApi.dashboard(),
      vendorApi.revenue('weekly'),
    ]).then(([dashRes, revRes]) => {
      setData(dashRes.data);
      setRevenue(revRes.data.revenue || []);
    }).finally(() => setIsLoading(false));
  }, []);

  const stats = data?.stats || {};

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your services and bookings</p>
            </div>
            <Link href="/vendor/services/new">
              <Button className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add Service
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Services', value: stats.totalServices || 0, icon: Building2, color: 'from-blue-500 to-cyan-500' },
              { label: 'Total Bookings', value: stats.totalBookings || 0, icon: Ticket, color: 'from-purple-500 to-pink-500' },
              { label: 'Revenue', value: formatCurrency(stats.totalRevenue || 0), icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
              { label: 'Pending Payout', value: formatCurrency(stats.pendingPayout || 0), icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
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

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Link href="/vendor/bookings" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.recentBookings?.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                      <div>
                        <p className="text-sm font-medium">{booking.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.service?.title}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Services</CardTitle>
              <Link href="/vendor/services" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.services?.slice(0, 6).map((service: any) => (
                  <Link
                    key={service.id}
                    href={`/vendor/services/${service.id}`}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {service.category === 'BUS' ? '🚌' :
                         service.category === 'TRAIN' ? '🚄' :
                         service.category === 'FLIGHT' ? '✈️' :
                         service.category === 'HOTEL' ? '🏨' : '🎫'}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{service.title}</p>
                        <p className="text-xs text-muted-foreground">{service._count?.bookings || 0} bookings</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
