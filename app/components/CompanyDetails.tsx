import { useState, useEffect } from 'react';
import type { Enhet } from '@/server/types';

interface CompanyDetailsProps {
  orgnr: string;
  onClose: () => void;
}

export function CompanyDetails({ orgnr, onClose }: CompanyDetailsProps) {
  const [company, setCompany] = useState<Enhet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(orgnr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/companies/${orgnr}`);
        if (!response.ok) {
          throw new Error('Kunne ikke hente bedriftsdetaljer');
        }
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ukjent feil');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orgnr]);

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
        <div className="mx-4 w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
        <div className="mx-4 w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Lukk
          </button>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{company.navn || 'Navn ikke oppgitt'}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Grunnleggende informasjon</h3>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-600 dark:text-gray-400">Organisasjonsnummer:</dt>
                <dd className="text-gray-800 dark:text-gray-200">
                  <button
                    onClick={copyToClipboard}
                    className="cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    title={copied ? 'Kopiert!' : 'Klikk for å kopiere'}
                  >
                    {copied ? '✓ Kopiert' : company.organisasjonsnummer}
                  </button>
                </dd>
              </div>
              {company.organisasjonsform && (
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Organisasjonsform:</dt>
                  <dd className="text-gray-800 dark:text-gray-200">{company.organisasjonsform.beskrivelse || company.organisasjonsform.kode}</dd>
                </div>
              )}
              {company.registreringsdatoEnhetsregisteret && (
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Registrert:</dt>
                  <dd className="text-gray-800 dark:text-gray-200">{formatDate(company.registreringsdatoEnhetsregisteret)}</dd>
                </div>
              )}
              {company.stiftelsesdato && (
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Stiftet:</dt>
                  <dd className="text-gray-800 dark:text-gray-200">{formatDate(company.stiftelsesdato)}</dd>
                </div>
              )}
              {company.antallAnsatte !== undefined && (
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Antall ansatte:</dt>
                  <dd className="text-gray-800 dark:text-gray-200">{company.antallAnsatte}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Kapital</h3>
            {company.kapital && (
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Beløp:</dt>
                  <dd className="text-gray-800 dark:text-gray-200">{formatCurrency(company.kapital.belop)}</dd>
                </div>
                {company.kapital.antallAksjer && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Antall aksjer:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.kapital.antallAksjer.toLocaleString('no-NO')}</dd>
                  </div>
                )}
                {company.kapital.type && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Type:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.kapital.type}</dd>
                  </div>
                )}
                {company.kapital.valuta && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Valuta:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.kapital.valuta}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {company.forretningsadresse && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Forretningsadresse</h3>
              <dl className="space-y-2">
                {company.forretningsadresse.adresse && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Adresse:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.forretningsadresse.adresse.join(', ')}</dd>
                  </div>
                )}
                {company.forretningsadresse.postnummer && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Postnummer:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.forretningsadresse.postnummer}</dd>
                  </div>
                )}
                {company.forretningsadresse.poststed && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Poststed:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.forretningsadresse.poststed}</dd>
                  </div>
                )}
                {company.forretningsadresse.kommune && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Kommune:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.forretningsadresse.kommune}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {(company.naeringskode1 || company.naeringskode2 || company.naeringskode3) && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Næringskoder</h3>
              <dl className="space-y-2">
                {company.naeringskode1 && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Hovednæring:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.naeringskode1.kode} - {company.naeringskode1.beskrivelse}</dd>
                  </div>
                )}
                {company.naeringskode2 && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Næring 2:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.naeringskode2.kode} - {company.naeringskode2.beskrivelse}</dd>
                  </div>
                )}
                {company.naeringskode3 && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Næring 3:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.naeringskode3.kode} - {company.naeringskode3.beskrivelse}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {(company.epostadresse || company.telefon || company.mobil || company.hjemmeside) && (
            <div>
              <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Kontaktinformasjon</h3>
              <dl className="space-y-2">
                {company.epostadresse && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">E-post:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.epostadresse}</dd>
                  </div>
                )}
                {company.telefon && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Telefon:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.telefon}</dd>
                  </div>
                )}
                {company.mobil && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Mobil:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">{company.mobil}</dd>
                  </div>
                )}
                {company.hjemmeside && (
                  <div>
                    <dt className="font-medium text-gray-600 dark:text-gray-400">Hjemmeside:</dt>
                    <dd className="text-gray-800 dark:text-gray-200">
                      <a href={`https://${company.hjemmeside}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                        {company.hjemmeside}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

