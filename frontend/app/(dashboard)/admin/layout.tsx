'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    const isLoginPage = pathname === '/admin/login';

    if (!isAuthenticated) {
      if (!isLoginPage) {
        router.replace('/admin/login');
      }
    } else {
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        router.replace('/');
      } else if (isLoginPage) {
        router.replace('/admin');
      }
    }
  }, [isAuthenticated, user, isLoading, pathname, router, mounted]);

  // Prevent flash of unauthenticated content during loading or redirection
  const isLoginPage = pathname === '/admin/login';
  
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#020208] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#020208] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isAuthenticated && !isLoginPage && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return null; // Will redirect shortly in useEffect
  }

  return <>{children}</>;
}
