'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
Compass, Mail, Lock, User, Phone, Loader2, Eye, EyeOff,
  Check, X, ShieldAlert, Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ClientOnly } from '@/components/shared/client-only';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

const requirements = [
  { label: 'Minimum 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase character', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase character', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Numeric character', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>_]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Track input focus states for glowing icons
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const strength = useMemo(() => {
    const passed = requirements.filter(r => r.test(form.password)).length;
    if (form.password.length === 0) return { score: 0, label: 'No Key Entered', color: 'bg-white/5' };
    if (passed <= 2) return { score: 1, label: 'Unsecured Key', color: 'bg-red-500/80' };
    if (passed <= 3) return { score: 2, label: 'Standard Shield', color: 'bg-orange-500/80' };
    if (passed <= 4) return { score: 3, label: 'Highly Encrypted', color: 'bg-yellow-500/80' };
    return { score: 4, label: 'Quantum Sealed', color: 'bg-emerald-500/80' };
  }, [form.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await authApi.register(form);
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      toast.success('Account provisioned. Registry success.');
      router.push(data.user.role === 'VENDOR' ? '/vendor' : '/');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to provision registry.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden pt-24">
      {/* Mesh grid & floating orbs */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none z-0" />
      <div className="orb w-[500px] h-[500px] bg-purple-500/5 -top-20 -right-10 pointer-events-none animate-orb-pulse z-0" />
      <div className="orb w-[450px] h-[450px] bg-indigo-500/5 -bottom-20 -left-10 pointer-events-none animate-float z-0" />

      {/* Floating particles */}
      <ClientOnly>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="absolute w-[2px] h-[2px] rounded-full bg-purple-400/20"
              style={{ left: `${10 + Math.random() * 80}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -150], opacity: [0, 0.7, 0] }}
              transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 4, ease: 'linear' }} 
            />
          ))}
        </div>
      </ClientOnly>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card-dark p-8 border border-white/[0.06] backdrop-blur-3xl shadow-2xl relative overflow-hidden rounded-[32px] bg-black/40">
          {/* Top laser border line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          {/* Scanlines layer */}
          <div className="absolute inset-0 scanlines pointer-events-none opacity-[0.25]" />

          <div className="text-center mb-6 relative z-10">
            <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30 border border-indigo-400/20 group hover:scale-105 transition-transform duration-500">
              <Compass className="h-5 w-5 text-white" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Create Account
            </h1>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-[0.2em] font-bold">Request Node Credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">User Handle</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isNameFocused ? 'text-purple-400' : 'text-white/25'}`} />
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  placeholder="John Doe"
                  className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-purple-500/30 focus:ring-purple-500/10 focus:bg-white/[0.04] transition-all text-sm w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Email Endpoint</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isEmailFocused ? 'text-purple-400' : 'text-white/25'}`} />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="you@domain.com"
                  className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-purple-500/30 focus:ring-purple-500/10 focus:bg-white/[0.04] transition-all text-sm w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Mobile Link (optional)</label>
              <div className="relative">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isPhoneFocused ? 'text-purple-400' : 'text-white/25'}`} />
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
                  placeholder="+91 9000000000"
                  className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-purple-500/30 focus:ring-purple-500/10 focus:bg-white/[0.04] transition-all text-sm w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Terminal Access Key</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isPasswordFocused ? 'text-purple-400' : 'text-white/25'}`} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-purple-500/30 focus:ring-purple-500/10 focus:bg-white/[0.04] transition-all text-sm w-full"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="space-y-2.5 mt-2 bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-xl">
                  <div className="flex gap-1 items-center justify-between">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 rounded-full flex-1 transition-colors duration-500 ${
                            level <= strength.score ? strength.color : 'bg-white/5'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-white/40 ml-3 font-extrabold uppercase tracking-wider shrink-0">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 border-t border-white/[0.04]">
                    {requirements.map((req, i) => {
                      const passed = req.test(form.password);
                      return (
                        <div key={i} className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold">
                          {passed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400/80" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-white/10" />
                          )}
                          <span className={passed ? 'text-emerald-400' : 'text-white/25'}>{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/20 text-xs uppercase tracking-widest mt-6 transition-all duration-300 active:scale-[0.98]"
              disabled={isLoading || (strength.score > 0 && strength.score < 2)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>PROVISIONING CONSOLE LINK...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 mr-1" />
                  <span>SUBMIT REGISTRY APPLICATION</span>
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40 relative z-10">
            Already have an active key?{' '}
            <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              Access Gate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
