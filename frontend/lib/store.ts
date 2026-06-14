import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
  image?: string;
  phone?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

interface BookingState {
  selectedSeats: string[];
  currentBooking: any;
  setSelectedSeats: (seats: string[]) => void;
  addSeat: (seat: string) => void;
  removeSeat: (seat: string) => void;
  clearSeats: () => void;
  setCurrentBooking: (booking: any) => void;
  clearCurrentBooking: () => void;
}

interface UiState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isAIChatOpen: boolean;
  isAuthTransitioning: boolean;
  authTransitionType: 'signin' | 'signout' | null;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setAIChatOpen: (open: boolean) => void;
  setAuthTransition: (transitioning: boolean, type?: 'signin' | 'signout' | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'arvis-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // On rehydration, sync isAuthenticated with localStorage token presence
        if (state && !state.isAuthenticated && localStorage.getItem('accessToken')) {
          state.setUser(state.user);
        }
      },
    },
  ),
);

export const useBookingStore = create<BookingState>((set) => ({
  selectedSeats: [],
  currentBooking: null,
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  addSeat: (seat) => set((state) => ({ selectedSeats: [...state.selectedSeats, seat] })),
  removeSeat: (seat) => set((state) => ({ selectedSeats: state.selectedSeats.filter((s) => s !== seat) })),
  clearSeats: () => set({ selectedSeats: [] }),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  clearCurrentBooking: () => set({ currentBooking: null, selectedSeats: [] }),
}));

export const useUiStore = create<UiState>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isAIChatOpen: false,
  isAuthTransitioning: false,
  authTransitionType: null,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setAIChatOpen: (open) => set({ isAIChatOpen: open }),
  setAuthTransition: (transitioning, type = null) => set({ isAuthTransitioning: transitioning, authTransitionType: type }),
}));
