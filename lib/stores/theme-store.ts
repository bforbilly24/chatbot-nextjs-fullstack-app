'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isLoading: boolean;
  
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',
      isLoading: true,
      
      setTheme: (theme) => {
        set({ theme });
        
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.toggle('dark', systemTheme === 'dark');
            set({ resolvedTheme: systemTheme });
          } else {
            root.classList.toggle('dark', theme === 'dark');
            set({ resolvedTheme: theme });
          }
        }
      },
      
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      initializeTheme: () => {
        if (typeof window !== 'undefined') {
          const { theme } = get();
          const root = window.document.documentElement;
          
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.toggle('dark', systemTheme === 'dark');
            set({ resolvedTheme: systemTheme, isLoading: false });
          } else {
            root.classList.toggle('dark', theme === 'dark');
            set({ resolvedTheme: theme, isLoading: false });
          }
          
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            const { theme } = get();
            if (theme === 'system') {
              const systemTheme = mediaQuery.matches ? 'dark' : 'light';
              root.classList.toggle('dark', systemTheme === 'dark');
              set({ resolvedTheme: systemTheme });
            }
          };
          
          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
          set({ isLoading: false });
          return () => {}; // Return empty cleanup function for server-side
        }
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
      skipHydration: true, 
    }
  )
);
