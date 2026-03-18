'use client';

import { useMemo, useState } from 'react';
import type { FranchiseEierskifteItem, Address } from '@/server/types';

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
    const parsedDays = Number(daysInput);
    const safeDays = Number.isFinite(parsedDays) && parsedDays > 0 ? Math.floor(parsedDays) : 7;

    setLoading(true);
    setError(null);
    setItems([]);
    setMeta(null);

    try {
      const url = `/api/franchise-eierskifte?days=${encodeURIComponent(String(safeDays))}`;
      const response = await fetch(url);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-3 text-gray-800">Franchise-eierskifte (siste dager)</h2>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Siste X dager for `datoEierskifte`
          </label>
          <input
            type="number"
            value={daysInput}
            min={1}
            step={1}
            onChange={(e) => setDaysInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {meta && meta.truncated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-900">
            Advarsel: stoppet ved 10 000 underenheter. Resultatet kan være ufullstendig.
          </p>
        </div>
      )}

      {meta && (
        <div className="text-sm text-gray-700 mb-4">
          Visning: {meta.fromDatoEierskifte} til {meta.tilDatoEierskifte}. Treff (matchende franchises): {meta.matches}.
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Laster BRREG-data...</span>
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
          Trykk “Hent treff” for å se forslag til firmaer å kontakte.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Franchise
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Underenhet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato eierskifte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hovedenhet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row) => {
                const under = row.underenhet;
                const main = row.hovedenhet;
                const address = under.forretningsadresse || under.postadresse;
                return (
                  <tr key={`${under.organisasjonsnummer}-${row.franchiseMatch}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                      {row.franchiseMatch}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900">
                        {under.navn || 'Navn ikke oppgitt'}
                      </div>
                      <button
                        onClick={() => copyToClipboard(under.organisasjonsnummer)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Kopier underenhet orgnr"
                      >
                        {copiedUnderOrgnr === under.organisasjonsnummer ? '✓ Kopiert' : under.organisasjonsnummer}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(under.datoEierskifte)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium text-gray-900">{main.navn || 'Navn ikke oppgitt'}</div>
                      <div className="text-gray-600">{main.organisasjonsnummer}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{under.telefon ? `Tlf: ${under.telefon}` : ''}</div>
                      <div>{under.epostadresse ? `Epost: ${under.epostadresse}` : ''}</div>
                      <div>
                        {under.hjemmeside ? (
                          <a
                            href={under.hjemmeside.startsWith('http') ? under.hjemmeside : `https://${under.hjemmeside}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {under.hjemmeside}
                          </a>
                        ) : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
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

