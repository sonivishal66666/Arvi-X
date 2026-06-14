'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot, User, ChevronDown } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { useUiStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export function AIChat() {
  const { isAIChatOpen, setAIChatOpen } = useUiStore();
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ASSISTANT',
      content: 'Hello! I\'m your AI travel assistant. How can I help you plan your journey today?',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'USER',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await aiApi.chat({
        message: userMessage.content,
        sessionId: sessionId || undefined,
      });

      setSessionId(data.sessionId);
      setSuggestions(data.suggestions || []);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-resp`,
          role: 'ASSISTANT',
          content: data.message.content,
          createdAt: data.message.createdAt,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'ASSISTANT',
          content: 'I apologize, but I encountered an error. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setAIChatOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95',
          isAIChatOpen && 'scale-0 opacity-0',
        )}
      >
        <Bot className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isAIChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] glass-card flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Arvis AI</p>
                  <p className="text-xs text-muted-foreground">Travel Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setAIChatOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-secondary/80 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-3', msg.role === 'USER' && 'flex-row-reverse')}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl flex items-center justify-center shrink-0',
                      msg.role === 'ASSISTANT' ? 'bg-primary/10' : 'bg-secondary',
                    )}
                  >
                    {msg.role === 'ASSISTANT' ? (
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      msg.role === 'USER'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-secondary/80 text-foreground rounded-tl-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary/80 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {suggestions.length > 0 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 pt-2 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="flex-1 h-10 text-sm"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
