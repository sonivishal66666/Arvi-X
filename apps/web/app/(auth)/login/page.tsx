'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass, Mail, Lock, Eye, EyeOff, Loader2, Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore, useUiStore } from '@/lib/store';
import { ClientOnly } from '@/components/shared/client-only';
import toast from 'react-hot-toast';

const ease = [0.16, 1, 0.3, 1];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Track input focus states for glowing icons
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await authApi.login({ email, password, rememberMe });
      localStorage.setItem('accessToken', data.accessToken);
      
      const { setAuthTransition } = useUiStore.getState();
      setAuthTransition(true, 'signin');
      setUser(data.user);
      toast.success('Access Authorized. Welcome back.');
      
      setTimeout(() => {
        setAuthTransition(false);
        router.push(data.user.role === 'ADMIN' ? '/admin' : data.user.role === 'VENDOR' ? '/vendor' : '/');
      }, 1200);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Authorization failed. Check credentials.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden pt-24">
      {/* Mesh grid & floating background orbs */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none z-0" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse z-0" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float z-0" />

      {/* Floating particles */}
      <ClientOnly>
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="absolute w-[2px] h-[2px] rounded-full bg-indigo-400/20"
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
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          {/* Scanlines layer */}
          <div className="absolute inset-0 scanlines pointer-events-none opacity-[0.25]" />
          
          <div className="text-center mb-8 relative z-10">
            <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30 border border-indigo-400/20 group hover:scale-105 transition-transform duration-500">
              <Compass className="h-5 w-5 text-white" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome Back
            </h1>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-[0.2em] font-bold">Provide Entry Credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Email Endpoint</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isEmailFocused ? 'text-indigo-400' : 'text-white/25'}`} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="you@domain.com"
                  className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/30 focus:ring-indigo-500/10 focus:bg-white/[0.04] transition-all text-sm w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Terminal Access Key</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors tracking-wide font-medium">
                  Reset key?
                </Link>
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isPasswordFocused ? 'text-indigo-400' : 'text-white/25'}`} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/30 focus:ring-indigo-500/10 focus:bg-white/[0.04] transition-all text-sm w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-white/10 bg-white/5 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-500 transition-colors"
                  />
                  <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">Keep session active on this node</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/20 text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AUTHORIZING TELEMETRY...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 mr-1" />
                  <span>ESTABLISH LINK</span>
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-white/40 relative z-10">
            No registry profile?{' '}
            <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              Request Access
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
