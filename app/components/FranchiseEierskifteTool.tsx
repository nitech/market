'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { useAuth } from '@/app/hooks/useAuth';
import { db } from '@/app/lib/firebaseClient';
import { firebaseErrorMessage } from '@/app/lib/firebaseErrorMessage';
import type { FranchiseEierskifteItem, Address } from '@/server/types';
import {
  USER_SETTINGS_COLLECTION,
  franchisesFromUserSettingsData,
} from '@/lib/firebaseUserSettings';

const Icons = {
  loader: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" x2="12" y1="9" y2="13"/>
      <line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="16" y2="12"/>
      <line x1="12" x2="12.01" y1="8" y2="8"/>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
    </svg>
  ),
  mapPin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  external: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" x2="21" y1="14" y2="3"/>
    </svg>
  ),
  login: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" x2="3" y1="12" y2="12"/>
    </svg>
  ),
  store: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v18"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  globe: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" x2="22" y1="12" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
};

async function readFranchisesForUser(uid: string): Promise<string[]> {
  const ref = doc(db, USER_SETTINGS_COLLECTION, uid);
  let serverErr: unknown;
  try {
    const snap = await getDocFromServer(ref);
    return franchisesFromUserSettingsData(snap.data());
  } catch (e) {
    serverErr = e;
  }
  try {
    const snap = await getDoc(ref);
    return franchisesFromUserSettingsData(snap.data());
  } catch {
    throw serverErr;
  }
}

function formatDate(date?: string) {
  if (!date) return '-';
  try {
    const dateStr = date.split('T')[0];
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    }
  } catch {
    // ignore
  }
  return '-';
}

function getAddressString(address?: Address) {
  if (!address) return '-';
  return [
    address.adresse?.join(', '),
    address.postnummer,
    address.poststed,
  ]
    .filter(Boolean)
    .join(', ');
}

export function FranchiseEierskifteTool() {
  const { user, loading: authLoading } = useAuth();
  const [daysInput, setDaysInput] = useState<string>('7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<FranchiseEierskifteItem[]>([]);
  const [meta, setMeta] = useState<{
    safeDays: number;
    fromDatoEierskifte: string;
    tilDatoEierskifte: string;
    fetchedUnderenheter: number;
    matches: number;
    truncated: boolean;
    franchiseCount?: number;
  } | null>(null);

  const [copiedUnderOrgnr, setCopiedUnderOrgnr] = useState<string | null>(null);

  const rows = useMemo(() => items, [items]);

  const copyToClipboard = async (orgnr: string) => {
    try {
      await navigator.clipboard.writeText(orgnr);
      setCopiedUnderOrgnr(orgnr);
      setTimeout(() => setCopiedUnderOrgnr(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const fetchTreff = async () => {
    if (!user) {
      setError('Du må være innlogget for å hente franchise-treff.');
      return;
    }

    const parsedDays = Number(daysInput);
    const safeDays = Number.isFinite(parsedDays) && parsedDays > 0 ? Math.floor(parsedDays) : 7;

    setLoading(true);
    setError(null);
    setItems([]);
    setMeta(null);

    try {
      let franchises: string[];
      try {
        franchises = await readFranchisesForUser(user.uid);
      } catch (e) {
        throw new Error(
          `Kunne ikke lese franchiser fra Firebase: ${firebaseErrorMessage(e)}. Sjekk Firestore-regler og at du er innlogget.`
        );
      }
      if (franchises.length === 0) {
        setError(
          'Ingen franchiser funnet i Firebase. Åpne innstillinger (tannhjulet øverst til høyre), gå til «Franchiser», lim inn listen (én per linje), og trykk «Lagre franchiser».'
        );
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/franchise-eierskifte', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: safeDays, franchises }),
      });
      if (!response.ok) {
        try {
          const body = await response.json();
          if (body?.error) {
            throw new Error(String(body.error));
          }
        } catch {
          // Ignore JSON parse errors and fall back to status.
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setItems(data.items ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className="rounded-xl p-8 flex items-center justify-center"
        style={{
          background: 'var(--gs-bg-card)',
          border: '1px solid var(--gs-border-default)',
        }}
      >
        <div style={{ color: 'var(--gs-accent-lime)' }}>{Icons.loader}</div>
        <span className="ml-3 text-sm" style={{ color: 'var(--gs-text-secondary)' }}>Laster bruker...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="rounded-xl p-8"
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div className="flex items-start gap-4">
          <div style={{ color: 'var(--gs-warning)' }}>{Icons.warning}</div>
          <div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--gs-text-primary)' }}>
              Innlogging påkrevd
            </h2>
            <p className="mb-4 text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
              Logg inn for å bruke franchise-eierskifte verktøyet. Franchiser lagres under innstillinger.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: 'var(--gs-accent-lime)',
                color: 'var(--gs-bg-primary)',
              }}
            >
              {Icons.login}
              Gå til innlogging
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--gs-bg-card)',
        border: '1px solid var(--gs-border-default)',
      }}
    >
      {/* Header */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--gs-border-default)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(163, 230, 53, 0.1)' }}
          >
            <span style={{ color: 'var(--gs-accent-lime)' }}>{Icons.store}</span>
          </div>
          <h2
            className="text-lg font-semibold"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: 'var(--gs-text-primary)',
            }}
          >
            Franchise-eierskifte
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
          Sjekk nylige eierskifter i dine franchisekjeder. Listen over franchiser kommer fra{' '}
          <span style={{ color: 'var(--gs-text-secondary)' }}>innstillingene dine</span>.
        </p>
      </div>

      {/* Controls */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--gs-border-default)' }}>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--gs-text-secondary)' }}>
              Siste X dager for eierskifte
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                {Icons.calendar}
              </span>
              <input
                type="number"
                value={daysInput}
                min={1}
                step={1}
                onChange={(e) => setDaysInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: 'var(--gs-bg-tertiary)',
                  border: '1px solid var(--gs-border-default)',
                  color: 'var(--gs-text-primary)',
                }}
              />
            </div>
          </div>

          <button
            onClick={fetchTreff}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: loading ? 'var(--gs-bg-tertiary)' : 'var(--gs-accent-lime)',
              color: loading ? 'var(--gs-text-tertiary)' : 'var(--gs-bg-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                {Icons.loader}
                Henter...
              </>
            ) : (
              <>
                {Icons.search}
                Hent treff
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mx-5 mt-4 rounded-lg p-4 flex items-start gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <div style={{ color: 'var(--gs-accent-red)' }}>{Icons.warning}</div>
          <p className="text-sm" style={{ color: 'var(--gs-accent-red)' }}>{error}</p>
        </div>
      )}

      {/* Warning */}
      {meta && meta.truncated && (
        <div
          className="mx-5 mt-4 rounded-lg p-4 flex items-start gap-3"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div style={{ color: 'var(--gs-warning)' }}>{Icons.info}</div>
          <p className="text-sm" style={{ color: 'var(--gs-warning)' }}>
            Advarsel: stoppet ved 10 000 underenheter. Resultatet kan være ufullstendig.
          </p>
        </div>
      )}

      {/* Meta info */}
      {meta && (
        <div className="px-5 py-3 text-sm" style={{ color: 'var(--gs-text-tertiary)', borderBottom: rows.length > 0 ? '1px solid var(--gs-border-default)' : 'none' }}>
          <span style={{ color: 'var(--gs-text-secondary)' }}>{meta.fromDatoEierskifte}</span>
          {' → '}
          <span style={{ color: 'var(--gs-text-secondary)' }}>{meta.tilDatoEierskifte}</span>
          <span className="mx-2">•</span>
          {meta.franchiseCount ?? '—'} franchiser
          <span className="mx-2">•</span>
          <span style={{ color: 'var(--gs-accent-lime)' }}>{meta.matches} treff</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div style={{ color: 'var(--gs-accent-lime)' }}>{Icons.loader}</div>
          <span className="ml-3 text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
            Laster BRREG-data...
          </span>
        </div>
      )}

      {/* Empty state */}
      {!loading && rows.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div style={{ color: 'var(--gs-text-tertiary)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" x2="12" y1="22.08" y2="12"/>
            </svg>
          </div>
          <p className="mt-4 text-base font-medium" style={{ color: 'var(--gs-text-secondary)' }}>
            Ingen data å vise
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
            Trykk "Hent treff" for å se forslag til firmaer å kontakte
          </p>
        </div>
      )}

      {/* Results Table */}
      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--gs-bg-tertiary)' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gs-text-tertiary)' }}>
                  Franchise
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gs-text-tertiary)' }}>
                  Underenhet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gs-text-tertiary)' }}>
                  Dato eierskifte
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gs-text-tertiary)' }}>
                  Hovedenhet
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gs-text-tertiary)' }}>
                  Kontakt
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gs-text-tertiary)' }}>
                  Adresse
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--gs-border-default)' }}>
              {rows.map((row) => {
                const under = row.underenhet;
                const main = row.hovedenhet;
                const address = under.forretningsadresse || under.postadresse;
                return (
                  <tr
                    key={`${under.organisasjonsnummer}-${row.franchiseMatch}`}
                    className="transition-colors duration-150"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--gs-bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                        style={{
                          background: 'rgba(163, 230, 53, 0.15)',
                          color: 'var(--gs-accent-lime)',
                        }}
                      >
                        {row.franchiseMatch}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                        {under.navn || 'Navn ikke oppgitt'}
                      </p>
                      <button
                        onClick={() => copyToClipboard(under.organisasjonsnummer)}
                        className="flex items-center gap-1.5 text-xs transition-colors duration-150 mt-1"
                        style={{ color: copiedUnderOrgnr === under.organisasjonsnummer ? 'var(--gs-accent-green)' : 'var(--gs-text-tertiary)' }}
                      >
                        <span className="font-mono">{under.organisasjonsnummer}</span>
                        {copiedUnderOrgnr === under.organisasjonsnummer ? Icons.check : Icons.copy}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                      {formatDate(under.datoEierskifte)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                        {main.navn || 'Navn ikke oppgitt'}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--gs-text-tertiary)' }}>
                        {main.organisasjonsnummer}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {under.telefon && (
                          <a
                            href={`tel:${under.telefon}`}
                            className="flex items-center gap-1.5 text-xs transition-colors duration-150 hover:opacity-80"
                            style={{ color: 'var(--gs-text-secondary)' }}
                          >
                            {Icons.phone}
                            {under.telefon}
                          </a>
                        )}
                        {under.epostadresse && (
                          <a
                            href={`mailto:${under.epostadresse}`}
                            className="flex items-center gap-1.5 text-xs transition-colors duration-150 hover:opacity-80"
                            style={{ color: 'var(--gs-text-secondary)' }}
                          >
                            {Icons.mail}
                            <span className="truncate max-w-[150px]">{under.epostadresse}</span>
                          </a>
                        )}
                        {under.hjemmeside && (
                          <a
                            href={under.hjemmeside.startsWith('http') ? under.hjemmeside : `https://${under.hjemmeside}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs transition-colors duration-150 hover:opacity-80 group"
                            style={{ color: 'var(--gs-accent-lime)' }}
                          >
                            {Icons.globe}
                            <span className="truncate max-w-[120px]">{under.hjemmeside}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {Icons.external}
                            </span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1.5 text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                        <span style={{ color: 'var(--gs-text-tertiary)' }}>{Icons.mapPin}</span>
                        <span className="max-w-[200px]">{getAddressString(address)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
