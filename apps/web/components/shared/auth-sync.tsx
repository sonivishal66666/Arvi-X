'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthSync() {
  const { user, isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated && user) {
      setUser(user);
    }
  }, [isAuthenticated, user, setUser]);

  return null;
}
