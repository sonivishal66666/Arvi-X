'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
Compass, Send, Bot, User, Loader2, Mic, MicOff, Calendar,
  MapPin, ChevronRight, Plane, Hotel, Train, Bus, Ticket, Shield,
  Zap,
} from 'lucide-react';
import { aiApi } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { ClientOnly } from '@/components/shared/client-only';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

const ease = [0.16, 1, 0.3, 1];
const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'itinerary' | 'recommendations'>('chat');

  return (
    <div className="pt-28 min-h-screen bg-black text-white overflow-hidden relative pb-16">
      {/* Dynamic Backdrops */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.06] blur-[150px] animate-orb-pulse" />
        <div className="absolute -bottom-[100px] -right-[200px] w-[500px] h-[500px] rounded-full bg-purple-500/[0.04] blur-[150px] animate-orb-pulse animation-delay-4000" />
        <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.03] blur-[120px] animate-float-slow" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* Moving background particles */}
      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div key={i} className="absolute w-[2px] h-[2px] rounded-full bg-indigo-400/30"
              style={{ left: `${10 + Math.random() * 80}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -200], opacity: [0, 0.8, 0] }}
              transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }} />
          ))}
        </div>
      </ClientOnly>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
            <Badge className="mb-5 px-4 py-1.5 rounded-full glass border border-white/[0.08] text-indigo-300 text-[10px] tracking-[0.25em] uppercase font-medium animate-pulse-glow">
              <Compass className="w-3.5 h-3.5 mr-2 text-indigo-400" />
              AI Travel Concierge
            </Badge>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-glow" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Neural Travel <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Planner</span>
          </h1>
          <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto font-light leading-relaxed">
            Unlock bespoke itineraries, predictive travel pathways, and instant terminal support via our cognitive routing agent.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/20">
            <div className="flex items-center gap-1.5 text-[11px] font-light"><Shield className="w-3.5 h-3.5" /><span>Secure Encryption</span></div>
            <div className="flex items-center gap-1.5 text-[11px] font-light"><Zap className="w-3.5 h-3.5" /><span>Predictive Routing</span></div>
            <div className="flex items-center gap-1.5 text-[11px] font-light"><Compass className="w-3.5 h-3.5" /><span>Real-Time Sync</span></div>
          </div>
        </div>

        <div className="w-full h-px mb-10"><div className="line-glow w-full animate-gradient-x" /></div>

        {/* Floating Navigation Bar */}
        <div className="flex justify-center mb-10">
          <div className="flex glass p-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-3xl shadow-xl bg-black/40">
            {[
              { id: 'chat', label: 'AI Core Chat', icon: Bot },
              { id: 'itinerary', label: 'Itinerary Engine', icon: Compass },
              { id: 'recommendations', label: 'Smart Feeds', icon: Compass }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative',
                    isActive
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/80'
                  )}
                >
                  <Icon className="w-4 h-4 z-10" />
                  <span className="z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-active-glow"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/80 to-purple-600/80 shadow-md shadow-indigo-500/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Pane */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {activeTab === 'chat' && <AIChatTab />}
            {activeTab === 'itinerary' && <AIItineraryTab />}
            {activeTab === 'recommendations' && <AIRecommendationsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AIChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ASSISTANT',
      content: "Neural link established. I am your Arvis AI concierge. Input your terminal routing, hotel inquiries, or travel blueprints below to generate dynamic routes.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Plan a 3-day luxury stay in Mumbai',
    'Find hotels near Delhi airport',
    'Show flight tickets to Bangalore'
  ]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'USER',
      content: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await aiApi.chat({
        message: textToSend,
        sessionId: sessionId || undefined
      });

      setSessionId(data.sessionId);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-resp`,
          role: 'ASSISTANT',
          content: data.message.content,
          createdAt: data.message.createdAt
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'ASSISTANT',
          content: 'Terminal delay detected. Query timeout. Please try again.',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input not supported on this terminal.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast('Neural voice sync active...');
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice sync failed.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      toast.success('Speech synced successfully.');
    };

    recognition.start();
  };

  return (
    <div className="relative rounded-3xl p-1 bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md overflow-hidden flex flex-col h-[620px] shadow-2xl max-w-4xl mx-auto">
      {/* Cybernetic glowing border trails */}
      <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

      {/* Messages View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn('flex gap-4 max-w-[85%] items-start', msg.role === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto')}
          >
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-all duration-300',
              msg.role === 'ASSISTANT' 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500/20 text-white' 
                : 'bg-white/[0.05] border-white/10'
            )}>
              {msg.role === 'ASSISTANT' ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
            </div>
            
            <div className={cn(
              'px-5 py-3.5 rounded-2xl text-xs md:text-sm leading-relaxed border shadow-[0_5px_15px_rgba(0,0,0,0.2)]',
              msg.role === 'USER'
                ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white border-indigo-500/20 rounded-tr-none'
                : 'glass border-white/[0.06] text-white/90 rounded-tl-none bg-black/40'
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 max-w-[80%] items-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="glass border border-white/[0.08] px-5 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 bg-black/40">
              <Loader2 className="w-4.5 h-4.5 animate-spin text-indigo-400" />
              <span className="text-xs text-white/40 font-light">Processing query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mic Animation Overlay */}
      {isListening && (
        <div className="absolute inset-x-0 bottom-36 flex items-center justify-center pointer-events-none z-30">
          <div className="flex items-center gap-1.5 bg-black/80 px-5 py-2.5 rounded-full border border-rose-500/30 shadow-lg backdrop-blur-md">
            {[1, 2, 3, 4, 5].map((idx) => (
              <motion.div
                key={idx}
                animate={{ height: [8, 22, 8] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: idx * 0.1 }}
                className="w-1 bg-rose-500 rounded-full"
              />
            ))}
            <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-400 ml-2">Mic Active</span>
          </div>
        </div>
      )}

      {/* Suggestion Chips */}
      {suggestions.length > 0 && (
        <div className="px-6 py-3 flex gap-2 overflow-x-auto whitespace-nowrap border-t border-white/[0.04] bg-black/35 scrollbar-none z-10">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[11px] px-4 py-2 rounded-xl bg-white/[0.02] hover:bg-indigo-950/20 border border-white/[0.06] hover:border-indigo-500/30 text-white/50 hover:text-white transition-all duration-300 active:scale-[0.98] transform hover:scale-[1.02]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input controls */}
      <div className="p-4 border-t border-white/[0.08] bg-black/80 backdrop-blur-md relative z-10">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Arvis about booking, routes, hotels..."
              className="w-full bg-white/[0.02] border-white/10 focus-visible:ring-indigo-500/30 text-white placeholder:text-white/20 h-12 rounded-xl pl-4 pr-12 text-xs md:text-sm"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={startListening}
              className={cn(
                'absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                isListening
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'hover:bg-white/[0.08] text-white/40 hover:text-white'
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white flex items-center justify-center shrink-0 border-0 shadow-lg shadow-indigo-500/10"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AIItineraryTab() {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState(25000);
  const [interests, setInterests] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [itineraryHtml, setItineraryHtml] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error('Destination required.');
      return;
    }

    setIsLoading(true);
    setItineraryHtml(null);

    try {
      const { data } = await aiApi.itinerary({
        destination: destination.trim(),
        duration,
        budget,
        interests: interests.trim() || undefined,
        startDate: startDate || undefined
      });
      setItineraryHtml(data.itinerary);
      toast.success('Bespoke itinerary compiled.');
    } catch {
      toast.error('Failed to compile blueprint.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItineraryActionCards = (text: string) => {
    const categoriesFound = new Set<string>();
    const lowercase = text.toLowerCase();
    
    if (lowercase.includes('hotel') || lowercase.includes('stay') || lowercase.includes('resort')) categoriesFound.add('HOTEL');
    if (lowercase.includes('flight') || lowercase.includes('airline') || lowercase.includes('airport')) categoriesFound.add('FLIGHT');
    if (lowercase.includes('train') || lowercase.includes('rail')) categoriesFound.add('TRAIN');
    if (lowercase.includes('bus') || lowercase.includes('cab')) categoriesFound.add('BUS');
    if (lowercase.includes('event') || lowercase.includes('concert') || lowercase.includes('ticket') || lowercase.includes('museum')) categoriesFound.add('EVENT');

    if (categoriesFound.size === 0) return null;

    return (
      <div className="mt-8 border-t border-white/[0.08] pt-6">
        <h4 className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase mb-4 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-indigo-400" />
          Recommended Booking Services for {destination}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from(categoriesFound).map((cat) => {
            let title = '';
            let desc = '';
            let icon = null;
            let route = '';

            switch (cat) {
              case 'HOTEL':
                title = 'Premium Stays';
                desc = `Explore luxury suites and stays in ${destination}`;
                icon = <Hotel className="w-4.5 h-4.5 text-emerald-400" />;
                route = `/hotels?city=${encodeURIComponent(destination)}`;
                break;
              case 'FLIGHT':
                title = 'Premium Flights';
                desc = `Find business class flights to ${destination}`;
                icon = <Plane className="w-4.5 h-4.5 text-sky-400" />;
                route = `/flights?q=${encodeURIComponent(destination)}`;
                break;
              case 'TRAIN':
                title = 'Luxury Rail journeys';
                desc = `Check executive train bookings to ${destination}`;
                icon = <Train className="w-4.5 h-4.5 text-amber-400" />;
                route = `/trains?q=${encodeURIComponent(destination)}`;
                break;
              case 'BUS':
                title = 'Luxury Coach routes';
                desc = `Book premium AC sleeper buses to ${destination}`;
                icon = <Bus className="w-4.5 h-4.5 text-pink-400" />;
                route = `/buses?q=${encodeURIComponent(destination)}`;
                break;
              case 'EVENT':
                title = 'Premium Events';
                desc = `Discover matches, concerts, and tickets in ${destination}`;
                icon = <Ticket className="w-4.5 h-4.5 text-purple-400" />;
                route = `/events?city=${encodeURIComponent(destination)}`;
                break;
            }

            return (
              <a
                key={cat}
                href={route}
                className="group p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-indigo-500/30 rounded-2xl transition-all duration-300 flex items-center gap-4 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0 border border-white/5">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{title}</p>
                  <p className="text-[10px] text-white/40 truncate mt-0.5 font-light">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
      {/* Blueprint form */}
      <div className="lg:col-span-4">
        <form onSubmit={handleGenerate} className="relative rounded-3xl p-6 bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md shadow-lg space-y-5">
          <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <h3 className="text-base font-bold flex items-center gap-2 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Compass className="w-5 h-5 text-indigo-400" />
            Blueprint Parameters
          </h3>

          <div>
            <label className="text-[9px] text-white/40 font-semibold uppercase tracking-wider block mb-2">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto, London"
                className="input-premium pl-10 border-white/[0.06] w-full h-11 bg-white/[0.02]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-white/40 font-semibold uppercase tracking-wider block mb-2">Duration (Days)</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="number"
                min={1}
                max={14}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="input-premium pl-10 border-white/[0.06] w-full h-11 bg-white/[0.02]"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-white/40 font-semibold uppercase tracking-wider block mb-2">Budget (INR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/30">₹</span>
              <Input
                type="number"
                min={1000}
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value) || 1000)}
                className="input-premium pl-10 border-white/[0.06] w-full h-11 bg-white/[0.02]"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] text-white/40 font-semibold uppercase tracking-wider block mb-2">Travel Interests</label>
            <Input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Museums, Fine Stays"
              className="input-premium border-white/[0.06] w-full h-11 bg-white/[0.02]"
            />
          </div>

          <div>
            <label className="text-[9px] text-white/40 font-semibold uppercase tracking-wider block mb-2">Transit Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-premium border-white/[0.06] w-full h-11 bg-white/[0.02] text-white/60"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:brightness-110 border-0 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-500/10 mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-white" />
                Compile Blueprint
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Output Displays */}
      <div className="lg:col-span-8 flex flex-col">
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-black/85 to-neutral-950 border border-white/[0.04] backdrop-blur-md shadow-2xl min-h-[400px] flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mb-4" />
              <p className="text-xs text-white/50 animate-pulse font-light uppercase tracking-wider">Curating neural travel nodes...</p>
            </div>
          ) : itineraryHtml ? (
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Compiled Itinerary Blueprint</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-light"> BESP-DEPT: {destination} ({duration} days)</p>
                </div>
                <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-xs">{formatCurrency(budget)} CAP</Badge>
              </div>

              {/* Rendering timeline segments natively */}
              <div className="text-xs md:text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-sans space-y-4 font-light relative pl-4 border-l border-indigo-500/20 ml-2">
                {itineraryHtml.split('\n').map((line, idx) => {
                  const isDayHeader = line.toLowerCase().includes('day ') || line.toLowerCase().startsWith('day');
                  if (isDayHeader) {
                    return (
                      <div key={idx} className="relative mt-6 mb-2">
                        <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] border-2 border-black" />
                        <h4 className="text-sm font-bold text-indigo-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{line}</h4>
                      </div>
                    );
                  }
                  return <p key={idx} className="my-1.5 text-white/70 font-light">{line}</p>;
                })}
              </div>

              {renderItineraryActionCards(itineraryHtml)}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <Compass className="w-12 h-12 text-white/10 mb-4 animate-pulse" />
              <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Console Offline</h3>
              <p className="text-xs text-white/40 max-w-xs leading-relaxed font-light">
                Parameters required. Submit the configuration panel to coordinate dynamic travel nodes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AIRecommendationsTab() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [basedOn, setBasedOn] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    aiApi.recommendations()
      .then(({ data }) => {
        setRecommendations(data.recommendations || []);
        setBasedOn(data.basedOn || 'popular');
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Smart Recommendation Registry</h3>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-light">
            Nodes configured based on: {basedOn === 'popular' ? 'platform trends' : `${basedOn} preferences`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/5 h-[280px] shimmer" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="relative rounded-3xl p-12 text-center border border-white/[0.08] bg-gradient-to-br from-black/85 to-neutral-950 backdrop-blur-md">
          <Compass className="w-9 h-9 text-white/20 mx-auto mb-3 animate-pulse" />
          <p className="text-xs font-semibold text-white">Empty Registry</p>
          <p className="text-[10px] text-white/40 max-w-xs mx-auto mt-1 font-light">Book transit journeys or save properties to sync recommendation paths.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((svc) => (
            <a
              key={svc.id}
              href={`/services/${svc.id}`}
              className="relative rounded-2xl overflow-hidden border border-white/[0.04] hover:border-indigo-500/30 shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.12)] transition-all duration-500 block bg-gradient-to-br from-black/85 to-neutral-950 group h-full"
            >
              {/* Cybernetic glowing border trails */}
              <div className="absolute top-0 left-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent group-hover:w-[50%] transition-all duration-700" />
              <div className="absolute bottom-0 right-0 w-[15%] h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent group-hover:w-[50%] transition-all duration-700" />

              <div className="aspect-[16/10] relative overflow-hidden bg-black/40">
                <img
                  src={svc.images?.[0] || 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&q=80'}
                  alt={svc.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-white/10 text-white/90 border border-white/20 text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">{svc.category}</Badge>
                  {svc.discountPercent > 0 && (
                    <Badge className="bg-red-500/80 text-white border-0 text-[9px] font-bold">-{svc.discountPercent}%</Badge>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3 relative z-10">
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{svc.title}</h4>
                  <p className="text-[10px] text-white/40 truncate mt-0.5 font-light">{svc.vendor?.businessName || 'Premium transit'}</p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-amber-400">★</span>
                    <span className="text-xs font-semibold text-white/80">{svc.rating || '4.5'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-mono">{formatCurrency(svc.basePrice)}</p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
