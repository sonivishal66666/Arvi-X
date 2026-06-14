'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'] as const
type StatusTab = (typeof STATUS_TABS)[number]

const categoryEmojis: Record<string, string> = {
  BUS: '🚌',
  TRAIN: '🚄',
  FLIGHT: '✈️',
  HOTEL: '🏨',
  EVENT: '🎫',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  REFUNDED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

interface Booking {
  id: string
  status: string
  finalAmount: number
  createdAt: string
  user: { name: string; email: string }
  service: { title: string; category: string; vendor: { businessName: string } }
  payments: { amount: number; status: string; method: string }[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function ShimmerRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-white/5" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 text-5xl opacity-30">📋</div>
      <h3 className="mb-2 text-lg font-medium text-white/70">No bookings found</h3>
      <p className="max-w-sm text-sm text-white/40">
        There are no bookings matching your current filters. Try adjusting your search or filter criteria.
      </p>
    </motion.div>
  )
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const status = activeTab === 'ALL' ? undefined : activeTab
      const { data } = await adminApi.bookings({ status, search, page, limit: 10 })
      setBookings(data.bookings)
      setPagination(data.pagination)
    } catch {
      toast({ title: 'Error', description: 'Failed to load bookings', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [activeTab, search, page])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    setPage(1)
  }, [activeTab, search])

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition-all hover:border-white/20 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">Booking Management</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white/15 text-white shadow-lg'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  {tab === 'ALL' ? tab : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <Input
              placeholder="Search by user, service, or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 sm:w-72"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['User', 'Service', 'Category', 'Vendor', 'Amount', 'Status', 'Date', 'Actions'].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-3">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {bookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white">{booking.user.name}</div>
                          <div className="text-xs text-white/40">{booking.user.email}</div>
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-sm text-white/80">
                          {booking.service.title}
                        </td>
                        <td className="px-4 py-3 text-lg">
                          {categoryEmojis[booking.service.category] ?? '🎫'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/70">
                          {booking.service.vendor.businessName}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {formatCurrency(booking.finalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border px-2.5 py-0.5 text-xs font-medium ${statusColors[booking.status] ?? 'bg-white/10 text-white/60 border-white/20'}`}
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-white/50">
                          {formatDate(booking.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/bookings/${booking.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/10 bg-white/5 text-xs text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white"
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
              <p className="text-sm text-white/40">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-white/10 bg-white/5 text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (pagination.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-white/10 bg-white/5 text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white disabled:opacity-30"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
