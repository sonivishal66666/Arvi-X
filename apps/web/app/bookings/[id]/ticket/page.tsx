'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, Printer, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bookingApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

declare global {
  interface Window {
    Cashfree: any;
  }
}

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    if (params.id) {
      bookingApi.getById(params.id as string)
        .then(({ data }) => {
          setBooking(data.booking);
          return data.booking;
        })
        .then((booking) => {
          if (booking?.qrCode || booking?.id) {
            const qrPayload = booking.qrCode || booking.bookingRef || booking.id;
            QRCode.toDataURL(qrPayload, {
              width: 160,
              margin: 2,
              color: { dark: '#1a1a2e', light: '#ffffff' },
            }).then(setQrDataUrl).catch(() => {
              // Fallback: generate a simple QR with just the booking ref
              QRCode.toDataURL(booking.bookingRef || booking.id, { width: 160, margin: 2 }).then(setQrDataUrl).catch(() => {});
            });
          }
        })
        .catch(() => router.push('/user/bookings'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a1a',
        logging: false,
      } as any);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`ticket-${booking?.bookingRef || booking?.id || 'download'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
    setIsDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!booking) return null;

  const svc = booking.service || {};
  const schedule = booking.schedule || {};

  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#0a0a1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-3">
            <Button onClick={handlePrint} variant="outline" className="rounded-xl glass-button gap-2">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isDownloading} className="rounded-xl gap-2">
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          ref={ticketRef}
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#070714] via-[#0d0d26] to-[#070714] border border-white/10 shadow-2xl"
          style={{ fontFamily: "'Space Grotesk', 'Inter', -apple-system, sans-serif" }}
        >
          {/* Subtle light guides */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* MAIN BOARDING PASS BODY */}
            <div className="lg:col-span-3 p-8 border-b lg:border-b-0 lg:border-r border-dashed border-white/10 relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/10">
                    <img src="/logo.png" alt="Arvis Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                      ARVIS <span className="text-white/60">X</span>
                    </h1>
                    <p className="text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">Premium Boarding Pass</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Booking Reference</p>
                  <p className="text-base font-mono font-bold text-white">{booking.bookingRef}</p>
                </div>
              </div>

              {/* Service Info Header */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
                <span className="text-4xl">
                  {svc.category === 'BUS' ? '🚌' : svc.category === 'TRAIN' ? '🚄' : svc.category === 'FLIGHT' ? '✈️' : svc.category === 'HOTEL' ? '🏨' : '🎫'}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{svc.title}</h2>
                  <p className="text-xs text-white/40 mt-0.5 font-light">{svc.category} &middot; {svc.vendor?.businessName || 'Arvis X Partner'}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                  booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  booking.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* Primary Journey Metrics */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
                <div className="text-center md:text-left shrink-0">
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {schedule.departureTime ? formatTime(schedule.departureTime) : '--:--'}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase mt-1 tracking-widest">DEPARTURE</p>
                </div>
                
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-0.5 rounded-full bg-[#0d0d26] border border-white/5 text-[9px] text-indigo-400 tracking-wider">
                      {schedule.duration ? `${Math.floor(schedule.duration / 60)}h ${schedule.duration % 60}m` : 'DIRECT'}
                    </div>
                  </div>
                </div>

                <div className="text-center md:text-right shrink-0">
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {schedule.arrivalTime ? formatTime(schedule.arrivalTime) : '--:--'}
                  </p>
                  <p className="text-[10px] text-white/40 uppercase mt-1 tracking-widest">ARRIVAL</p>
                </div>
              </div>

              {/* Travel Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Boarding Date</p>
                  <p className="text-sm font-medium text-white">
                    {schedule.departureTime ? formatDate(schedule.departureTime) : formatDate(booking.createdAt)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Class Type</p>
                  <p className="text-sm font-medium text-indigo-300">
                    {booking.passengers?.[0]?.seatNumber ? 'Assigned Seat' : 'General Reservation'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Passenger Code</p>
                  <p className="text-sm font-medium text-white truncate">
                    {booking.passengers?.[0]?.name || 'Transit Guest'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Fare Price</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(booking.finalAmount)}</p>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-white/30">
                <div>
                  <p className="font-semibold text-white/50 mb-0.5">TERMS & CONDITIONS</p>
                  <p className="font-light">Must match legal identity documents at boarding gates. Non-transferable.</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white/50 mb-0.5">TRANSIT PORT CONCIERGE</p>
                  <p className="font-light">support@arvisx.com | +1 (555) 000-0000</p>
                </div>
              </div>
            </div>

            {/* PASSENGER BOARDING STUB */}
            <div className="lg:col-span-1 p-8 bg-white/[0.02] flex flex-col justify-between items-center text-center relative overflow-hidden">
              {/* Vertical tear notch simulation */}
              <div className="absolute top-0 bottom-0 left-0 w-px border-l border-dashed border-white/15 hidden lg:block" />

              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Boarding Pass Stub</p>
                <h3 className="text-sm font-bold text-white truncate max-w-[150px] mx-auto">
                  {booking.passengers?.[0]?.name || 'Guest Passenger'}
                </h3>
                <p className="text-[10px] text-indigo-400 mt-0.5">
                  {svc.category} &middot; {booking.bookingRef}
                </p>
              </div>

              {/* Centered Large QR Code */}
              <div className="my-6">
                {qrDataUrl ? (
                  <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg shadow-black/40">
                    <Image src={qrDataUrl} alt="QR Link" width={110} height={110} className="rounded-lg" />
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                    <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                  </div>
                )}
                <p className="text-[9px] text-white/30 mt-2 font-mono uppercase tracking-wide">Scan at gate</p>
              </div>

              {/* Barcode scanner */}
              {qrDataUrl && (
                <div className="bg-white/95 p-1.5 rounded-lg w-full max-w-[160px] shadow-md border border-white/10 opacity-80 hover:opacity-100 transition-opacity">
                  <Image src={qrDataUrl} alt="Barcode" width={160} height={36} className="rounded object-cover" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @media print {
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            height: 100vh !important;
            overflow: hidden !important;
            background: #0a0a1a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          div.min-h-screen {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            min-height: unset !important;
            height: 100vh !important;
          }
          div.max-w-4xl {
            max-width: 100% !important;
            width: 100vw !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          div.relative.overflow-hidden.rounded-\[32px\] {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            height: 100vh !important;
            width: 100vw !important;
          }
          .print\\:hidden { display: none !important; }
          @page {
            size: landscape;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
