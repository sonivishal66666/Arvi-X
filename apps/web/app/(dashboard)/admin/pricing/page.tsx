'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
X, Loader2, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'

const RULE_TYPES = ['DEMAND', 'TIME_BASED', 'CATEGORY', 'SERVICE_SPECIFIC'] as const
const CATEGORIES = ['ALL', 'BUS', 'TRAIN', 'FLIGHT', 'HOTEL', 'EVENT'] as const

const ruleTypeColors: Record<string, string> = {
  DEMAND: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  TIME_BASED: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  CATEGORY: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SERVICE_SPECIFIC: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

const categoryColors: Record<string, string> = {
  ALL: 'bg-white/10 text-white/60 border-white/20',
  BUS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  TRAIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  FLIGHT: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  HOTEL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  EVENT: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
}

interface PricingRule {
  id: string
  name: string
  description?: string
  ruleType: string
  multiplier: number
  basePrice?: number
  minPrice?: number
  maxPrice?: number
  isActive: boolean
  priority: number
  category: string
  createdAt: string
}

interface RuleForm {
  name: string
  description: string
  ruleType: string
  multiplier: number
  basePrice: string
  minPrice: string
  maxPrice: string
  category: string
  priority: number
  isActive: boolean
}

const emptyForm: RuleForm = {
  name: '',
  description: '',
  ruleType: 'DEMAND',
  multiplier: 1,
  basePrice: '',
  minPrice: '',
  maxPrice: '',
  category: 'ALL',
  priority: 0,
  isActive: true,
}

function ShimmerRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-white/5" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 text-5xl opacity-30">⚙️</div>
      <h3 className="mb-2 text-lg font-medium text-white/70">No pricing rules yet</h3>
      <p className="mb-6 max-w-sm text-sm text-white/40">
        Create dynamic pricing rules to automatically adjust prices based on demand, time, or category.
      </p>
      <Button variant="glass" size="sm" onClick={onCreate}>
        <Plus className="mr-1.5 h-4 w-4" />
        Create your first rule
      </Button>
    </motion.div>
  )
}

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<RuleForm>(emptyForm)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.getPricingRules()
      setRules(data.rules ?? [])
    } catch {
      toast.error('Failed to load pricing rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (rule: PricingRule) => {
    setForm({
      name: rule.name,
      description: rule.description ?? '',
      ruleType: rule.ruleType,
      multiplier: rule.multiplier,
      basePrice: rule.basePrice?.toString() ?? '',
      minPrice: rule.minPrice?.toString() ?? '',
      maxPrice: rule.maxPrice?.toString() ?? '',
      category: rule.category,
      priority: rule.priority,
      isActive: rule.isActive,
    })
    setEditingId(rule.id)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        ruleType: form.ruleType,
        multiplier: form.multiplier,
        basePrice: form.basePrice ? parseFloat(form.basePrice) : undefined,
        minPrice: form.minPrice ? parseFloat(form.minPrice) : undefined,
        maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : undefined,
        category: form.category,
        priority: form.priority,
        isActive: form.isActive,
      }
      if (editingId) {
        await adminApi.updatePricingRule(editingId, payload)
        toast.success('Pricing rule updated')
      } else {
        await adminApi.createPricingRule(payload)
        toast.success('Pricing rule created')
      }
      setDialogOpen(false)
      resetForm()
      fetchRules()
    } catch {
      toast.error(editingId ? 'Failed to update rule' : 'Failed to create rule')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (rule: PricingRule) => {
    try {
      await adminApi.updatePricingRule(rule.id, { isActive: !rule.isActive })
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)))
      toast.success(rule.isActive ? 'Rule deactivated' : 'Rule activated')
    } catch {
      toast.error('Failed to toggle rule status')
    }
  }

  const handleDelete = async (rule: PricingRule) => {
    if (deletingId === rule.id) {
      try {
        await adminApi.deletePricingRule(rule.id)
        setRules((prev) => prev.filter((r) => r.id !== rule.id))
        toast.success('Pricing rule deleted')
        setDeletingId(null)
      } catch {
        toast.error('Failed to delete rule')
        setDeletingId(null)
      }
    } else {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Delete "{rule.name}"?</div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  toast.dismiss(t.id)
                  setDeletingId(rule.id)
                  handleDelete(rule)
                }}
              >
                Confirm
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>
                Cancel
              </Button>
            </div>
          </div>
        ),
        { duration: 8000 },
      )
    }
  }

  const updateForm = <K extends keyof RuleForm>(key: K, value: RuleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Dynamic Pricing Rules</h1>
            <p className="mt-1 text-sm text-white/40">Configure automatic price adjustments based on rules</p>
          </div>
          <Button variant="glass" size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Rule
          </Button>
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
                  {['Name', 'Type', 'Multiplier', 'Category', 'Priority', 'Status', 'Actions'].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <ShimmerRow key={i} />)
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-3">
                      <EmptyState onCreate={openCreate} />
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {rules.map((rule, index) => (
                      <motion.tr
                        key={rule.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white">{rule.name}</div>
                          {rule.description && (
                            <div className="max-w-[200px] truncate text-xs text-white/40">{rule.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border px-2.5 py-0.5 text-xs font-medium ${ruleTypeColors[rule.ruleType] ?? 'bg-white/10 text-white/60 border-white/20'}`}
                          >
                            {rule.ruleType.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/80">{rule.multiplier.toFixed(1)}x</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border px-2.5 py-0.5 text-xs font-medium ${categoryColors[rule.category] ?? 'bg-white/10 text-white/60 border-white/20'}`}
                          >
                            {rule.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/60">{rule.priority}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`border px-2.5 py-0.5 text-xs font-medium ${
                              rule.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEdit(rule)}
                              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(rule)}
                              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              {rule.isActive ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(rule)}
                              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-red-500/20 hover:text-red-400"
                            >
                              {deletingId === rule.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm() } }}>
        <DialogContent className="border-white/10 bg-gray-900/95 text-white backdrop-blur-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{editingId ? 'Edit Pricing Rule' : 'Create Pricing Rule'}</DialogTitle>
            <DialogDescription className="text-white/50">
              {editingId ? 'Update the rule configuration below.' : 'Fill in the details to create a new pricing rule.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="e.g. Weekend Surge"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Optional description of this rule..."
                rows={3}
                className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Rule Type</label>
                <select
                  value={form.ruleType}
                  onChange={(e) => updateForm('ruleType', e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                  {RULE_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-gray-900 text-white">{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm('category', e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Multiplier</label>
                <Input
                  type="number"
                  step={0.1}
                  min={0.5}
                  max={5.0}
                  value={form.multiplier}
                  onChange={(e) => updateForm('multiplier', parseFloat(e.target.value) || 1)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Priority</label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => updateForm('priority', parseInt(e.target.value) || 0)}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Base Price</label>
                <Input
                  type="number"
                  step={0.01}
                  min={0}
                  value={form.basePrice}
                  onChange={(e) => updateForm('basePrice', e.target.value)}
                  placeholder="Optional"
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Min Price</label>
                <Input
                  type="number"
                  step={0.01}
                  min={0}
                  value={form.minPrice}
                  onChange={(e) => updateForm('minPrice', e.target.value)}
                  placeholder="Optional"
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Max Price</label>
                <Input
                  type="number"
                  step={0.01}
                  min={0}
                  value={form.maxPrice}
                  onChange={(e) => updateForm('maxPrice', e.target.value)}
                  placeholder="Optional"
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <label className="text-sm text-white/80" htmlFor="isActive">
                Active
              </label>
              <button
                type="button"
                id="isActive"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => updateForm('isActive', !form.isActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${
                  form.isActive ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    form.isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setDialogOpen(false); resetForm() }}
                className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="premium"
                size="sm"
                disabled={saving}
              >
                {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                {editingId ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
