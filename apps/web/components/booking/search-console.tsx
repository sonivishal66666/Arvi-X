'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, Bus, Plane, Hotel, Calendar as CalendarIcon, Ticket, ArrowRightLeft, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const categories = [
  { id: 'train', label: 'Trains', icon: Train, theme: 'from-orange-500 to-red-500' },
  { id: 'bus', label: 'Buses', icon: Bus, theme: 'from-blue-500 to-cyan-500' },
  { id: 'flight', label: 'Flights', icon: Plane, theme: 'from-purple-500 to-pink-500' },
  { id: 'hotel', label: 'Hotels', icon: Hotel, theme: 'from-emerald-500 to-teal-500' },
  { id: 'event', label: 'Events', icon: Ticket, theme: 'from-amber-500 to-yellow-500' },
];

const subTabs = {
  train: ['Book Train Tickets', 'Check PNR Status', 'Live Train Status'],
  bus: ['Book Bus Tickets', 'Check Booking Status'],
  flight: ['Book Flights', 'Flight Status'],
  hotel: ['Book Hotels & Stays', 'Manage Bookings'],
  event: ['Book Event Tickets', 'Upcoming Festivals'],
};

const defaultCities = [
  { name: 'Mumbai', code: 'BOM', label: 'Mumbai - Chhatrapati Shivaji Terminus / Airport' },
  { name: 'Delhi', code: 'DEL', label: 'Delhi - New Delhi Railway / Indira Gandhi Airport' },
  { name: 'Bangalore', code: 'BLR', label: 'Bangalore - KSR Station / Kempegowda Airport' },
  { name: 'Hyderabad', code: 'HYD', label: 'Hyderabad - Secunderabad / Rajiv Gandhi Airport' },
  { name: 'Chennai', code: 'MAA', label: 'Chennai - Central Station / Chennai Airport' },
  { name: 'Kolkata', code: 'CCU', label: 'Kolkata - Howrah / Netaji Subhash Airport' },
  { name: 'Pune', code: 'PNQ', label: 'Pune - Pune Junction / Pune Airport' },
  { name: 'Goa', code: 'GOI', label: 'Goa - Madgaon / Dabolim Airport' },
  { name: 'Jaipur', code: 'JAI', label: 'Jaipur - Jaipur Junction / Sanganer Airport' },
];

export function SearchConsole() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('train');
  const [activeSubTab, setActiveSubTab] = useState(subTabs.train[0]);

  // Prefetch category page on active category change
  useEffect(() => {
    const path = activeCat === 'bus' ? '/buses' : `/${activeCat}s`;
    router.prefetch(path);
  }, [activeCat, router]);

  // Form states
  const [from, setFrom] = useState('Loharu');
  const [to, setTo] = useState('Rewari');
  const [showFromOpts, setShowFromOpts] = useState(false);
  const [showToOpts, setShowToOpts] = useState(false);
  const [travelDate, setTravelDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [guests, setGuests] = useState('2 Guests, 1 Room');
  const [pnr, setPnr] = useState('');

  const swapStations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeSubTab.includes('PNR') || activeSubTab.includes('Status') || activeSubTab.includes('Booking') || activeSubTab.includes('Manage')) {
      if (pnr) {
        router.push(`/bookings/${pnr}`);
      } else {
        router.push('/user/bookings');
      }
      return;
    }

    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('date', travelDate);
    params.set('category', activeCat.toUpperCase());

    if (activeCat === 'train') {
      params.set('class', selectedClass);
      router.push(`/trains?${params.toString()}`);
    } else if (activeCat === 'bus') {
      router.push(`/buses?${params.toString()}`);
    } else if (activeCat === 'flight') {
      router.push(`/flights?${params.toString()}`);
    } else if (activeCat === 'hotel') {
      params.set('guests', guests);
      router.push(`/hotels?${params.toString()}`);
    } else if (activeCat === 'event') {
      router.push(`/events?${params.toString()}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card-dark p-6 rounded-[32px] border border-white/10 relative overflow-hidden bg-black/40 shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      {/* Main Categories Navigation Bar */}
      <div className="flex gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCat(cat.id);
                setActiveSubTab(subTabs[cat.id as keyof typeof subTabs][0]);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-500/20'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Domain Sub-Tabs */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6 border-b border-white/[0.08] pb-4">
        <div className="flex gap-4">
          {(subTabs[activeCat as keyof typeof subTabs] || []).map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`relative pb-2 text-xs font-medium uppercase tracking-widest transition-colors ${
                  isActive ? 'text-indigo-400 font-semibold' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab}
                {isActive && (
                  <motion.div
                    layoutId="search-subtab-active"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
                )}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold hidden sm:block">
          IRCTC AUTHORIZED E-TICKETING
        </span>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSearch} className="space-y-4">
        <AnimatePresence mode="wait">
          {!activeSubTab.includes('Book') && !activeSubTab.includes('Hotels') && !activeSubTab.includes('Tickets') ? (
            <motion.div
              key="status-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-3 gap-4"
            >
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">
                  Reference ID / PNR Number
                </label>
                <Input
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  placeholder="Enter 10-digit PNR / Booking ID"
                  className="input-premium border-white/10 h-14 rounded-2xl bg-white/5"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 rounded-2xl font-bold flex items-center justify-center gap-2 text-white border-0 shadow-lg shadow-indigo-500/10"
                >
                  <Search className="w-4 h-4" />
                  Fetch Real-Time Status
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative"
            >
              {/* FROM SECTION */}
              <div className="md:col-span-3 space-y-1.5 relative">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">From</label>
                <Input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  onFocus={() => {
                    setShowFromOpts(true);
                    setShowToOpts(false);
                  }}
                  className="input-premium border-white/10 h-14 rounded-2xl bg-white/5 font-semibold text-base"
                />
                {showFromOpts && (
                  <div className="absolute left-0 right-0 top-20 z-50 glass-card-dark border border-white/10 rounded-2xl bg-black/85 max-h-60 overflow-y-auto p-2 scrollbar-none shadow-2xl">
                    {defaultCities
                      .filter((c) => c.name.toLowerCase().includes(from.toLowerCase()))
                      .map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setFrom(c.name);
                            setShowFromOpts(false);
                          }}
                          className="w-full text-left p-3 text-xs rounded-xl hover:bg-white/[0.06] flex justify-between items-center group transition-colors"
                        >
                          <span className="text-white font-medium">{c.name}</span>
                          <span className="text-white/40 group-hover:text-indigo-400 font-mono transition-colors">{c.code}</span>
                        </button>
                      ))}
                    {defaultCities.filter((c) => c.name.toLowerCase().includes(from.toLowerCase())).length === 0 && (
                      <p className="text-[10px] text-white/40 text-center p-3">No matching cities found</p>
                    )}
                  </div>
                )}
              </div>

              {/* SWAP BUTTON */}
              <div className="md:col-span-1 flex justify-center items-end h-full py-1">
                <button
                  type="button"
                  onClick={swapStations}
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/20 active:scale-95 transition-all mt-4"
                >
                  <ArrowRightLeft className="w-4 h-4 rotate-90 md:rotate-0" />
                </button>
              </div>

              {/* TO SECTION */}
              <div className="md:col-span-3 space-y-1.5 relative">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">To</label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  onFocus={() => {
                    setShowToOpts(true);
                    setShowFromOpts(false);
                  }}
                  className="input-premium border-white/10 h-14 rounded-2xl bg-white/5 font-semibold text-base"
                />
                {showToOpts && (
                  <div className="absolute left-0 right-0 top-20 z-50 glass-card-dark border border-white/10 rounded-2xl bg-black/85 max-h-60 overflow-y-auto p-2 scrollbar-none shadow-2xl">
                    {defaultCities
                      .filter((c) => c.name.toLowerCase().includes(to.toLowerCase()))
                      .map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setTo(c.name);
                            setShowToOpts(false);
                          }}
                          className="w-full text-left p-3 text-xs rounded-xl hover:bg-white/[0.06] flex justify-between items-center group transition-colors"
                        >
                          <span className="text-white font-medium">{c.name}</span>
                          <span className="text-white/40 group-hover:text-indigo-400 font-mono transition-colors">{c.code}</span>
                        </button>
                      ))}
                    {defaultCities.filter((c) => c.name.toLowerCase().includes(to.toLowerCase())).length === 0 && (
                      <p className="text-[10px] text-white/40 text-center p-3">No matching cities found</p>
                    )}
                  </div>
                )}
              </div>

              {/* DATE PICKER */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">
                  Travel Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="pl-11 input-premium border-white/10 h-14 rounded-2xl bg-white/5 font-semibold text-sm"
                  />
                </div>
              </div>

              {/* CLASS / DETAILS SELECTION */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">
                  {activeCat === 'hotel' ? 'Guests & Rooms' : 'Class / Category'}
                </label>
                {activeCat === 'hotel' ? (
                  <Input
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    placeholder="2 Guests, 1 Room"
                    className="input-premium border-white/10 h-14 rounded-2xl bg-white/5 font-semibold text-sm"
                  />
                ) : (
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 text-white px-4 text-sm font-semibold focus-visible:ring-indigo-500/35"
                  >
                    <option value="ALL" className="bg-[#020208]">All Classes</option>
                    {activeCat === 'train' && (
                      <>
                        <option value="SL" className="bg-[#020208]">Sleeper Class (SL)</option>
                        <option value="3A" className="bg-[#020208]">AC 3 Tier (3A)</option>
                        <option value="2A" className="bg-[#020208]">AC 2 Tier (2A)</option>
                        <option value="1A" className="bg-[#020208]">AC 1st Class (1A)</option>
                      </>
                    )}
                    {activeCat === 'bus' && (
                      <>
                        <option value="AC_SLEEPER" className="bg-[#020208]">AC Sleeper</option>
                        <option value="AC_SEATER" className="bg-[#020208]">AC Seater</option>
                        <option value="VOLVO" className="bg-[#020208]">Volvo Multi-Axle</option>
                      </>
                    )}
                    {activeCat === 'flight' && (
                      <>
                        <option value="Y" className="bg-[#020208]">Economy Class</option>
                        <option value="J" className="bg-[#020208]">Business Class</option>
                      </>
                    )}
                    {activeCat === 'event' && (
                      <>
                        <option value="GA" className="bg-[#020208]">General Admission</option>
                        <option value="VIP" className="bg-[#020208]">VIP Access</option>
                      </>
                    )}
                  </select>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLICK CLICK CLOSE DROPDOWNS IF OUTSIDE CLICK (SIMULATED VIA MOUSELEAVE) */}
        {(showFromOpts || showToOpts) && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => {
              setShowFromOpts(false);
              setShowToOpts(false);
            }}
          />
        )}

        {/* SUBMIT BUTTON SECTION */}
        {activeSubTab.includes('Book') || activeSubTab.includes('Hotels') || activeSubTab.includes('Tickets') ? (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/[0.06] mt-4">
            <div className="flex gap-4 text-[10px] text-white/30 tracking-widest uppercase">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Instant E-ticket Dispatch
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> Free cancellations
              </span>
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:brightness-110 rounded-2xl font-bold flex items-center justify-center gap-2 text-white border-0 shadow-lg shadow-indigo-500/25 shrink-0"
            >
              <Search className="w-4 h-4" />
              Launch Search Registry
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
