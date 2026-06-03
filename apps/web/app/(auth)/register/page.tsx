'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Phone, Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

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

  const strength = useMemo(() => {
    const passed = requirements.filter(r => r.test(form.password)).length;
    if (form.password.length === 0) return { score: 0, label: '', color: '' };
    if (passed <= 2) return { score: 1, label: 'Standard Code', color: 'bg-red-500/80' };
    if (passed <= 3) return { score: 2, label: 'Moderate Code', color: 'bg-orange-500/80' };
    if (passed <= 4) return { score: 3, label: 'Secure Code', color: 'bg-yellow-500/80' };
    return { score: 4, label: 'Highly Encrypted', color: 'bg-emerald-500/80' };
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
    <div className="min-h-screen bg-[#020208] text-white flex items-center justify-center p-4 relative overflow-hidden pt-24">
      {/* Mesh grid & floating orbs */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -right-10 pointer-events-none animate-orb-pulse" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/5 -bottom-20 -left-10 pointer-events-none animate-float" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card-dark p-8 border border-white/[0.08] backdrop-blur-3xl shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <div className="text-center mb-6">
            <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Create an account
            </h1>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Provision New Terminal Profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">User Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="pl-10 input-premium border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35 h-11 text-sm rounded-xl w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Email Endpoint</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@domain.com"
                  className="pl-10 input-premium border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35 h-11 text-sm rounded-xl w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Mobile Link (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9000000000"
                  className="pl-10 input-premium border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35 h-11 text-sm rounded-xl w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Terminal Access Key</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 input-premium border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35 h-11 text-sm rounded-xl w-full"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {form.password.length > 0 && (
                <div className="space-y-2 mt-2 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= strength.score ? strength.color : 'bg-white/5'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-white/40 ml-2 font-medium">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 border-t border-white/5">
                    {requirements.map((req, i) => {
                      const passed = req.test(form.password);
                      return (
                        <div key={i} className="flex items-center gap-1.5 text-[10px]">
                          {passed ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <X className="w-3 h-3 text-white/20" />
                          )}
                          <span className={passed ? 'text-emerald-400' : 'text-white/40'}>{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/20 mt-4"
              disabled={isLoading || (strength.score > 0 && strength.score < 2)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Provisioning Terminal...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/45">
            Already have an active key?{' '}
            <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
