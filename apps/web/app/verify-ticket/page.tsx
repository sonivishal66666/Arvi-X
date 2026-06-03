'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Scan, Search, Loader2, ArrowLeft, Ticket, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ticketApi } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function VerifyTicketPage() {
  const [qrInput, setQrInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!qrInput.trim()) { toast.error('Enter a ticket code or scan QR'); return; }
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await ticketApi.verify(qrInput.trim());
      if (data.valid) {
        setResult({ status: 'valid', ...data.booking });
        toast.success('Ticket verified successfully');
      } else {
        setResult({ status: data.booking?.status || 'invalid', error: data.error });
        toast.error(data.error || 'Invalid ticket');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Verification failed';
      setError(msg);
      toast.error(msg);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-emerald-500/5 top-0 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-teal-500/5 bottom-0 -right-48" />

      <div className="relative z-10 max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Verify Ticket</h1>
              <p className="text-sm text-muted-foreground">Scan or enter ticket code to verify</p>
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Enter ticket ID, booking ref, or scan QR code..."
                  className="pl-10 h-12"
                />
              </div>
              <Button onClick={handleVerify} disabled={isLoading} className="h-12 px-6 rounded-xl">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Verify
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={`glass-card p-8 rounded-3xl text-center ${result.status === 'valid' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  >
                    {result.status === 'valid' ? (
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-10 h-10 text-rose-500" />
                      </div>
                    )}
                  </motion.div>

                  <h2 className={`text-2xl font-bold mb-2 ${result.status === 'valid' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {result.status === 'valid' ? '✓ Valid Ticket' : '✗ Invalid Ticket'}
                  </h2>
                  {result.error && <p className="text-muted-foreground mb-4">{result.error}</p>}

                  {result.status === 'valid' && (
                    <div className="text-left space-y-4 mt-6">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Ticket className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-semibold">{result.service?.title}</p>
                            <p className="text-xs text-muted-foreground">{result.service?.vendor?.businessName} · {result.service?.category}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{result.user?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(result.createdAt)}</span>
                          </div>
                          {result.schedule && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Dep: {formatTime(result.schedule.departureTime)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Arr: {formatTime(result.schedule.arrivalTime)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {result.passengers?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Passengers</p>
                          <div className="flex flex-wrap gap-2">
                            {result.passengers.map((p: any, i: number) => (
                              <Badge key={i} variant="secondary" className="px-3 py-1">
                                {p.name}{p.age ? ` (${p.age})` : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ref:</span>
                          <span className="font-mono text-xs">{result.bookingRef || result.id}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="success">Confirmed</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Ready to Verify</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Enter a ticket ID, booking reference, or QR code to verify its authenticity.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
