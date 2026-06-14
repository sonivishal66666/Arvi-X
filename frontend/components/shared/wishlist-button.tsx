'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { wishlistApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function WishlistButton({ serviceId, className = '' }: { serviceId: string; className?: string }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    wishlistApi.check(serviceId)
      .then(({ data }) => setIsWishlisted(data.isWishlisted))
      .catch(() => {});
  }, [serviceId, isAuthenticated]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { router.push('/login'); return; }
    setIsLoading(true);
    try {
      if (isWishlisted) {
        await wishlistApi.remove(serviceId);
        setIsWishlisted(false);
        toast.success('Removed from wishlist', { duration: 2000 });
      } else {
        await wishlistApi.add(serviceId);
        setIsWishlisted(true);
        toast.success('Added to wishlist!', { duration: 2000 });
      }
    } catch {
      toast.error('Something went wrong');
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`w-9 h-9 rounded-full glass flex items-center justify-center transition-all duration-300 hover:scale-110 ${className} ${isWishlisted ? 'bg-pink-500/20 border-pink-500/30' : ''}`}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-white/80'}`}
      />
    </button>
  );
}
