'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore, useUiStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState('');

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

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!isOtpMode) {
        await authApi.loginOtp({ email });
        setIsOtpMode(true);
        toast.success('Holographic code dispatched to email.');
      } else {
        const { data } = await authApi.verifyLoginOtp({ email, otp });
        localStorage.setItem('accessToken', data.accessToken);
        
        const { setAuthTransition } = useUiStore.getState();
        setAuthTransition(true, 'signin');
        setUser(data.user);
        toast.success('Access Authorized.');
        
        setTimeout(() => {
          setAuthTransition(false);
          router.push('/');
        }, 1200);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Verification mismatch.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020208] text-white flex items-center justify-center p-4 relative overflow-hidden pt-24">
      {/* Mesh grid & floating orbs */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card-dark p-8 border border-white/[0.08] backdrop-blur-3xl shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back
            </h1>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Provide Entry Credentials</p>
          </div>

          <form onSubmit={isOtpMode ? handleOtpLogin : handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="pl-10 input-premium border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35 h-11 text-sm rounded-xl w-full"
                  required
                  disabled={isOtpMode}
                />
              </div>
            </div>

            {!isOtpMode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Access Key</label>
                  <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Reset key?
                  </Link>
                </div>
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
                
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0 cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs text-white/50 hover:text-white/70 transition-colors">Remember terminal for 30 days</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-float">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">Holographic OTP Code</label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  className="input-premium border-white/10 bg-white/5 text-center text-lg tracking-[0.4em] font-semibold text-white h-12 rounded-xl w-full"
                  required
                />
                <p className="text-[10px] text-white/40 text-center mt-1">
                  Secure code dispatched to {email}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                isOtpMode ? 'Confirm Access Code' : 'Verify Credentials'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-[#020208] px-3 text-white/35">Alternative Gate</span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => { setIsOtpMode(false); setOtp(''); }}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              {isOtpMode ? 'Back to password mode' : 'Login using dynamic OTP token'}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-white/45">
            No terminal access?{' '}
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Create Registry
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
