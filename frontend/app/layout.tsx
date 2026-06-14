import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CategorySearchDialog } from '@/components/shared/category-search-dialog';
import { AIChat } from '@/components/ai/ai-chat';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { AuthSync } from '@/components/shared/auth-sync';
import { AuthTransition } from '@/components/shared/auth-transition';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Arvis X - Premium AI-Powered Travel & Ticket Booking',
  description: 'Book buses, trains, flights, hotels, and events with AI-powered recommendations and seamless experience.',
  keywords: 'travel, booking, bus, train, flight, hotel, event, AI, tickets',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'Arvis X - Premium AI Travel Platform',
    description: 'Book buses, trains, flights, hotels and events. AI-powered recommendations.',
    images: ['/logo.png'],
    type: 'website',
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Space+Grotesk:wght@300..700&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js" async />
      </head>
      <body className="min-h-screen bg-background antialiased relative">
        <div className="noise-bg" />
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20">
          <div className="orb w-[500px] h-[500px] bg-indigo-500/10 -top-40 -left-40 animate-orb-pulse" />
          <div className="orb w-[600px] h-[600px] bg-purple-500/8 bottom-20 -right-20 animate-orb-pulse" />
          <div className="orb w-[450px] h-[450px] bg-pink-500/5 top-1/2 left-1/3 animate-float" />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <AuthSync />
          <AuthTransition />
          <CategorySearchDialog />
          <AIChat />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
