'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, TrendingUp, RefreshCw, Activity, ShoppingBag, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await adminApi.analytics(period);
      setData(res.data);
    } catch {
      toast.error('Failed to compile sales analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = data ? {
    totalRevenue: data.dailyRevenue?.reduce((sum: number, r: any) => sum + r.revenue, 0) || 0,
    totalTransactions: data.dailyRevenue?.reduce((sum: number, r: any) => sum + r.transactions, 0) || 0,
    averageTicketValue: data.dailyRevenue?.reduce((sum: number, r: any) => sum + r.transactions, 0) > 0
      ? (data.dailyRevenue?.reduce((sum: number, r: any) => sum + r.revenue, 0) || 0) / 
        (data.dailyRevenue?.reduce((sum: number, r: any) => sum + r.transactions, 0) || 1)
      : 0,
  } : { totalRevenue: 0, totalTransactions: 0, averageTicketValue: 0 };

  return (
    <div className="pt-24 min-h-screen bg-[#020208] text-white relative overflow-hidden pb-16">
      {/* Background elements */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse" />
      <div className="orb w-[500px] h-[500px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Navigation & Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition-all hover:border-indigo-500/30 hover:text-white"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Revenue & Analytics
              </h1>
              <p className="text-xs text-white/40 mt-0.5 font-light">Audit financial charts, transaction logs, and platform distribution ratios.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex glass p-1 rounded-xl border border-white/[0.08] backdrop-blur-md bg-black/40">
              {(['7d', '30d', '90d', '1y'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 relative ${
                    period === p
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="border-white/10 bg-white/5 text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white disabled:opacity-40 h-9 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* Stats HUD Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              title: 'Gross Earnings',
              value: formatCurrency(stats.totalRevenue),
              description: `Revenue compiled in last ${period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : 'year'}`,
              icon: DollarSign,
              color: 'from-emerald-500 to-teal-500',
            },
            {
              title: 'Confirmed Transactions',
              value: stats.totalTransactions,
              description: 'Successful transit payments logged',
              icon: ShoppingBag,
              color: 'from-indigo-500 to-purple-500',
            },
            {
              title: 'Average Order Value',
              value: formatCurrency(stats.averageTicketValue),
              description: 'Mean revenue calculated per ticket',
              icon: TrendingUp,
              color: 'from-amber-500 to-orange-500',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-white/[0.06] bg-white/[0.02] backdrop-blur-md rounded-2xl shadow-lg transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight mt-1.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</h3>
                        <p className="text-[10px] text-white/30 mt-1 font-light">{stat.description}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500`}>
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts HUD section */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 h-[400px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
            <div className="h-[400px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Revenue Trend Area Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="glass border-white/[0.08] bg-black/40 rounded-3xl overflow-hidden shadow-2xl h-[400px] flex flex-col justify-between relative">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between border-b border-white/[0.05]">
                  <div>
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      <Activity className="w-4.5 h-4.5 text-indigo-400" />
                      Sales Performance Graph
                    </CardTitle>
                    <p className="text-[10px] text-white/40 mt-0.5 font-light">Timeline audit for ticket collections.</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-4 flex-1">
                  <div className="w-full h-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.dailyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                        <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.2)" fontSize={9} tickLine={false} />
                        <YAxis stroke="rgba(255, 255, 255, 0.2)" fontSize={9} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(2, 2, 8, 0.95)', borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, fontSize: 11 }}
                          labelStyle={{ color: '#818cf8', fontWeight: 600 }}
                        />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Split Pie Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="glass border-white/[0.08] bg-black/40 rounded-3xl overflow-hidden shadow-2xl h-[400px] flex flex-col justify-between relative">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <CardHeader className="p-6 pb-0 border-b border-white/[0.05]">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <BarChart3 className="w-4.5 h-4.5 text-purple-400" />
                    Revenue Splits
                  </CardTitle>
                  <p className="text-[10px] text-white/40 mt-0.5 font-light">Distribution across transport models.</p>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.categoryRevenue || []}
                          dataKey="revenue"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {(data?.categoryRevenue || []).map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(2, 2, 8, 0.8)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(2, 2, 8, 0.95)', borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, fontSize: 11 }}
                          formatter={(val: number) => formatCurrency(val)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend layout */}
                  <div className="flex flex-wrap justify-center gap-3 mt-4 text-[9px] uppercase font-bold tracking-widest text-white/50">
                    {(data?.categoryRevenue || []).map((r: any, idx: number) => (
                      <div key={r.category} className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span>{r.category}: {formatCurrency(r.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Top Performing Services */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/[0.08] bg-black/40 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <CardHeader className="p-6 border-b border-white/[0.05]">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <Users className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                Performance Leaderboard
              </CardTitle>
              <p className="text-[10px] text-white/40 mt-0.5 font-light">Most booked flights, hotel suites, events, and express routes online.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-[10px] text-white/40 uppercase tracking-widest font-semibold bg-white/[0.01]">
                      <th className="py-4 px-6">Consignment Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6 text-right">Base Pricing</th>
                      <th className="py-4 px-6 text-right">Confirmed Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-white/[0.05]">
                          <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded animate-pulse w-48" /></td>
                          <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded animate-pulse w-20" /></td>
                          <td className="py-4 px-6 text-right"><div className="h-4 bg-white/5 rounded animate-pulse w-24 ml-auto" /></td>
                          <td className="py-4 px-6 text-right"><div className="h-4 bg-white/5 rounded animate-pulse w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : !data?.topServices || data.topServices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-white/20 text-xs uppercase tracking-widest font-bold">
                          No service transactions logged
                        </td>
                      </tr>
                    ) : (
                      data.topServices.map((svc: any, idx: number) => (
                        <tr key={svc.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors duration-300">
                          <td className="py-4 px-6 font-semibold flex items-center gap-3 text-white text-xs md:text-sm">
                            <span className="text-white/20 font-mono text-xs">{idx + 1}.</span>
                            {svc.title}
                          </td>
                          <td className="py-4 px-6">
                            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-light rounded-full">{svc.category}</Badge>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-white/70 text-xs md:text-sm">{formatCurrency(svc.basePrice)}</td>
                          <td className="py-4 px-6 text-right font-bold text-indigo-400 text-xs md:text-sm">{svc._count?.bookings || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
