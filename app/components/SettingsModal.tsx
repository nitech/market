'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebaseClient';
import { firebaseErrorMessage } from '@/app/lib/firebaseErrorMessage';
import { franchiseLinesFromArray, parseFranchiseLines } from '@/lib/franchiseList';
import {
  USER_SETTINGS_COLLECTION,
  franchisesFromUserSettingsData,
} from '@/lib/firebaseUserSettings';
import {
  persistThemePreference,
  readStoredTheme,
  type ThemePreference,
} from '@/app/lib/themePreference';

type Section = 'general' | 'franchises' | 'danger';

async function readUserSettingsDoc(uid: string) {
  const ref = doc(db, USER_SETTINGS_COLLECTION, uid);
  try {
    return await getDocFromServer(ref);
  } catch {
    return await getDoc(ref);
  }
}

function IconGeneral({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconFranchises({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21m6-16.5V9a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 9V4.5M3 10.5V19a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 19v-8.25M3 10.5h18M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v4.5a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5V6a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}

function IconDanger({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function IconSignOut({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  );
}

function IconMonitor({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition',
        active
          ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600'
          : 'text-gray-600 hover:bg-gray-100/90 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-100',
      ].join(' ')}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-80">{icon}</span>
      {label}
    </button>
  );
}

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
  accountLabel: string;
};

export function SettingsModal({ open, onClose, user, accountLabel }: SettingsModalProps) {
  const [section, setSection] = useState<Section>('general');
  const [themePref, setThemePref] = useState<ThemePreference>('system');
  const [franchiseText, setFranchiseText] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setThemePref(readStoredTheme());
    setSection('general');
    setSettingsMessage(null);
  }, [open]);

  useEffect(() => {
    if (!open || !user?.uid) return;
    const uid = user.uid;
    let cancelled = false;
    (async () => {
      setSettingsLoading(true);
      setSettingsMessage(null);
      try {
        const snap = await readUserSettingsDoc(uid);
        const list = franchisesFromUserSettingsData(snap.data());
        if (!cancelled) setFranchiseText(franchiseLinesFromArray(list));
      } catch (e) {
        if (!cancelled) setSettingsMessage(firebaseErrorMessage(e));
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user?.uid]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSaveFranchises = async () => {
    if (!user) return;
    setSaving(true);
    setSettingsMessage(null);
    try {
      const franchises = parseFranchiseLines(franchiseText);
      await setDoc(
        doc(db, USER_SETTINGS_COLLECTION, user.uid),
        { franchises, updatedAt: serverTimestamp() },
        { merge: true }
      );
      const snap = await readUserSettingsDoc(user.uid);
      const list = franchisesFromUserSettingsData(snap.data());
      setFranchiseText(franchiseLinesFromArray(list));
      setSettingsMessage('Lagret i Firebase.');
    } catch (e) {
      setSettingsMessage(firebaseErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleClearFranchises = async () => {
    if (!user) return;
    if (!window.confirm('Er du sikker? Alle franchiser fjernes fra kontoen din.')) return;
    setClearing(true);
    setSettingsMessage(null);
    try {
      await setDoc(
        doc(db, USER_SETTINGS_COLLECTION, user.uid),
        { franchises: [], updatedAt: serverTimestamp() },
        { merge: true }
      );
      setFranchiseText('');
      setSettingsMessage('Alle franchiser er fjernet.');
    } catch (e) {
      setSettingsMessage(firebaseErrorMessage(e));
    } finally {
      setClearing(false);
    }
  };

  const setTheme = (t: ThemePreference) => {
    setThemePref(t);
    persistThemePreference(t);
  };

  if (!open || typeof document === 'undefined') return null;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-gray-950/45 backdrop-blur-[2px] transition-opacity dark:bg-black/60"
        aria-label="Lukk innstillinger"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="relative flex h-[min(640px,85vh)] max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 id="settings-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Innstillinger
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Lukk"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <nav className="flex min-h-0 w-[13.5rem] shrink-0 flex-col border-r border-gray-100 bg-gray-50/90 py-3 dark:border-gray-800 dark:bg-gray-950/50">
            <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2">
              <NavButton
                active={section === 'general'}
                onClick={() => setSection('general')}
                icon={<IconGeneral className="h-5 w-5" />}
                label="Generelt"
              />
              <NavButton
                active={section === 'franchises'}
                onClick={() => setSection('franchises')}
                icon={<IconFranchises className="h-5 w-5" />}
                label="Franchiser"
              />
              <NavButton
                active={section === 'danger'}
                onClick={() => setSection('danger')}
                icon={<IconDanger className="h-5 w-5 text-amber-600" />}
                label="Faresone"
              />
            </div>
            <div className="shrink-0 border-t border-gray-200/80 px-2 pt-3 dark:border-gray-800">
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-800 dark:text-gray-300 dark:hover:bg-red-950/40 dark:hover:text-red-200"
              >
                <IconSignOut className="h-5 w-5 shrink-0 opacity-80" />
                Logg ut
              </button>
            </div>
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-6">
            {section === 'general' && (
              <div>
                <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Generelt</h3>
                <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Tema</p>
                <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50/80 p-1 dark:border-gray-600 dark:bg-gray-800/80">
                  {(
                    [
                      { id: 'light' as const, label: 'Lyst', Icon: IconSun },
                      { id: 'dark' as const, label: 'Mørkt', Icon: IconMoon },
                      { id: 'system' as const, label: 'System', Icon: IconMonitor },
                    ] as const
                  ).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id)}
                      className={[
                        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
                        themePref === id
                          ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/90 dark:bg-gray-700 dark:text-white dark:ring-gray-600'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
                      ].join(' ')}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-4 max-w-md text-sm text-gray-500 dark:text-gray-400">
                  «System» følger enhetens lys/mørk-modus.
                </p>
              </div>
            )}

            {section === 'franchises' && (
              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Franchiser</h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Én franchise per linje. Brukes til franchise-eierskifte-søk (prefiks mot underenhetsnavn i
                  Brønnøysund).
                </p>
                <label htmlFor="settings-franchise-list" className="sr-only">
                  Franchiser
                </label>
                <textarea
                  id="settings-franchise-list"
                  value={franchiseText}
                  onChange={(e) => setFranchiseText(e.target.value)}
                  disabled={settingsLoading}
                  rows={12}
                  className="mb-3 w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:disabled:bg-gray-900"
                  placeholder={'F.eks. McDonald\'s\nRema 1000'}
                />
                {settingsMessage && (
                  <p className="mb-3 text-sm text-gray-700 dark:text-gray-300" role="status">
                    {settingsMessage}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSaveFranchises}
                  disabled={saving || settingsLoading}
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  {saving ? 'Lagrer…' : 'Lagre franchiser'}
                </button>
              </div>
            )}

            {section === 'danger' && (
              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">Faresone</h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Handlinger her kan ikke angres via appen.
                </p>
                <div className="rounded-xl border border-red-200 bg-red-50/80 p-5 dark:border-red-900/50 dark:bg-red-950/30">
                  <div className="mb-3 flex items-start gap-3">
                    <IconDanger className="mt-0.5 h-6 w-6 shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-200">Tøm franchiser</p>
                      <p className="mt-1 text-sm text-red-800/90 dark:text-red-300/90">
                        Fjerner hele listen som er knyttet til kontoen din i Firestore.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFranchises}
                    disabled={clearing}
                    className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-900/40"
                  >
                    {clearing ? 'Tømmer…' : 'Tøm alle franchiser'}
                  </button>
                </div>
                {settingsMessage && section === 'danger' && (
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300" role="status">
                    {settingsMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
          <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={accountLabel}>
            Innlogget som <span className="font-medium text-gray-700 dark:text-gray-300">{accountLabel}</span>
          </p>
        </footer>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
