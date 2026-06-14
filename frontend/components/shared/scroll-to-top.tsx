'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);

  const scroll = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scroll}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-primary/20 transition-all duration-300 shadow-lg shadow-primary/10"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
