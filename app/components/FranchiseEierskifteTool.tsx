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
  if (!date) return 'Ikke oppgitt';
  try {
    const dateStr = date.split('T')[0];
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    }
  } catch {
    // ignore
  }
  return 'Ikke oppgitt';
}

function getAddressString(address?: Address) {
  if (!address) return 'Ikke oppgitt';
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
  // Use string so the user can fully clear the input (type=number with Number('') becomes 0).
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
        // Try to surface server error message (route returns { error: string } on failure).
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
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:border dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Laster bruker…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-md dark:border-amber-900/40 dark:bg-amber-950/30">
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-amber-100">Franchise-eierskifte</h2>
        <p className="mb-3 text-gray-800 dark:text-amber-50/90">
          Logg inn for å bruke verktøyet. Franchiser lagres under innstillinger (tannhjul).
        </p>
        <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          Gå til innlogging
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-transparent bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">Franchise-eierskifte (siste dager)</h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Listen over franchiser kommer fra{' '}
        <span className="font-medium text-gray-800 dark:text-gray-200">innstillingene dine</span> (tannhjul →
        Franchiser).
      </p>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div className="flex-1 min-w-[220px]">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Siste X dager for `datoEierskifte`
          </label>
          <input
            type="number"
            value={daysInput}
            min={1}
            step={1}
            onChange={(e) => setDaysInput(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>

        <button
          onClick={fetchTreff}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Henter...' : 'Hent treff'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {meta && meta.truncated && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/40 dark:bg-yellow-950/30">
          <p className="text-yellow-900 dark:text-yellow-100">
            Advarsel: stoppet ved 10 000 underenheter. Resultatet kan være ufullstendig.
          </p>
        </div>
      )}

      {meta && (
        <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          Visning: {meta.fromDatoEierskifte} til {meta.tilDatoEierskifte}. Konfigurerte franchiser:{' '}
          {meta.franchiseCount ?? '—'}. Treff: {meta.matches}.
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Laster BRREG-data...</span>
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
          Trykk “Hent treff” for å se forslag til firmaer å kontakte.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Franchise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Underenhet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Dato eierskifte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Hovedenhet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Kontakt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Adresse
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {rows.map((row) => {
                const under = row.underenhet;
                const main = row.hovedenhet;
                const address = under.forretningsadresse || under.postadresse;
                return (
                  <tr key={`${under.organisasjonsnummer}-${row.franchiseMatch}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {row.franchiseMatch}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {under.navn || 'Navn ikke oppgitt'}
                      </div>
                      <button
                        onClick={() => copyToClipboard(under.organisasjonsnummer)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Kopier underenhet orgnr"
                      >
                        {copiedUnderOrgnr === under.organisasjonsnummer ? '✓ Kopiert' : under.organisasjonsnummer}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(under.datoEierskifte)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{main.navn || 'Navn ikke oppgitt'}</div>
                      <div className="text-gray-600 dark:text-gray-400">{main.organisasjonsnummer}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div>{under.telefon ? `Tlf: ${under.telefon}` : ''}</div>
                      <div>{under.epostadresse ? `Epost: ${under.epostadresse}` : ''}</div>
                      <div>
                        {under.hjemmeside ? (
                          <a
                            href={under.hjemmeside.startsWith('http') ? under.hjemmeside : `https://${under.hjemmeside}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {under.hjemmeside}
                          </a>
                        ) : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {getAddressString(address)}
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

