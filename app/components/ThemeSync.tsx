'use client';

import { useEffect } from 'react';
import {
  THEME_STORAGE_KEY,
  applyThemePreference,
  readStoredTheme,
  type ThemePreference,
} from '@/app/lib/themePreference';

export function ThemeSync() {
  useEffect(() => {
    applyThemePreference(readStoredTheme());

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onOsChange = () => {
      const raw = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
      const pref: ThemePreference =
        raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
      if (pref === 'system') applyThemePreference('system');
    };
    mq.addEventListener('change', onOsChange);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const v = e.newValue as ThemePreference;
        if (v === 'light' || v === 'dark' || v === 'system') applyThemePreference(v);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mq.removeEventListener('change', onOsChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return null;
}
