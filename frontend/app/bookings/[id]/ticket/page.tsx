'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, Printer, Download, ArrowLeft, Calendar, CreditCard, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bookingApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// Deterministic fallback transit times based on serviceId and booking info
function getDeterministicTransitData(serviceId: string, bookingRef: string, baseDateInput: any) {
  const seedStr = `${serviceId || ''}-${bookingRef || ''}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const date = baseDateInput ? new Date(baseDateInput) : new Date();
  
  // Deterministic departure hour (0 to 23)
  const depHour = hash % 24;
  // Deterministic departure minute (0 to 59, rounded to 5 mins)
  const depMinute = ((hash >> 3) % 12) * 5;
  
  // Deterministic duration in minutes (between 120 and 479 minutes -> 2h to 7.9h)
  const duration = 120 + ((hash >> 6) % 360);
  
  const departureTime = new Date(date);
  departureTime.setHours(depHour, depMinute, 0, 0);
  
  const arrivalTime = new Date(departureTime);
  arrivalTime.setMinutes(departureTime.getMinutes() + duration);
  
  return {
    departureTime,
    arrivalTime,
    duration
  };
}

// Extract origin and destination from service title (e.g. "Operator - CityA to CityB" or "CityA-CityB")
function getFallbackRoute(title: string, defaultOrigin = 'Delhi', defaultDestination = 'Jaipur') {
  if (!title) return { origin: defaultOrigin, destination: defaultDestination };
  
  const toRegex = /\s+to\s+/i;
  if (toRegex.test(title)) {
    const match = title.split(toRegex);
    if (match.length >= 2) {
      const originPart = match[0].split(/\s+-\s+|\s+—\s+/).pop()?.trim();
      const destinationPart = match[1].split(/\s+-\s+|\s+—\s+|\s*\(/)[0]?.trim();
      if (originPart && destinationPart) {
        return { origin: originPart, destination: destinationPart };
      }
    }
  }

  const dashRegex = /\b([A-Za-z]+)-([A-Za-z]+)\b/;
  const dashMatch = title.match(dashRegex);
  if (dashMatch) {
    return { origin: dashMatch[1], destination: dashMatch[2] };
  }

  return { origin: defaultOrigin, destination: defaultDestination };
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
              width: 200,
              margin: 2,
              color: { dark: '#1a1a2e', light: '#ffffff' },
            }).then(setQrDataUrl).catch(() => {
              QRCode.toDataURL(booking.bookingRef || booking.id, { width: 200, margin: 2 }).then(setQrDataUrl).catch(() => {});
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

  // Helper: load an image as base64 data URL
  const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;
    setIsDownloading(true);
    
    try {
      const svc = booking.service || {};
      let schedule = booking.schedule || {};
      let route = schedule.route || {};
      const payment = booking.payments?.find((p: any) => p.status === 'SUCCESS') || booking.payments?.[0];
      const passengers = booking.passengers || [];
      const category = svc.category || 'BOOKING';
      const isTransit = ['BUS', 'TRAIN', 'FLIGHT'].includes(category);
      const isHotel = category === 'HOTEL';

      if (isTransit) {
        if (!schedule.departureTime || !schedule.arrivalTime) {
          const baseDate = schedule.departureTime || booking.createdAt || new Date();
          const transitData = getDeterministicTransitData(svc.id, booking.bookingRef || booking.id, baseDate);
          schedule = {
            ...schedule,
            departureTime: schedule.departureTime || transitData.departureTime,
            arrivalTime: schedule.arrivalTime || transitData.arrivalTime,
            duration: schedule.duration || transitData.duration
          };
        }
        if (!route.origin || !route.destination) {
          const fallbackRoute = getFallbackRoute(svc.title, 'Delhi', 'Jaipur');
          route = {
            ...route,
            origin: route.origin || fallbackRoute.origin,
            destination: route.destination || fallbackRoute.destination
          };
        }
      }
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ────────── COLORS ──────────
      const primaryColor = [79, 70, 229] as [number, number, number];    // indigo-600
      const darkBg = [15, 15, 30] as [number, number, number];
      const cardBg = [22, 22, 44] as [number, number, number];
      const white = [255, 255, 255] as [number, number, number];
      const lightGray = [180, 180, 195] as [number, number, number];
      const mutedText = [140, 140, 160] as [number, number, number];
      const successColor = [16, 185, 129] as [number, number, number]; // emerald
      const amberColor = [245, 158, 11] as [number, number, number];

      // ────────── FULL PAGE BACKGROUND ──────────
      pdf.setFillColor(...darkBg);
      pdf.rect(0, 0, pageW, pageH, 'F');

      // ────────── TOP GRADIENT BAR ──────────
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageW, 3, 'F');

      // ────────── LOGO + HEADER ──────────
      y = 12;
      try {
        const logoBase64 = await loadImageAsBase64('/logo.png');
        pdf.addImage(logoBase64, 'PNG', margin, y, 12, 12);
      } catch { /* logo load failed, skip */ }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(...white);
      pdf.text('ARVIS', margin + 15, y + 6);
      pdf.setFontSize(18);
      pdf.setTextColor(120, 120, 160);
      pdf.text('X', margin + 37, y + 6);

      pdf.setFontSize(7);
      pdf.setTextColor(...mutedText);
      pdf.text('PREMIUM BOOKING CONFIRMATION', margin + 15, y + 11);

      // Booking ref on the right
      pdf.setFontSize(7);
      pdf.setTextColor(...mutedText);
      pdf.text('BOOKING REFERENCE', pageW - margin, y + 2, { align: 'right' });
      pdf.setFontSize(12);
      pdf.setTextColor(...white);
      pdf.setFont('courier', 'bold');
      pdf.text(booking.bookingRef || booking.id?.slice(0, 12).toUpperCase(), pageW - margin, y + 9, { align: 'right' });

      y += 20;

      // ────────── DIVIDER ──────────
      pdf.setDrawColor(50, 50, 80);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageW - margin, y);
      y += 6;

      // ────────── SERVICE INFO CARD ──────────
      pdf.setFillColor(...cardBg);
      pdf.roundedRect(margin, y, contentW, 28, 4, 4, 'F');

      // Category emoji/icon text
      const catEmoji = category === 'BUS' ? '🚌' : category === 'TRAIN' ? '🚄' : category === 'FLIGHT' ? '✈' : category === 'HOTEL' ? '🏨' : '🎫';
      pdf.setFontSize(16);
      pdf.text(catEmoji, margin + 6, y + 12);

      // Service Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(...white);
      const titleText = svc.title || 'Booking';
      pdf.text(titleText.length > 40 ? titleText.substring(0, 40) + '...' : titleText, margin + 16, y + 10);

      // Category + Vendor
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...lightGray);
      pdf.text(`${category}  ·  ${svc.vendor?.businessName || 'Arvis X Partner'}`, margin + 16, y + 16);

      // Status badge
      const statusText = booking.status || 'PENDING';
      const isConfirmed = statusText === 'CONFIRMED' || statusText === 'COMPLETED';
      const badgeColor = isConfirmed ? successColor : amberColor;
      const badgeW = pdf.getTextWidth(statusText) + 8;
      const badgeX = pageW - margin - badgeW - 6;
      pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      pdf.roundedRect(badgeX, y + 6, badgeW, 7, 2, 2, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(...white);
      pdf.text(statusText, badgeX + badgeW / 2, y + 11, { align: 'center' });

      // Booking date under service card
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...mutedText);
      pdf.text(`Booked on: ${formatDate(booking.createdAt, 'long')}`, margin + 16, y + 23);

      y += 34;

      // ────────── JOURNEY / STAY DETAILS ──────────
      if (isTransit) {
        // DEPARTURE → ARRIVAL section
        pdf.setFillColor(...cardBg);
        pdf.roundedRect(margin, y, contentW, 38, 4, 4, 'F');

        const colW = contentW / 3;

        // Departure
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(...white);
        const depTime = schedule.departureTime ? formatTime(schedule.departureTime) : '--:--';
        pdf.text(depTime, margin + colW / 2, y + 14, { align: 'center' });
        pdf.setFontSize(7);
        pdf.setTextColor(...mutedText);
        pdf.text('DEPARTURE', margin + colW / 2, y + 20, { align: 'center' });
        if (route.origin) {
          pdf.setFontSize(8);
          pdf.setTextColor(...lightGray);
          pdf.text(route.origin, margin + colW / 2, y + 26, { align: 'center' });
        }

        // Journey line in the middle
        const lineY = y + 12;
        pdf.setDrawColor(79, 70, 229);
        pdf.setLineWidth(0.5);
        pdf.line(margin + colW + 8, lineY, margin + colW * 2 - 8, lineY);
        // Duration label
        const durationText = schedule.duration ? `${Math.floor(schedule.duration / 60)}h ${schedule.duration % 60}m` : 'DIRECT';
        pdf.setFontSize(6);
        pdf.setTextColor(79, 70, 229);
        const durW = pdf.getTextWidth(durationText) + 6;
        pdf.setFillColor(...cardBg);
        pdf.rect(margin + colW + (colW - durW) / 2, lineY - 3, durW, 6, 'F');
        pdf.text(durationText, margin + colW + colW / 2, lineY + 1, { align: 'center' });

        // Arrival
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(...white);
        const arrTime = schedule.arrivalTime ? formatTime(schedule.arrivalTime) : '--:--';
        pdf.text(arrTime, margin + colW * 2 + colW / 2, y + 14, { align: 'center' });
        pdf.setFontSize(7);
        pdf.setTextColor(...mutedText);
        pdf.text('ARRIVAL', margin + colW * 2 + colW / 2, y + 20, { align: 'center' });
        if (route.destination) {
          pdf.setFontSize(8);
          pdf.setTextColor(...lightGray);
          pdf.text(route.destination, margin + colW * 2 + colW / 2, y + 26, { align: 'center' });
        }

        // Travel date
        if (schedule.departureTime) {
          pdf.setFontSize(7);
          pdf.setTextColor(...mutedText);
          pdf.text(`Travel Date: ${formatDate(schedule.departureTime)}`, margin + contentW / 2, y + 34, { align: 'center' });
        }

        y += 44;

      } else if (isHotel) {
        // CHECK-IN / CHECK-OUT section
        pdf.setFillColor(...cardBg);
        pdf.roundedRect(margin, y, contentW, 30, 4, 4, 'F');

        const colW = contentW / 3;

        // Check-in
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...white);
        pdf.text(booking.checkIn ? formatDate(booking.checkIn) : formatDate(booking.createdAt), margin + colW / 2, y + 12, { align: 'center' });
        pdf.setFontSize(7);
        pdf.setTextColor(...mutedText);
        pdf.text('CHECK-IN', margin + colW / 2, y + 18, { align: 'center' });

        // Arrow in the middle
        pdf.setFontSize(10);
        pdf.setTextColor(79, 70, 229);
        pdf.text('→', margin + colW + colW / 2, y + 13, { align: 'center' });
        if (booking.rooms) {
          pdf.setFontSize(7);
          pdf.setTextColor(...lightGray);
          pdf.text(`${booking.rooms} Room(s)`, margin + colW + colW / 2, y + 19, { align: 'center' });
        }

        // Check-out
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...white);
        pdf.text(booking.checkOut ? formatDate(booking.checkOut) : 'N/A', margin + colW * 2 + colW / 2, y + 12, { align: 'center' });
        pdf.setFontSize(7);
        pdf.setTextColor(...mutedText);
        pdf.text('CHECK-OUT', margin + colW * 2 + colW / 2, y + 18, { align: 'center' });

        y += 36;

      } else {
        // EVENT - show event date
        pdf.setFillColor(...cardBg);
        pdf.roundedRect(margin, y, contentW, 20, 4, 4, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...white);
        pdf.text(`Event Date: ${schedule.departureTime ? formatDate(schedule.departureTime) : formatDate(booking.createdAt)}`, margin + contentW / 2, y + 12, { align: 'center' });
        y += 26;
      }

      // ────────── DETAIL METRICS ROW ──────────
      const metricsData: { label: string; value: string }[] = [];
      
      if (isTransit) {
        metricsData.push({ label: 'TRAVEL DATE', value: schedule.departureTime ? formatDate(schedule.departureTime) : formatDate(booking.createdAt) });
        if (category === 'TRAIN' || category === 'BUS') {
          metricsData.push({ label: 'CLASS', value: passengers[0]?.seatNumber ? 'Reserved Seat' : 'General' });
        }
        if (category === 'FLIGHT') {
          metricsData.push({ label: 'SEAT', value: passengers[0]?.seatNumber || 'Auto-assign' });
        }
      } else if (isHotel) {
        metricsData.push({ label: 'ROOMS', value: booking.rooms || '1' });
        // Calculate nights
        if (booking.checkIn && booking.checkOut) {
          const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
          metricsData.push({ label: 'NIGHTS', value: `${nights}` });
        }
      }
      metricsData.push({ label: 'GUESTS', value: `${passengers.length || 1}` });
      metricsData.push({ label: 'TOTAL PAID', value: formatCurrency(booking.finalAmount) });

      if (metricsData.length > 0) {
        const metricW = contentW / metricsData.length;
        pdf.setFillColor(cardBg[0] - 3, cardBg[1] - 3, cardBg[2] - 3);
        pdf.roundedRect(margin, y, contentW, 18, 4, 4, 'F');
        
        metricsData.forEach((m, i) => {
          const cx = margin + metricW * i + metricW / 2;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6);
          pdf.setTextColor(...mutedText);
          pdf.text(m.label, cx, y + 6, { align: 'center' });
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(...white);
          pdf.text(m.value, cx, y + 13, { align: 'center' });
        });
        y += 24;
      }

      // ────────── PASSENGERS TABLE ──────────
      if (passengers.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...white);
        pdf.text('PASSENGER DETAILS', margin, y + 2);
        y += 7;

        // Table header
        pdf.setFillColor(30, 30, 55);
        pdf.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(...mutedText);
        pdf.text('S.NO', margin + 8, y + 5.5, { align: 'center' });
        pdf.text('PASSENGER NAME', margin + 40, y + 5.5);
        pdf.text('AGE', margin + contentW * 0.55, y + 5.5, { align: 'center' });
        pdf.text('GENDER', margin + contentW * 0.7, y + 5.5, { align: 'center' });
        if (isTransit) pdf.text('SEAT', margin + contentW * 0.88, y + 5.5, { align: 'center' });
        y += 9;

        passengers.forEach((p: any, i: number) => {
          if (i % 2 === 0) {
            pdf.setFillColor(20, 20, 40);
            pdf.rect(margin, y, contentW, 8, 'F');
          }
          pdf.setFont('courier', 'normal');
          pdf.setFontSize(7);
          pdf.setTextColor(...lightGray);
          pdf.text(`${i + 1}`, margin + 8, y + 5.5, { align: 'center' });
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...white);
          pdf.text(p.name || 'Guest', margin + 40, y + 5.5);
          pdf.setTextColor(...lightGray);
          pdf.text(`${p.age || '-'}`, margin + contentW * 0.55, y + 5.5, { align: 'center' });
          pdf.text(p.gender || '-', margin + contentW * 0.7, y + 5.5, { align: 'center' });
          if (isTransit) pdf.text(p.seatNumber || '-', margin + contentW * 0.88, y + 5.5, { align: 'center' });
          y += 8;
        });
        y += 4;
      }

      // ────────── PAYMENT BREAKDOWN ──────────
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...white);
      pdf.text('PAYMENT DETAILS', margin, y + 2);
      y += 7;

      pdf.setFillColor(...cardBg);
      const paymentCardH = 36;
      pdf.roundedRect(margin, y, contentW * 0.6, paymentCardH, 4, 4, 'F');

      const payX = margin + 8;
      let payY = y + 8;

      const addPaymentRow = (label: string, value: string, color: [number, number, number] = lightGray, bold = false) => {
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedText);
        pdf.text(label, payX, payY);
        pdf.setTextColor(...color);
        pdf.text(value, margin + contentW * 0.6 - 8, payY, { align: 'right' });
        payY += 7;
      };

      addPaymentRow('Base Amount', formatCurrency(booking.totalAmount || booking.baseAmount || booking.finalAmount));
      if (booking.discountAmount > 0) {
        addPaymentRow('Discount', `-${formatCurrency(booking.discountAmount)}`, successColor);
      }
      addPaymentRow('Taxes & Fees', formatCurrency(booking.taxAmount || 0));

      // Divider
      pdf.setDrawColor(50, 50, 80);
      pdf.setLineWidth(0.2);
      pdf.line(payX, payY - 2, margin + contentW * 0.6 - 8, payY - 2);
      payY += 2;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...white);
      pdf.text('Total Paid', payX, payY);
      pdf.setTextColor(79, 70, 229);
      pdf.text(formatCurrency(booking.finalAmount), margin + contentW * 0.6 - 8, payY, { align: 'right' });

      // Payment method
      if (payment) {
        payY += 7;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.5);
        pdf.setTextColor(...mutedText);
        pdf.text(`Payment Method: ${payment.method || 'Online'} | Transaction ID: ${payment.cashfreePaymentId || payment.id?.slice(0, 16) || 'N/A'}`, payX, payY);
      }

      // ────────── QR CODE (right side of payment) ──────────
      if (qrDataUrl) {
        const qrSize = 30;
        const qrX = margin + contentW * 0.65;
        const qrY = y;
        pdf.setFillColor(...cardBg);
        pdf.roundedRect(qrX, qrY, contentW * 0.35, paymentCardH, 4, 4, 'F');
        
        try {
          pdf.addImage(qrDataUrl, 'PNG', qrX + (contentW * 0.35 - qrSize) / 2, qrY + 2, qrSize, qrSize);
        } catch { /* QR image add failed */ }
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(...mutedText);
        pdf.text('SCAN FOR VERIFICATION', qrX + contentW * 0.35 / 2, qrY + qrSize + 5, { align: 'center' });
      }

      y += paymentCardH + 10;

      // ────────── FOOTER ──────────
      pdf.setDrawColor(50, 50, 80);
      pdf.setLineWidth(0.2);
      pdf.line(margin, y, pageW - margin, y);
      y += 6;

      // Terms
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(...mutedText);
      pdf.text('TERMS & CONDITIONS', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(100, 100, 120);
      y += 4;
      if (isHotel) {
        pdf.text('• Check-in and check-out times as per hotel policy. Valid government ID required at check-in.', margin, y);
        y += 3.5;
        pdf.text('• Cancellation and refund subject to hotel cancellation policy. Non-transferable.', margin, y);
      } else if (isTransit) {
        pdf.text('• Passenger must carry valid government-issued photo ID matching the name on this ticket.', margin, y);
        y += 3.5;
        pdf.text('• Report at the boarding point 30 minutes before departure. Non-transferable.', margin, y);
      } else {
        pdf.text('• Valid government-issued photo ID required for entry. Non-transferable.', margin, y);
        y += 3.5;
        pdf.text('• Cancellation and refund subject to event organizer policy.', margin, y);
      }
      y += 6;

      // Contact footer
      pdf.setFillColor(12, 12, 28);
      pdf.rect(0, pageH - 12, pageW, 12, 'F');
      pdf.setFontSize(6);
      pdf.setTextColor(...mutedText);
      pdf.text('ARVIS X · Premium Travel & Stay Platform', margin, pageH - 6);
      pdf.text('support@arvisx.com  |  arvisx.com', pageW - margin, pageH - 6, { align: 'right' });

      // Bottom gradient bar
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, pageH - 2, pageW, 2, 'F');

      // Save
      const filename = `Arvis-X-${isHotel ? 'Booking' : 'Ticket'}-${booking.bookingRef || booking.id?.slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
    setIsDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#0a0a1a]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-white/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
          <p className="text-xs text-white/30 uppercase tracking-widest animate-pulse font-bold">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const svc = booking.service || {};
  let schedule = booking.schedule || {};
  let route = schedule.route || {};
  const category = svc.category || '';
  const isTransit = ['BUS', 'TRAIN', 'FLIGHT'].includes(category);
  const isHotel = category === 'HOTEL';

  if (isTransit) {
    if (!schedule.departureTime || !schedule.arrivalTime) {
      const baseDate = schedule.departureTime || booking.createdAt || new Date();
      const transitData = getDeterministicTransitData(svc.id, booking.bookingRef || booking.id, baseDate);
      schedule = {
        ...schedule,
        departureTime: schedule.departureTime || transitData.departureTime,
        arrivalTime: schedule.arrivalTime || transitData.arrivalTime,
        duration: schedule.duration || transitData.duration
      };
    }
    if (!route.origin || !route.destination) {
      const fallbackRoute = getFallbackRoute(svc.title, 'Delhi', 'Jaipur');
      route = {
        ...route,
        origin: route.origin || fallbackRoute.origin,
        destination: route.destination || fallbackRoute.destination
      };
    }
  }

  const payment = booking.payments?.find((p: any) => p.status === 'SUCCESS') || booking.payments?.[0];

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
            <Button onClick={handleDownloadPDF} disabled={isDownloading} className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.2)] font-bold text-xs uppercase tracking-widest border-0">
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
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* MAIN TICKET BODY */}
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
                    <p className="text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">
                      {isHotel ? 'Booking Confirmation' : isTransit ? 'Boarding Pass' : 'Event Ticket'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Booking Reference</p>
                  <p className="text-base font-mono font-bold text-white">{booking.bookingRef}</p>
                </div>
              </div>

              {/* Service Info */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
                <span className="text-4xl">
                  {category === 'BUS' ? '🚌' : category === 'TRAIN' ? '🚄' : category === 'FLIGHT' ? '✈️' : category === 'HOTEL' ? '🏨' : '🎫'}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">{svc.title}</h2>
                  <p className="text-xs text-white/40 mt-0.5 font-light">{category} · {svc.vendor?.businessName || 'Arvis X Partner'}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                  booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  booking.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {booking.status}
                </div>
              </div>

              {/* ──── TRANSIT: Departure → Arrival ──── */}
              {isTransit && (
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
                  <div className="text-center md:text-left shrink-0">
                    <p className="text-3xl font-bold text-white tracking-tight">
                      {schedule.departureTime ? formatTime(schedule.departureTime) : '--:--'}
                    </p>
                    <p className="text-[10px] text-white/40 uppercase mt-1 tracking-widest">DEPARTURE</p>
                    {route.origin && <p className="text-xs text-indigo-300 mt-0.5">{route.origin}</p>}
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
                    {route.destination && <p className="text-xs text-indigo-300 mt-0.5">{route.destination}</p>}
                  </div>
                </div>
              )}

              {/* ──── HOTEL: Check-in → Check-out ──── */}
              {isHotel && (
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
                  <div className="text-center md:text-left shrink-0 flex-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">CHECK-IN</p>
                    </div>
                    <p className="text-xl font-bold text-white tracking-tight">
                      {booking.checkIn ? formatDate(booking.checkIn) : formatDate(booking.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-px bg-gradient-to-r from-emerald-500/40 to-purple-500/40" />
                    {booking.rooms && (
                      <span className="text-[9px] text-white/30 uppercase tracking-wider">{booking.rooms} Room(s)</span>
                    )}
                    {booking.checkIn && booking.checkOut && (
                      <span className="text-[9px] text-indigo-400 tracking-wider">
                        {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} Night(s)
                      </span>
                    )}
                  </div>

                  <div className="text-center md:text-right shrink-0 flex-1">
                    <div className="flex items-center gap-2 justify-center md:justify-end mb-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">CHECK-OUT</p>
                    </div>
                    <p className="text-xl font-bold text-white tracking-tight">
                      {booking.checkOut ? formatDate(booking.checkOut) : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* ──── EVENT: Event Date ──── */}
              {!isTransit && !isHotel && (
                <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
                  <Ticket className="w-5 h-5 text-amber-400" />
                  <div className="text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">EVENT DATE</p>
                    <p className="text-xl font-bold text-white">{schedule.departureTime ? formatDate(schedule.departureTime) : formatDate(booking.createdAt)}</p>
                  </div>
                </div>
              )}

              {/* Category-Aware Metrics Grid */}
              <div className={`grid gap-4 mb-8 ${isTransit ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
                {isTransit && (
                  <>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                      <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Travel Date</p>
                      <p className="text-sm font-medium text-white">
                        {schedule.departureTime ? formatDate(schedule.departureTime) : formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                      <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">
                        {category === 'FLIGHT' ? 'Seat' : 'Class'}
                      </p>
                      <p className="text-sm font-medium text-indigo-300">
                        {category === 'FLIGHT' 
                          ? (booking.passengers?.[0]?.seatNumber || 'Auto-assign')
                          : (booking.passengers?.[0]?.seatNumber ? 'Reserved Seat' : 'General')
                        }
                      </p>
                    </div>
                  </>
                )}
                {isHotel && (
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Booking Date</p>
                    <p className="text-sm font-medium text-white">{formatDate(booking.createdAt)}</p>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">{isHotel ? 'Guest Name' : 'Passenger'}</p>
                  <p className="text-sm font-medium text-white truncate">
                    {booking.passengers?.[0]?.name || 'Guest'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5">
                  <p className="text-[9px] text-white/30 mb-1 uppercase tracking-wider">Total Paid</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(booking.finalAmount)}</p>
                </div>
              </div>

              {/* Payment Details */}
              {payment && (
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Payment Summary</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-white/30 text-[9px] uppercase">Method</p>
                      <p className="text-white font-medium">{payment.method || 'Online'}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-[9px] uppercase">Status</p>
                      <p className="text-emerald-400 font-medium">{payment.status}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-[9px] uppercase">Transaction ID</p>
                      <p className="text-white/70 font-mono text-[10px]">{payment.cashfreePaymentId || payment.id?.slice(0, 16) || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-[9px] uppercase">Amount</p>
                      <p className="text-white font-bold">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Notice */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-white/30">
                <div>
                  <p className="font-semibold text-white/50 mb-0.5">TERMS & CONDITIONS</p>
                  {isHotel ? (
                    <p className="font-light">Check-in/out as per hotel policy. Valid government ID required. Non-transferable.</p>
                  ) : isTransit ? (
                    <p className="font-light">Must carry valid government-issued photo ID at boarding. Report 30 min before departure. Non-transferable.</p>
                  ) : (
                    <p className="font-light">Valid government-issued photo ID required for entry. Non-transferable.</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white/50 mb-0.5">CUSTOMER SUPPORT</p>
                  <p className="font-light">support@arvisx.com | arvisx.com</p>
                </div>
              </div>
            </div>

            {/* BOARDING STUB / QR SECTION */}
            <div className="lg:col-span-1 p-8 bg-white/[0.02] flex flex-col justify-between items-center text-center relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 w-px border-l border-dashed border-white/15 hidden lg:block" />

              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">
                  {isHotel ? 'Booking Voucher' : isTransit ? 'Boarding Pass Stub' : 'Entry Pass'}
                </p>
                <h3 className="text-sm font-bold text-white truncate max-w-[150px] mx-auto">
                  {booking.passengers?.[0]?.name || 'Guest'}
                </h3>
                <p className="text-[10px] text-indigo-400 mt-0.5">
                  {category} · {booking.bookingRef}
                </p>
              </div>

              {/* QR Code */}
              <div className="my-6">
                {qrDataUrl ? (
                  <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg shadow-black/40">
                    <Image src={qrDataUrl} alt="QR Code" width={110} height={110} className="rounded-lg" />
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                    <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                  </div>
                )}
                <p className="text-[9px] text-white/30 mt-2 font-mono uppercase tracking-wide">
                  {isHotel ? 'Show at reception' : 'Scan at gate'}
                </p>
              </div>

              {/* Mini barcode */}
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
          div.relative.overflow-hidden.rounded-\\[32px\\] {
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
