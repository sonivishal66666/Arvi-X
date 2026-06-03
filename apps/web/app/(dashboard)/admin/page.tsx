'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, Building2, DollarSign, Ticket, TrendingUp, AlertTriangle, Shield,
  Percent, Layout, Sparkles, ChevronRight, Activity, Cpu, Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const stats = data?.stats || {};

  const panels = [
    {
      title: 'User Management',
      desc: 'Verify registry accounts, configure global roles, and ban items.',
      href: '/admin/users',
      icon: Users,
      color: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'group-hover:border-cyan-500/30',
      badge: stats.totalUsers ? `${stats.totalUsers} registered` : null,
    },
    {
      title: 'Vendor Verification',
      desc: 'Approve and onboard multi-channel service partners.',
      href: '/admin/vendors',
      icon: Building2,
      color: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'group-hover:border-purple-500/30',
      badge: stats.pendingVendors ? `${stats.pendingVendors} pending` : null,
      badgeVariant: 'warning' as const,
    },
    {
      title: 'Booking Management',
      desc: 'Review passenger tickets, check-in records, and transit details.',
      href: '/admin/bookings',
      icon: Ticket,
      color: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/30',
      badge: stats.totalBookings ? `${stats.totalBookings} total` : null,
    },
    {
      title: 'Revenue & Analytics',
      desc: 'Deep financial metrics, transaction logs, and analytical paths.',
      href: '/admin/analytics',
      icon: DollarSign,
      color: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/30',
      badge: 'Interactive HUD',
    },
    {
      title: 'Fraud Monitoring',
      desc: 'Detect suspicious transactions and filter security limits.',
      href: '/admin/fraud',
      icon: Shield,
      color: 'from-red-500/20 via-rose-500/10 to-transparent',
      borderColor: 'group-hover:border-rose-500/30',
      badge: 'Quantum Shield',
    },
    {
      title: 'Surge Controls',
      desc: 'Deploy priority multipliers and demand-based fee parameters.',
      href: '/admin/pricing',
      icon: TrendingUp,
      color: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
      borderColor: 'group-hover:border-fuchsia-500/30',
      badge: 'Surge Engine',
    },
    {
      title: 'CMS Page Config',
      desc: 'Configure landing hero sliders, descriptions, and banners.',
      href: '/admin/cms',
      icon: Layout,
      color: 'from-teal-500/20 via-sky-500/10 to-transparent',
      borderColor: 'group-hover:border-teal-500/30',
      badge: 'Terminal Editor',
    },
    {
      title: 'Offers & Coupons',
      desc: 'Issue coupon limits, percentage rewards, and discount caps.',
      href: '/admin/coupons',
      icon: Percent,
      color: 'from-pink-500/20 via-rose-500/10 to-transparent',
      borderColor: 'group-hover:border-pink-500/30',
      badge: 'Marketing',
    },
  ];

  return (
    <div className="pt-24 min-h-screen bg-[#020208] text-white relative overflow-hidden pb-16">
      {/* Background vector grids and ambient light */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="mb-3 px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                HUD Command Center
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Admin Portal
              </h1>
              <p className="text-xs text-white/40 mt-1 font-light">Execute directory modifications, verify transactions, and coordinate metrics.</p>
            </div>
            
            <div className="flex items-center gap-3 glass border border-white/[0.08] px-4 py-2 rounded-2xl backdrop-blur-3xl bg-black/40 shrink-0 select-none shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-white/60">System Sync Success</span>
            </div>
          </div>

          {/* Quick Metrics HUD Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-12">
            {[
              { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
              { label: 'Registered Vendors', value: stats.totalVendors || 0, icon: Building2, color: 'from-purple-500 to-pink-500' },
              { label: 'Total Transits', value: stats.totalBookings || 0, icon: Ticket, color: 'from-emerald-500 to-teal-500' },
              { label: 'Gross Revenue', value: formatCurrency(stats.totalRevenue || 0), icon: DollarSign, color: 'from-amber-500 to-orange-500' },
              { label: 'Active Sessions', value: stats.activeUsers || 0, icon: TrendingUp, color: 'from-rose-500 to-red-500' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <div className="relative overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 hover:border-white/15 transition-all duration-300 shadow-md">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative z-10">
                      <div className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3.5 shadow-inner`}>
                        <Icon className="w-4.5 h-4.5 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <p className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{stat.value}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-light">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Launchpad Grid */}
          <div className="mb-12">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-6 select-none">
              <Activity className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
              Portal Control Core
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {panels.map((panel, idx) => {
                const Icon = panel.icon;
                return (
                  <motion.div
                    key={panel.title}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group"
                  >
                    <Link href={panel.href}>
                      <div className={cn(
                        "relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-black/20 p-5 h-[175px] flex flex-col justify-between transition-all duration-500 hover:shadow-[0_15px_30px_rgba(99,102,241,0.06)] group-hover:-translate-y-1",
                        panel.borderColor
                      )}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.01] opacity-50" />
                        
                        <div className="flex items-start justify-between z-10">
                          <div className={`w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-500`}>
                            <Icon className="w-5 h-5 text-indigo-400" />
                          </div>
                          {panel.badge && (
                            <Badge variant={panel.badgeVariant || 'default'} className="text-[9px] px-2.5 py-0.5 border-0 bg-white/[0.08] text-white/80 font-light rounded-full tracking-wide">
                              {panel.badge}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="z-10">
                          <h4 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            {panel.title}
                            <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </h4>
                          <p className="text-[10px] text-white/40 mt-1 leading-relaxed font-light">{panel.desc}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Charts & Actions Section */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Split Distribution (8 columns) */}
            <div className="lg:col-span-8">
              <Card className="glass border-white/[0.08] bg-black/40 rounded-3xl overflow-hidden shadow-2xl h-[420px] flex flex-col justify-between relative">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between border-b border-white/[0.05]">
                  <div>
                    <CardTitle className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Category Splits</CardTitle>
                    <p className="text-[10px] text-white/40 mt-0.5 font-light">Transit distribution splits logged across models.</p>
                  </div>
                  <Link href="/admin/analytics">
                    <Button variant="outline" size="sm" className="text-[10px] bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-white/80 rounded-xl">
                      Query Analytics
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
                  <div className="w-full h-[220px]">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.bookingsByCategory || []}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={4}
                          >
                            {(data?.bookingsByCategory || []).map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(2, 2, 8, 0.8)" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(2, 2, 8, 0.95)', borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, fontSize: 11 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  {/* Legend layout */}
                  <div className="flex flex-wrap justify-center gap-4 mt-4 text-[9px] uppercase font-bold tracking-widest text-white/50">
                    {(data?.bookingsByCategory || []).map((r: any, idx: number) => (
                      <div key={r.category} className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.05] px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span>{r.category}: {r.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security log (4 columns) */}
            <div className="lg:col-span-4 flex flex-col">
              <Card className="glass border-white/[0.08] bg-black/40 rounded-3xl overflow-hidden shadow-2xl h-[420px] flex flex-col justify-between relative">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between border-b border-white/[0.05]">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Shield className="w-4.5 h-4.5 text-indigo-400" />
                    Security Console
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
                  {/* Action 1 */}
                  <div className="flex items-center justify-between p-4 rounded-[18px] bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">Pending Vendors</p>
                        <p className="text-[10px] text-white/40 mt-0.5 truncate font-light">
                          {stats.pendingVendors || 0} reviewers pending confirmation.
                        </p>
                      </div>
                    </div>
                    {stats.pendingVendors > 0 ? (
                      <Link href="/admin/vendors">
                        <Button variant="outline" size="sm" className="h-7 text-[9px] bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-white rounded-lg">
                          Verify
                        </Button>
                      </Link>
                    ) : (
                      <Badge className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-light">SYNCED</Badge>
                    )}
                  </div>

                  {/* Action 2 */}
                  <div className="flex items-center justify-between p-4 rounded-[18px] bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-start gap-3 min-w-0">
                      <Shield className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">Fraud Shield Active</p>
                        <p className="text-[10px] text-white/40 mt-0.5 truncate font-light">Spam patterns monitor offline checks.</p>
                      </div>
                    </div>
                    <Link href="/admin/fraud">
                      <Button variant="outline" size="sm" className="h-7 text-[9px] bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-white rounded-lg">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
