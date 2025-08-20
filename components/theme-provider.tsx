'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/stores';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const initializeTheme = useThemeStore((state) => state?.initializeTheme);

  useEffect(() => {
    // Rehydrate the store first
    useThemeStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && initializeTheme) {
      const cleanup = initializeTheme();
      return cleanup;
    }
  }, [isHydrated, initializeTheme]);

  return <>{children}</>;
}
