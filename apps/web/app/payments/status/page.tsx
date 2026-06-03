'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Ticket, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentApi } from '@/lib/api';
import toast from 'react-hot-toast';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'retrying'>('loading');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  const verifyPayment = useCallback(async () => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    try {
      const { data } = await paymentApi.verify(orderId);
      if (data.success && data.status === 'SUCCESS') {
        setStatus('success');
        setPaymentInfo(data);
        toast.success('Payment confirmed!');
        setTimeout(() => {
          router.push(`/bookings/${data.bookingId}`);
        }, 2000);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [orderId, router]);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    let cancelled = false;
    let attempt = 0;

    const poll = async () => {
      while (attempt < maxRetries && !cancelled) {
        attempt++;
        setRetryCount(attempt);
        if (attempt > 1) setStatus('retrying');
        const done = await verifyPayment();
        if (done) return;
        if (!cancelled) await new Promise(r => setTimeout(r, 2000));
      }
      if (!cancelled) setStatus('failed');
    };

    poll();

    return () => { cancelled = true; };
  }, [orderId, verifyPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-md mx-auto px-4 text-center"
      >
        {(status === 'loading' || status === 'retrying') && (
          <div className="glass-card p-12 rounded-3xl">
            {status === 'retrying' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <RefreshCw className="w-16 h-16 text-primary mx-auto mb-6" />
              </motion.div>
            ) : (
              <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-primary" />
            )}
            <h1 className="text-2xl font-bold mb-2">
              {status === 'retrying' ? 'Checking Payment Status' : 'Verifying Payment'}
            </h1>
            <p className="text-muted-foreground">
              {status === 'retrying'
                ? `Attempt ${retryCount} of ${maxRetries}...`
                : 'Please wait while we confirm your payment...'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="glass-card p-12 rounded-3xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-4">Your booking has been confirmed.</p>
            <p className="text-xs text-muted-foreground mb-8">Redirecting to your booking...</p>
            {paymentInfo?.bookingId && (
              <Link href={`/bookings/${paymentInfo.bookingId}`}>
                <Button className="rounded-xl h-12 px-8">
                  <Ticket className="w-4 h-4 mr-2" /> View Booking
                </Button>
              </Link>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="glass-card p-12 rounded-3xl">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">Payment Status Unknown</h1>
            <p className="text-muted-foreground mb-8">
              {!orderId
                ? 'No order reference found.'
                : 'Your payment could not be verified immediately. If money was deducted, your booking will be confirmed shortly via the webhook.'}
            </p>
            <div className="flex flex-col gap-3">
              {paymentInfo?.bookingId && (
                <Link href={`/bookings/${paymentInfo.bookingId}`}>
                  <Button className="rounded-xl w-full">
                    <Ticket className="w-4 h-4 mr-2" /> Check Booking Status
                  </Button>
                </Link>
              )}
              <Button onClick={() => { setStatus('loading'); setRetryCount(0); verifyPayment(); }} variant="outline" className="rounded-xl glass-button">
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
              <Link href="/">
                <Button variant="ghost" className="rounded-xl w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentStatusContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
