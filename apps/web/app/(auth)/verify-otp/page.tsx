'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return;

    setIsLoading(true);
    try {
      const { data } = await authApi.verifyOtp({ email, otp: code });
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      toast.success('Email verified successfully!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Invalid OTP code.');
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.loginOtp({ email });
      setCountdown(60);
      toast.success('Holographic code resent.');
    } catch {
      toast.error('Failed to resend. Check connection.');
    }
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-[#020208] text-white flex items-center justify-center p-4 relative overflow-hidden pt-24">
      {/* Mesh grid & floating orbs */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card-dark p-8 border border-white/[0.08] backdrop-blur-3xl shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </Link>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Verify your email
            </h1>
            <p className="text-xs text-white/45 mt-1">
              Enter the verification code sent to <br />
              <span className="text-indigo-300 font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2.5 mb-2">
              {otp.map((digit, i) => (
                <Input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl border-white/10 bg-white/5 text-white focus-visible:ring-indigo-500/35"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/20"
              disabled={otp.join('').length !== 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Submit Code'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className="text-xs text-white/45 hover:text-white disabled:opacity-50 transition-colors"
            >
              {isResending ? 'Resending Code...' : countdown > 0 ? `Resend key in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020208] flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
