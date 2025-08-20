'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  type: 'regular' | 'guest';
}

interface SessionState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),
      
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      clearSession: () => 
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        }),
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
