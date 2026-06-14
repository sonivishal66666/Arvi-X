'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Key, RefreshCw, Cpu, Server } from 'lucide-react';
import { useUiStore } from '@/lib/store';

export function AuthTransition() {
  const { isAuthTransitioning, authTransitionType } = useUiStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isAuthTransitioning) {
      setStep(0);
      return;
    }

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 400);

    return () => clearInterval(interval);
  }, [isAuthTransitioning]);

  const signinSteps = [
    { text: 'Establishing secure quantum link...', icon: Server },
    { text: 'Syncing local session headers...', icon: Cpu },
    { text: 'Authorizing registry access...', icon: Shield },
  ];

  const signoutSteps = [
    { text: 'Destroying active session keys...', icon: Lock },
    { text: 'Purging local storage registries...', icon: RefreshCw },
    { text: 'Secure terminal exit complete.', icon: Shield },
  ];

  const currentSteps = authTransitionType === 'signin' ? signinSteps : signoutSteps;
  const ActiveIcon = currentSteps[step]?.icon || Shield;

  return (
    <AnimatePresence>
      {isAuthTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-2xl pointer-events-auto"
        >
          {/* Animated matrix background grid */}
          <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
          
          <div className="relative">
            {/* Ambient glowing outer orbs */}
            <div className="absolute -inset-10 bg-gradient-to-r from-indigo-500/20 via-purple-600/20 to-pink-500/20 rounded-full blur-2xl animate-pulse-glow pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 p-8 glass-card border border-white/10 rounded-[32px] bg-black/40 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Top accent glow line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              {/* Dynamic Center Orbit */}
              <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                {/* Outer spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30"
                />
                
                {/* Inner counter-spinning glow ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  className="absolute -inset-2 rounded-full border border-indigo-500/40 border-t-transparent border-b-transparent shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                />

                {/* Pulsating core */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
                >
                  <ActiveIcon className="w-6 h-6 text-white animate-pulse" />
                </motion.div>
              </div>

              {/* Heading */}
              <h3 
                className="text-lg font-bold text-white tracking-tight mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {authTransitionType === 'signin' ? 'AUTHORIZING PORTAL' : 'TERMINAL SHUTDOWN'}
              </h3>
              
              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs text-white/50 font-light"
                  >
                    {currentSteps[step]?.text}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Loading progress bar */}
              <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden mt-6">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
