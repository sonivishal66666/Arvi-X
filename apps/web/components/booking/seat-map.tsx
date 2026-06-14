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
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (seats.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* HUD Legend */}
      <div className="flex flex-wrap items-center gap-6 text-xs bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/[0.02] border-2 border-emerald-500/30" />
          <span className="text-white/45">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
          <span className="text-white/45">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-950/20 border-2 border-rose-900/30" />
          <span className="text-white/45">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/20 border-2 border-amber-900/30" />
          <span className="text-white/45">Locked</span>
        </div>
      </div>

      {sortedDecks.map((deck) => {
        const deckSeats = groupedByDeck[deck];
        const maxRow = Math.max(...deckSeats.map(s => s.row || 0));
        const cols = ['W', 'A', 'B', 'C', 'D'];

        return (
          <div key={deck} className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-md">
            {sortedDecks.length > 1 && (
              <p className="text-xs text-white/30 mb-4 font-semibold tracking-wider uppercase">
                Deck {deck}
              </p>
            )}

            <div className="relative">
              {/* Cockpit laser guide line */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none">
                <div className="w-[1px] h-full bg-gradient-to-b from-cyan-500/30 via-purple-500/20 to-transparent" />
              </div>

              <div className="ml-8 space-y-2">
                {Array.from({ length: maxRow }, (_, rowIdx) => {
                  const row = rowIdx + 1;
                  const rowSeats = deckSeats.filter(s => s.row === row).sort((a, b) => {
                    const colOrder = cols.indexOf(a.column);
                    const colOrderB = cols.indexOf(b.column);
                    return colOrder - colOrderB;
                  });

                  if (rowSeats.length === 0) return <div key={row} className="h-10" />;

                  return (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-6 text-right text-[10px] text-white/30 font-semibold tracking-wider font-mono mr-1">{row}</span>
                      {rowSeats.map((seat) => {
                        const isBooked = seat.status === 'BOOKED';
                        const isLocked = seat.status === 'LOCKED';
                        const isSelected = selectedSeats.includes(seat.id);
                        const unavailable = isBooked || isLocked;

                        return (
                          <motion.button
                            key={seat.id}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => toggleSeat(seat)}
                            disabled={unavailable}
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-300 relative',
                              isBooked && 'bg-rose-950/20 border-2 border-rose-900/30 cursor-not-allowed text-rose-700/60',
                              isLocked && 'bg-amber-950/20 border-2 border-amber-900/30 cursor-not-allowed text-amber-700/60',
                              isSelected && 'bg-cyan-500/25 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
                              !unavailable && !isSelected && 'bg-white/[0.02] border-2 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/5',
                            )}
                            title={`${seat.seatNumber} - ₹${seat.price}`}
                          >
                            <Chair className={cn(
                              'w-4 h-4 transition-all duration-300',
                              isSelected ? 'scale-110 drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]' : ''
                            )} />
                            {isSelected && (
                              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-400 text-[8px] text-black font-extrabold flex items-center justify-center rounded-full animate-pulse shadow-[0_0_4px_rgba(34,211,238,0.8)]">✓</span>
                            )}
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
        <div className="p-4 rounded-xl bg-cyan-950/15 border border-cyan-500/25 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.04)]">
          <div>
            <p className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">Selected Seating Pods</p>
            <p className="font-bold text-white text-sm mt-0.5">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={clearSeats} className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition-colors font-medium">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
