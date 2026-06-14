'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeft, Plus, RefreshCw } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderAmount: number
  maxDiscount: number | null
  usageLimit: number
  perUserLimit: number
  usedCount: number
  expiresAt: string
  isActive: boolean
  createdAt: string
}

interface CouponForm {
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: string
  minOrderAmount: string
  maxDiscount: string
  usageLimit: string
  perUserLimit: string
  expiresAt: string
  isActive: boolean
}

const emptyForm: CouponForm = {
  code: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderAmount: '0',
  maxDiscount: '',
  usageLimit: '100',
  perUserLimit: '1',
  expiresAt: '',
  isActive: true,
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CouponForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CouponForm, string>>>({})

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.coupons()
      setCoupons(data.coupons)
    } catch {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const validate = (): boolean => {
    const errs: Partial<Record<keyof CouponForm, string>> = {}
    if (!form.code.trim()) errs.code = 'Code is required'
    if (!form.value || Number(form.value) <= 0) errs.value = 'Value must be greater than 0'
    if (!form.type) errs.type = 'Type is required'
    if (!form.expiresAt) errs.expiresAt = 'Expiry date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (field: keyof CouponForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await adminApi.createCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: Number(form.usageLimit),
        perUserLimit: Number(form.perUserLimit),
        expiresAt: form.expiresAt,
        isActive: form.isActive,
      })
      toast.success('Coupon created successfully')
      setModalOpen(false)
      setForm(emptyForm)
      fetchCoupons()
    } catch {
      toast.error('Failed to create coupon')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    try {
      await adminApi.updateCoupon(coupon.id, { isActive: !coupon.isActive })
      toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`)
      fetchCoupons()
    } catch {
      toast.error('Failed to update coupon')
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Coupon Management</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchCoupons}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-600/25 transition-all hover:shadow-xl hover:shadow-purple-600/30"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-20 text-center text-white/40">
              <p className="text-lg">No coupons found</p>
              <p className="mt-1 text-sm">Create your first coupon to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                    <th className="px-6 py-4 font-medium">Code</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Value</th>
                    <th className="px-6 py-4 font-medium">Min Order</th>
                    <th className="px-6 py-4 font-medium">Used / Limit</th>
                    <th className="px-6 py-4 font-medium">Expiry</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon, i) => (
                    <motion.tr
                      key={coupon.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 transition-colors hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-mono text-white">{coupon.code}</td>
                      <td className="px-6 py-4">
                        <Badge variant={coupon.type === 'PERCENTAGE' ? 'default' : 'secondary'}>
                          {coupon.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                      </td>
                      <td className="px-6 py-4 text-white/60">{formatCurrency(coupon.minOrderAmount)}</td>
                      <td className="px-6 py-4 text-white/60">
                        {coupon.usedCount} / {coupon.usageLimit}
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={coupon.isActive ? 'success' : 'destructive'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(coupon)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
                          >
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Delete this coupon?')) return
                              try {
                                await adminApi.updateCoupon(coupon.id, { isActive: false })
                                await fetchCoupons()
                                toast.success('Coupon deleted')
                              } catch {
                                toast.error('Failed to delete coupon')
                              }
                            }}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 backdrop-blur-md transition-all hover:bg-red-500/20 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900/90 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Create Coupon</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-white/60">Code</label>
                  <Input
                    value={form.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    placeholder="e.g. SUMMER20"
                    className="w-full"
                  />
                  {errors.code && <p className="mt-1 text-xs text-red-400">{errors.code}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-white/60">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value as 'PERCENTAGE' | 'FIXED')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white backdrop-blur-md outline-none transition-colors focus:border-purple-500/50"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                  {errors.type && <p className="mt-1 text-xs text-red-400">{errors.type}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-white/60">
                    Value {form.type === 'PERCENTAGE' ? '(%)' : '(Amount)'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                  {errors.value && <p className="mt-1 text-xs text-red-400">{errors.value}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-white/60">Min Order Amount</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minOrderAmount}
                      onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/60">Max Discount</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.maxDiscount}
                      onChange={(e) => handleChange('maxDiscount', e.target.value)}
                      placeholder="Unlimited"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-white/60">Usage Limit</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.usageLimit}
                      onChange={(e) => handleChange('usageLimit', e.target.value)}
                      placeholder="100"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-white/60">Per User Limit</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.perUserLimit}
                      onChange={(e) => handleChange('perUserLimit', e.target.value)}
                      placeholder="1"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-white/60">Expires At</label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => handleChange('expiresAt', e.target.value)}
                    className="w-full"
                  />
                  {errors.expiresAt && <p className="mt-1 text-xs text-red-400">{errors.expiresAt}</p>}
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-white/80">Active on creation</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-600/25 transition-all hover:shadow-xl hover:shadow-purple-600/30 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
