'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useAuth } from './AuthProvider';
import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user } = useAuth();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={user?.settings.theme || 'system'}
      enableSystem
      disableTransitionOnChange
    >
      <ThemeSyncWrapper />
      {children}
    </NextThemesProvider>
  );
}

function ThemeSyncWrapper() {
  const { theme } = useTheme();
  const { user, updateSettings } = useAuth();
  const previousTheme = useRef(theme);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousTheme.current = theme;
      return;
    }

    // Don't sync if theme hasn't changed or if no user
    if (previousTheme.current === theme || !user) return;

    // Only update Firebase if theme actually changed (user action)
    if (theme && theme !== user.settings.theme) {
      updateSettings({ theme: theme as 'light' | 'dark' | 'system' });
    }

    previousTheme.current = theme;
  }, [theme, user, updateSettings]);

  return null;
}
