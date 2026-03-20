import { useMemo, useState } from 'react';
import type { CompanyWithRoles } from '@/server/types';

interface CompanyListProps {
  companies: CompanyWithRoles[];
  loading?: boolean;
  onViewDetails?: (orgnr: string) => void;
  favorites?: string[];
  onToggleFavorite?: (orgnr: string) => void;
}

export function CompanyList({ companies, loading, onViewDetails, favorites, onToggleFavorite }: CompanyListProps) {
  const [copiedOrgnr, setCopiedOrgnr] = useState<string | null>(null);

  const dedupedCompanies = useMemo<CompanyWithRoles[]>(() => {
    // React requires unique keys. Dedupe defensively in case the data source returns duplicates.
    const seen = new Set<string>();
    const result: CompanyWithRoles[] = [];

    for (const company of companies) {
      const id = company.organisasjonsnummer;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push(company);
    }

    return result;
  }, [companies]);

  const copyToClipboard = async (orgnr: string) => {
    try {
      await navigator.clipboard.writeText(orgnr);
      setCopiedOrgnr(orgnr);
      setTimeout(() => setCopiedOrgnr(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Ikke oppgitt';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Ikke oppgitt';
    try {
      // Handle ISO date strings (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
      const dateStr = date.split('T')[0]; // Get just the date part
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
      }
      // Fallback to Date parsing
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Ikke oppgitt';
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();
      return `${dayStr}.${monthStr}.${yearStr}`;
    } catch (e) {
      return 'Ikke oppgitt';
    }
  };

  const getDagligLederNavn = (leder: any): string | null => {
    if (!leder) return null;
    if (leder.navn && typeof leder.navn === 'string') {
      return leder.navn;
    }
    if (leder.fornavn || leder.etternavn) {
      const nameParts = [leder.fornavn, leder.mellomnavn, leder.etternavn].filter(Boolean);
      return nameParts.length > 0 ? nameParts.join(' ') : null;
    }
    return null;
  };

  const getAddressString = (company: CompanyWithRoles): string => {
    const address = company.forretningsadresse || company.postadresse;
    if (!address) return 'Ikke oppgitt';
    return [
      address.adresse?.join(', '),
      address.postnummer,
      address.poststed,
    ]
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">Laster bedrifter...</span>
      </div>
    );
  }

  if (dedupedCompanies.length === 0) {
    return (
      <div className="rounded-lg border border-transparent bg-white p-12 text-center shadow-md dark:border-gray-800 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-400">Ingen bedrifter funnet som matcher søkekriteriene.</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Prøv å justere filtrene dine.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-transparent bg-white shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="w-full overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Favoritt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Navn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Org.nr
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Daglig leder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Aksjekapital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Registrert
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Næringskode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Handling
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {dedupedCompanies.map((company) => (
              <tr key={company.organisasjonsnummer} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                <td className="px-6 py-4 whitespace-nowrap">
                  {onToggleFavorite && (
                    <button
                      onClick={() => onToggleFavorite(company.organisasjonsnummer)}
                      className="text-yellow-500 hover:text-yellow-600 focus:outline-none text-lg"
                      title={favorites?.includes(company.organisasjonsnummer) ? 'Fjern fra favoritter' : 'Legg til favoritter'}
                    >
                      {favorites?.includes(company.organisasjonsnummer) ? '★' : '☆'}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{company.navn || 'Navn ikke oppgitt'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => copyToClipboard(company.organisasjonsnummer)}
                    className="cursor-pointer text-sm text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title={copiedOrgnr === company.organisasjonsnummer ? 'Kopiert!' : 'Klikk for å kopiere'}
                  >
                    {copiedOrgnr === company.organisasjonsnummer ? '✓ Kopiert' : company.organisasjonsnummer}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400" title={getAddressString(company)}>
                    {getAddressString(company)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{getDagligLederNavn(company.dagligLeder) || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(company.kapital?.belop)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(company.registreringsdatoEnhetsregisteret)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {company.naeringskode1?.kode && (
                      <span title={company.naeringskode1.beskrivelse}>
                        {company.naeringskode1.kode}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(company.organisasjonsnummer)}
                      className="text-blue-600 hover:text-blue-800 focus:outline-none dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Detaljer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

