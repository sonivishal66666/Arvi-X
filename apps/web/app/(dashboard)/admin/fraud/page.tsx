'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, ShieldAlert, AlertTriangle, Shield } from 'lucide-react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface FraudItem {
  userId: string
  name: string
  email: string
  count: number
  totalAmount?: number
}

interface FraudData {
  suspiciousBookings: FraudItem[]
  failedPayments: FraudItem[]
}

function getSeverityIndicator(count: number) {
  if (count > 20) {
    return { label: 'Critical', variant: 'destructive' as const, bar: 'bg-red-500' }
  }
  if (count > 10) {
    return { label: 'Warning', variant: 'warning' as const, bar: 'bg-amber-500' }
  }
  return { label: 'Suspicious', variant: 'secondary' as const, bar: 'bg-yellow-500' }
}

function AlertCard({
  item,
  showAmount,
}: {
  item: FraudItem
  showAmount: boolean
}) {
  const severity = getSeverityIndicator(item.count)
  const barWidth = Math.min((item.count / 50) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white truncate">{item.name}</span>
            <Badge variant={severity.variant} className="shrink-0 text-[10px] px-2 py-0">
              {severity.label}
            </Badge>
          </div>
          <p className="text-xs text-white/40 truncate">{item.email}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-white/50">
              <span className="text-white/80 font-medium">{item.count}</span> suspicious{' '}
              {item.count === 1 ? 'activity' : 'activities'}
            </span>
            {showAmount && item.totalAmount != null && (
              <span className="text-xs text-white/50">
                Total: <span className="text-white/80 font-medium">{formatCurrency(item.totalAmount)}</span>
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full max-w-[200px] rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full ${severity.bar} transition-all duration-500`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${severity.bar}/20`}>
          <AlertTriangle className={`w-4 h-4 ${severity.bar.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  )
}

function ShimmerCard() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-white/10" />
              <div className="h-3 w-48 rounded bg-white/5" />
              <div className="flex gap-3">
                <div className="h-3 w-24 rounded bg-white/5" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
        <Shield className="h-8 w-8 text-emerald-400" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-white/70">No suspicious activity detected</h3>
      <p className="max-w-xs text-sm text-white/40">All clear. There are no fraud alerts to review at this time.</p>
    </motion.div>
  )
}

export default function FraudMonitoringPage() {
  const [data, setData] = useState<FraudData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await adminApi.fraudAlerts()
      setData(res.data)
    } catch {
      toast.error('Failed to load fraud alerts')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const hasBookings = data && data.suspiciousBookings.length > 0
  const hasPayments = data && data.failedPayments.length > 0
  const isEmpty = !loading && data && !hasBookings && !hasPayments

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition-all hover:border-white/20 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Fraud Monitoring</h1>
              <p className="text-sm text-white/40 mt-0.5">Track suspicious activity and failed payments</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="border-white/10 bg-white/5 text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Suspicious Bookings</h2>
                </div>
                {data && (
                  <Badge variant="destructive" className="text-xs">
                    {data.suspiciousBookings.length}
                  </Badge>
                )}
              </div>
              <div className="p-5">
                {loading ? (
                  <ShimmerCard />
                ) : hasBookings ? (
                  <div className="space-y-3">
                    {data.suspiciousBookings.map((item) => (
                      <AlertCard key={item.userId} item={item} showAmount />
                    ))}
                  </div>
                ) : !isEmpty ? (
                  <div className="py-8 text-center text-sm text-white/40">No suspicious bookings</div>
                ) : null}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Failed Payment Alerts</h2>
                </div>
                {data && (
                  <Badge variant="warning" className="text-xs">
                    {data.failedPayments.length}
                  </Badge>
                )}
              </div>
              <div className="p-5">
                {loading ? (
                  <ShimmerCard />
                ) : hasPayments ? (
                  <div className="space-y-3">
                    {data.failedPayments.map((item) => (
                      <AlertCard key={item.userId} item={item} showAmount={false} />
                    ))}
                  </div>
                ) : !isEmpty ? (
                  <div className="py-8 text-center text-sm text-white/40">No failed payment alerts</div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>

        {isEmpty && <EmptyState />}
      </div>
    </div>
  )
}
