'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser, logout } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await authApi.login({ email, password, rememberMe: true });
      
      const role = data.user?.role;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        logout();
        toast.error('Access Denied: You do not possess administrator rights.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      toast.success('Access Granted. Welcome back, Admin.');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Authentication failed. Please verify credentials.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020208] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs & Mesh */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/10 via-[#020208] to-purple-950/10 pointer-events-none" />
      <div className="orb w-[400px] h-[400px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Arvis Admin Portal
            </h1>
            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-semibold">Secure Credentials Entry</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin"
                  className="pl-10 input-premium border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35 h-11 text-sm rounded-xl w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 input-premium border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35 h-11 text-sm rounded-xl w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authorizing Portal...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
