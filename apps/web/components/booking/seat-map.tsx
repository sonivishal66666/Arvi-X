'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArmchairIcon as Chair, Loader2 } from 'lucide-react';
import { servicesApi } from '@/lib/api';
import { useBookingStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Seat {
  id: string;
  seatNumber: string;
  row: number;
  column: string;
  deck: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price: number;
}

interface SeatMapProps {
  serviceId: string;
  scheduleId: string;
}

export function SeatMap({ serviceId, scheduleId }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedSeats, addSeat, removeSeat, clearSeats } = useBookingStore();

  useEffect(() => {
    if (!serviceId || !scheduleId) return;
    setIsLoading(true);
    servicesApi.getSeats(serviceId, scheduleId)
      .then(({ data }) => setSeats(data.seats || []))
      .catch(() => toast.error('Failed to load seats'))
      .finally(() => setIsLoading(false));
  }, [serviceId, scheduleId]);

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') return;
    if (selectedSeats.includes(seat.id)) {
      removeSeat(seat.id);
    } else {
      addSeat(seat.id);
    }
  }, [selectedSeats, addSeat, removeSeat]);

  const groupedByDeck = seats.reduce<Record<number, Seat[]>>((acc, seat) => {
    const deck = seat.deck || 1;
    if (!acc[deck]) acc[deck] = [];
    acc[deck].push(seat);
    return acc;
  }, {});

  const sortedDecks = Object.keys(groupedByDeck).sort().map(Number);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (seats.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border-2 border-white/20 bg-white/5" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-primary/30 border-2 border-primary/50" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-rose-500/30 border-2 border-rose-500/50" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-amber-500/20 border-2 border-amber-500/30" />
          <span className="text-muted-foreground">Locked</span>
        </div>
      </div>

      {sortedDecks.map((deck) => {
        const deckSeats = groupedByDeck[deck];
        const maxRow = Math.max(...deckSeats.map(s => s.row || 0));
        const cols = ['W', 'A', 'B', 'C', 'D'];

        return (
          <div key={deck} className="glass p-6 rounded-2xl">
            {sortedDecks.length > 1 && (
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                Deck {deck}
              </p>
            )}

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center">
                <div className="w-1 h-full rounded-full bg-gradient-to-b from-primary/20 to-primary/5" />
              </div>

              <div className="ml-10 space-y-2">
                {Array.from({ length: maxRow }, (_, rowIdx) => {
                  const row = rowIdx + 1;
                  const rowSeats = deckSeats.filter(s => s.row === row).sort((a, b) => {
                    const colOrder = cols.indexOf(a.column);
                    const colOrderB = cols.indexOf(b.column);
                    return colOrder - colOrderB;
                  });

                  if (rowSeats.length === 0) return <div key={row} className="h-10" />;

                  return (
                    <div key={row} className="flex items-center gap-1.5">
                      <span className="w-6 text-right text-xs text-muted-foreground">{row}</span>
                      {rowSeats.map((seat) => {
                        const isBooked = seat.status === 'BOOKED';
                        const isLocked = seat.status === 'LOCKED';
                        const isSelected = selectedSeats.includes(seat.id);
                        const unavailable = isBooked || isLocked;

                        return (
                          <motion.button
                            key={seat.id}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleSeat(seat)}
                            disabled={unavailable}
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium transition-all duration-200',
                              isBooked && 'bg-rose-500/30 border-2 border-rose-500/50 cursor-not-allowed text-rose-300',
                              isLocked && 'bg-amber-500/20 border-2 border-amber-500/30 cursor-not-allowed text-amber-300',
                              isSelected && 'bg-primary/30 border-2 border-primary/50 text-primary shadow-lg shadow-primary/20',
                              !unavailable && !isSelected && 'bg-white/5 border-2 border-white/10 hover:border-primary/30 hover:bg-white/10 text-white/70',
                            )}
                            title={`${seat.seatNumber} - ₹${seat.price}`}
                          >
                            <Chair className="w-4 h-4" />
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {selectedSeats.length > 0 && (
        <div className="glass p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selected Seats</p>
            <p className="font-medium">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={clearSeats} className="text-xs text-destructive hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
