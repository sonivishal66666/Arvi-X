'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Layout, Layers, Info, Mail, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { adminApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
}

interface AboutContent {
  description: string
}

interface ContactContent {
  email: string
  phone: string
  address: string
}

interface CMSData {
  hero: HeroContent
  featuredCategories: string[]
  about: AboutContent
  contact: ContactContent
}

const STORAGE_KEY = 'arvis-admin-cms'

const defaultCMS: CMSData = {
  hero: {
    title: 'Book Your Next Adventure',
    subtitle: 'Discover buses, trains, flights, hotels & events — all in one place',
    ctaText: 'Explore Now',
  },
  featuredCategories: ['BUS', 'TRAIN', 'FLIGHT', 'HOTEL', 'EVENT'],
  about: {
    description:
      'Arvis is a comprehensive travel booking platform that lets you search, compare, and book buses, trains, flights, hotels, and events across India. Powered by AI, we help you plan the perfect itinerary.',
  },
  contact: {
    email: 'support@arvis.com',
    phone: '+91 1800-XXX-XXX',
    address: 'Mumbai, Maharashtra, India',
  },
}

const CATEGORY_OPTIONS = [
  { value: 'BUS', label: 'Bus', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'TRAIN', label: 'Train', gradient: 'from-orange-500 to-red-500' },
  { value: 'FLIGHT', label: 'Flight', gradient: 'from-purple-500 to-pink-500' },
  { value: 'HOTEL', label: 'Hotel', gradient: 'from-emerald-500 to-teal-500' },
  { value: 'EVENT', label: 'Event', gradient: 'from-amber-500 to-yellow-500' },
]

function SectionCard({
  icon: Icon,
  title,
  gradient,
  children,
  onSave,
  saving,
}: {
  icon: React.ElementType
  title: string
  gradient: string
  children: React.ReactNode
  onSave: () => void
  saving: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-white/20"
    >
      <div className={`flex items-center gap-3 border-b border-white/10 px-6 py-4`}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} bg-white/10`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
      <div className="flex justify-end border-t border-white/5 px-5 py-3">
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30"
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </motion.div>
  )
}

function ToggleChip({
  selected,
  label,
  gradient,
  onClick,
}: {
  selected: boolean
  label: string
  gradient: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
        selected
          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
          : 'border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
      }`}
    >
      {label}
    </button>
  )
}

export default function CMSPage() {
  const [cms, setCMS] = useState<CMSData>(defaultCMS)
  const [loading, setLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  const loadCMS = useCallback(() => {
    setLoading(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCMS(JSON.parse(stored))
      }
    } catch {
      toast.error('Failed to load CMS data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCMS()
  }, [loadCMS])

  const persistCMS = (updated: CMSData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      toast.error('Failed to save to local storage')
    }
  }

  const updateHero = (field: keyof HeroContent, value: string) => {
    setCMS((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }))
  }

  const toggleCategory = (category: string) => {
    setCMS((prev) => {
      const exists = prev.featuredCategories.includes(category)
      return {
        ...prev,
        featuredCategories: exists
          ? prev.featuredCategories.filter((c) => c !== category)
          : [...prev.featuredCategories, category],
      }
    })
  }

  const updateAbout = (value: string) => {
    setCMS((prev) => ({ ...prev, about: { description: value } }))
  }

  const updateContact = (field: keyof ContactContent, value: string) => {
    setCMS((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }))
  }

  const saveSection = (section: string, updated: CMSData) => {
    setSavingSection(section)
    setTimeout(() => {
      persistCMS(updated)
      setSavingSection(null)
      toast.success(`${section} content saved`)
    }, 400)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <Link
            href="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-md transition-all hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Content Management</h1>
            <p className="text-sm text-white/40 mt-0.5">Edit homepage content and site settings</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 h-5 w-36 rounded bg-white/10" />
                <div className="space-y-3">
                  <div className="h-9 rounded-lg bg-white/5" />
                  <div className="h-9 rounded-lg bg-white/5" />
                  <div className="h-9 rounded-lg bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <SectionCard
              icon={Layout}
              title="Hero Banner"
              gradient="from-purple-600 to-pink-600"
              onSave={() => saveSection('Hero Banner', cms)}
              saving={savingSection === 'Hero Banner'}
            >
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    Title
                  </label>
                  <Input
                    value={cms.hero.title}
                    onChange={(e) => updateHero('title', e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    Subtitle
                  </label>
                  <Input
                    value={cms.hero.subtitle}
                    onChange={(e) => updateHero('subtitle', e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    CTA Button Text
                  </label>
                  <Input
                    value={cms.hero.ctaText}
                    onChange={(e) => updateHero('ctaText', e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={Layers}
              title="Featured Categories"
              gradient="from-blue-500 to-cyan-500"
              onSave={() => saveSection('Featured Categories', cms)}
              saving={savingSection === 'Featured Categories'}
            >
              <p className="mb-3 text-xs text-white/40">
                Select which categories appear on the homepage
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <ToggleChip
                    key={cat.value}
                    selected={cms.featuredCategories.includes(cat.value)}
                    label={cat.label}
                    gradient={cat.gradient}
                    onClick={() => toggleCategory(cat.value)}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={Info}
              title="About Section"
              gradient="from-emerald-500 to-teal-500"
              onSave={() => saveSection('About Section', cms)}
              saving={savingSection === 'About Section'}
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-white/50 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={cms.about.description}
                  onChange={(e) => updateAbout(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 backdrop-blur-md transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={Mail}
              title="Contact Info"
              gradient="from-amber-500 to-orange-500"
              onSave={() => saveSection('Contact Info', cms)}
              saving={savingSection === 'Contact Info'}
            >
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    Email
                  </label>
                  <Input
                    value={cms.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    Phone
                  </label>
                  <Input
                    value={cms.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/50 uppercase tracking-wider">
                    Address
                  </label>
                  <Input
                    value={cms.contact.address}
                    onChange={(e) => updateContact('address', e.target.value)}
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  )
}
