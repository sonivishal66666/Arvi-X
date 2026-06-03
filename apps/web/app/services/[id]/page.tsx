'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Calendar, ChevronLeft, Loader2, Shield, Users, Wifi, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { servicesApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { WishlistButton } from '@/components/shared/wishlist-button';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      servicesApi.getById(params.id as string)
        .then(({ data }) => setService(data.service))
        .catch(() => toast.error('Service not found'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Service not found</h2>
          <Button onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    );
  }

  const handleBook = (scheduleId?: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const params = new URLSearchParams({ serviceId: service.id });
    if (scheduleId) params.set('scheduleId', scheduleId);
    router.push(`/booking?${params}`);
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center text-4xl shrink-0">
                  {service.category === 'BUS' ? '🚌' :
                   service.category === 'TRAIN' ? '🚄' :
                   service.category === 'FLIGHT' ? '✈️' :
                   service.category === 'HOTEL' ? '🏨' : '🎫'}
                  <div className="absolute -top-2 -right-2">
                    <WishlistButton serviceId={service.id} className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{service.category}</Badge>
                    {service.discountPercent > 0 && (
                      <Badge variant="premium">-{service.discountPercent}%</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                  <p className="text-muted-foreground">{service.vendor?.businessName}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="font-medium">{service.rating || '4.5'}</span>
                      <span className="text-sm text-muted-foreground">
                        ({service._count?.reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {service.description && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            )}

            {service.amenities && service.amenities.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {service.amenities.map((a: string) => (
                    <Badge key={a} variant="secondary" className="px-3 py-1.5">
                      {a}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {service.schedules && service.schedules.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-lg font-semibold mb-4">Available Schedules</h2>
                <div className="space-y-3">
                  {service.schedules.map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold">{formatTime(schedule.departureTime)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(schedule.departureTime)}</p>
                        </div>
                        <div className="text-center px-4">
                          <p className="text-xs text-muted-foreground mb-1">{schedule.duration} min</p>
                          <div className="w-16 h-px bg-border relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t border-r border-border" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{formatTime(schedule.arrivalTime)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(schedule.arrivalTime)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(schedule.dynamicPrice || schedule.basePrice)}</p>
                        <p className="text-xs text-muted-foreground">{schedule.availableSeats} seats left</p>
                        <Button size="sm" className="mt-2 rounded-xl" onClick={() => handleBook(schedule.id)}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {service.reviews && service.reviews.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-lg font-semibold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {service.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-2xl bg-secondary/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                          {review.user?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.user?.name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-28"
            >
              <div className="glass-card p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {formatCurrency(service.basePrice * (1 - service.discountPercent / 100))}
                    </span>
                    {service.discountPercent > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(service.basePrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-muted-foreground">Secure booking with instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-muted-foreground">Free cancellation within 1 hour</span>
                  </div>
                </div>

                <Button className="w-full h-12 rounded-xl text-base" onClick={() => handleBook()}>
                  Book Now
                </Button>

                {service.event && (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(service.event.startDate, 'long')} - {formatDate(service.event.endDate, 'long')}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {service.event.venue}
                    </p>
                  </div>
                )}

                {service.hotel && (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Check-in: {service.hotel.checkInTime} | Check-out: {service.hotel.checkOutTime}
                    </p>
                    <p className="text-muted-foreground">{service.hotel.propertyType} · {service.hotel.starRating} Star</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
