export const THEME_STORAGE_KEY = '7markets-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

export function readStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export function isDarkForPreference(pref: ThemePreference): boolean {
  if (typeof window === 'undefined') return false;
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyThemePreference(pref: ThemePreference): void {
  if (typeof document === 'undefined') return;
  const dark = isDarkForPreference(pref);
  document.documentElement.classList.toggle('dark', dark);
}

export function persistThemePreference(pref: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, pref);
  applyThemePreference(pref);
}
