'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Clock,
  CreditCard, Loader2, Sparkles, PlusCircle, AlertCircle, CheckCircle2
} from 'lucide-react';
import { walletApi } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceId: string | null;
  status: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [topUpMode, setTopUpMode] = useState<'dev' | 'cashfree'>('dev');

  const fetchWalletData = useCallback(async () => {
    try {
      const { data } = await walletApi.get();
      setBalance(data.wallet?.balance || 0);
      setTransactions(data.transactions || []);
    } catch {
      toast.error('Failed to compile wallet variables.');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWalletData();
  }, [isAuthenticated, isAuthLoading, router, fetchWalletData]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid credit amount.');
      return;
    }
    if (amount > 100000) {
      toast.error('Maximum payload transaction limit exceeded.');
      return;
    }

    setIsProcessing(true);

    try {
      if (topUpMode === 'dev') {
        const { data } = await walletApi.topupDev(amount);
        if (data.success) {
          toast.success(`Simulated credit of ${formatCurrency(amount)} provisioned!`);
          setTopUpAmount('');
          fetchWalletData();
        }
      } else {
        const { data } = await walletApi.add(amount);
        if (data.success && data.data?.paymentSessionId) {
          toast.loading('Initializing payment session...');
          const loadCashfree = () => {
            const checkoutOptions = {
              paymentSessionId: data.data.paymentSessionId,
              returnUrl: `${window.location.origin}/wallet`,
            };
            const cashfree = new (window as any).Cashfree(checkoutOptions);
            cashfree.redirect();
          };
          loadCashfree();
        } else {
          throw new Error('Invalid signature response');
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to initialize checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#020208]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-[#020208] text-white relative overflow-hidden pb-16">
      {/* Background orbs and grid */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-500/5 -top-20 -left-10 pointer-events-none animate-orb-pulse" />
      <div className="orb w-[450px] h-[450px] bg-purple-500/5 -bottom-20 -right-10 pointer-events-none animate-float" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
        {/* Title */}
        <div className="mb-8">
          <Badge className="mb-3 px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Financial Core
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Wallet className="w-8 h-8 text-indigo-400" />
            Quantum Wallet
          </h1>
          <p className="text-xs text-white/40 mt-1 font-light">Manage assets, execute mock top-ups, and review ledgers.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Card & Deposit */}
          <div className="lg:col-span-5 space-y-6">
            {/* Premium Credit Card Mockup */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#070712] via-[#121226] to-[#04040a] border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.4)] p-6 h-[220px] flex flex-col justify-between group cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl" />
              
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] tracking-widest text-indigo-300 uppercase font-semibold">Arvis Platinum Ledger</p>
                  <h4 className="text-xs text-white/60 mt-1 font-light">{user?.name || 'Authorized Account'}</h4>
                </div>
                <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse-glow" />
              </div>

              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium">Synced Balance</p>
                <h2 className="text-3xl font-bold text-white tracking-tight mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {formatCurrency(balance)}
                </h2>
              </div>

              <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/5 pt-3">
                <span className="font-mono text-[10px] tracking-wider">TERMINAL ID: {user?.id?.slice(-8).toUpperCase() || '2026'}</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full">ACTIVE</Badge>
              </div>
            </motion.div>

            {/* Top-up card */}
            <Card className="glass border-white/[0.08] bg-black/40 rounded-3xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <PlusCircle className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  Asset Provisioning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTopUp} className="space-y-4">
                  <div>
                    <label className="text-[9px] text-white/40 font-semibold uppercase tracking-wider block mb-2">Input Credits (INR)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-xs font-semibold">₹</span>
                      <Input
                        type="number"
                        min={10}
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        placeholder="0.00"
                        className="input-premium pl-8 border-white/10 w-full h-11 text-sm text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTopUpMode('dev')}
                      className={cn(
                        'h-10 rounded-xl text-[10px] font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all duration-300',
                        topUpMode === 'dev'
                          ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30 shadow-inner'
                          : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:text-white/70'
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      Mock Topup
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopUpMode('cashfree')}
                      className={cn(
                        'h-10 rounded-xl text-[10px] font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all duration-300',
                        topUpMode === 'cashfree'
                          ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30 shadow-inner'
                          : 'bg-white/[0.03] text-white/30 border-white/[0.06] hover:text-white/70'
                      )}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                      Cashfree Pay
                    </button>
                  </div>

                  {topUpMode === 'dev' && (
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-indigo-300/60 leading-relaxed font-light">
                        Simulated Environment Mode: Transaction bypasses cash gateways and immediately provisions assets.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isProcessing || !topUpAmount}
                    className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/10 mt-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Compiling transaction...
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        Commit Top-Up
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Log */}
          <div className="lg:col-span-7">
            <Card className="glass border-white/[0.08] bg-black/40 rounded-3xl shadow-xl overflow-hidden h-[510px] flex flex-col relative">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <CardHeader className="border-b border-white/[0.06] py-4 shrink-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <Clock className="w-4.5 h-4.5 text-indigo-400" />
                  Transactions Ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                {transactions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center text-white/20 select-none">
                    <CreditCard className="w-12 h-12 mb-3 text-white/5 animate-float" />
                    <p className="text-xs font-semibold">Ledger Empty</p>
                    <p className="text-[10px] text-white/30 max-w-xs mt-1 font-light">Provision accounts or book transit services to generate logs.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.05]">
                    {transactions.map((tx) => {
                      const isCredit = tx.type === 'CREDIT';
                      return (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors duration-300">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={cn(
                              'w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300',
                              isCredit 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-inner' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-inner'
                            )}>
                              {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white/95 truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tx.description}</p>
                              <p className="text-[9px] text-white/30 mt-0.5 font-light">{formatDate(tx.createdAt, 'short')}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={cn('text-xs md:text-sm font-bold tracking-tight', isCredit ? 'text-emerald-400' : 'text-white/90')}>
                              {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                            {tx.referenceId && (
                              <p className="text-[8px] text-white/20 font-mono mt-0.5 truncate max-w-[100px]">ID: {tx.referenceId.slice(-10)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
