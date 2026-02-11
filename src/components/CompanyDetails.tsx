import { useState, useEffect } from 'react';
import type { Enhet } from '../types';

interface CompanyDetailsProps {
  orgnr: string;
  onClose: () => void;
}

export function CompanyDetails({ orgnr, onClose }: CompanyDetailsProps) {
  const [company, setCompany] = useState<Enhet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Lukk
          </button>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{company.navn || 'Navn ikke oppgitt'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Grunnleggende informasjon</h3>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-600">Organisasjonsnummer:</dt>
                <dd className="text-gray-800">{company.organisasjonsnummer}</dd>
              </div>
              {company.organisasjonsform && (
                <div>
                  <dt className="font-medium text-gray-600">Organisasjonsform:</dt>
                  <dd className="text-gray-800">{company.organisasjonsform.beskrivelse || company.organisasjonsform.kode}</dd>
                </div>
              )}
              {company.registreringsdatoEnhetsregisteret && (
                <div>
                  <dt className="font-medium text-gray-600">Registrert:</dt>
                  <dd className="text-gray-800">{formatDate(company.registreringsdatoEnhetsregisteret)}</dd>
                </div>
              )}
              {company.stiftelsesdato && (
                <div>
                  <dt className="font-medium text-gray-600">Stiftet:</dt>
                  <dd className="text-gray-800">{formatDate(company.stiftelsesdato)}</dd>
                </div>
              )}
              {company.antallAnsatte !== undefined && (
                <div>
                  <dt className="font-medium text-gray-600">Antall ansatte:</dt>
                  <dd className="text-gray-800">{company.antallAnsatte}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Kapital</h3>
            {company.kapital && (
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-gray-600">Beløp:</dt>
                  <dd className="text-gray-800">{formatCurrency(company.kapital.belop)}</dd>
                </div>
                {company.kapital.antallAksjer && (
                  <div>
                    <dt className="font-medium text-gray-600">Antall aksjer:</dt>
                    <dd className="text-gray-800">{company.kapital.antallAksjer.toLocaleString('no-NO')}</dd>
                  </div>
                )}
                {company.kapital.type && (
                  <div>
                    <dt className="font-medium text-gray-600">Type:</dt>
                    <dd className="text-gray-800">{company.kapital.type}</dd>
                  </div>
                )}
                {company.kapital.valuta && (
                  <div>
                    <dt className="font-medium text-gray-600">Valuta:</dt>
                    <dd className="text-gray-800">{company.kapital.valuta}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {company.forretningsadresse && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Forretningsadresse</h3>
              <dl className="space-y-2">
                {company.forretningsadresse.adresse && (
                  <div>
                    <dt className="font-medium text-gray-600">Adresse:</dt>
                    <dd className="text-gray-800">{company.forretningsadresse.adresse.join(', ')}</dd>
                  </div>
                )}
                {company.forretningsadresse.postnummer && (
                  <div>
                    <dt className="font-medium text-gray-600">Postnummer:</dt>
                    <dd className="text-gray-800">{company.forretningsadresse.postnummer}</dd>
                  </div>
                )}
                {company.forretningsadresse.poststed && (
                  <div>
                    <dt className="font-medium text-gray-600">Poststed:</dt>
                    <dd className="text-gray-800">{company.forretningsadresse.poststed}</dd>
                  </div>
                )}
                {company.forretningsadresse.kommune && (
                  <div>
                    <dt className="font-medium text-gray-600">Kommune:</dt>
                    <dd className="text-gray-800">{company.forretningsadresse.kommune}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {(company.naeringskode1 || company.naeringskode2 || company.naeringskode3) && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Næringskoder</h3>
              <dl className="space-y-2">
                {company.naeringskode1 && (
                  <div>
                    <dt className="font-medium text-gray-600">Hovednæring:</dt>
                    <dd className="text-gray-800">{company.naeringskode1.kode} - {company.naeringskode1.beskrivelse}</dd>
                  </div>
                )}
                {company.naeringskode2 && (
                  <div>
                    <dt className="font-medium text-gray-600">Næring 2:</dt>
                    <dd className="text-gray-800">{company.naeringskode2.kode} - {company.naeringskode2.beskrivelse}</dd>
                  </div>
                )}
                {company.naeringskode3 && (
                  <div>
                    <dt className="font-medium text-gray-600">Næring 3:</dt>
                    <dd className="text-gray-800">{company.naeringskode3.kode} - {company.naeringskode3.beskrivelse}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {(company.epostadresse || company.telefon || company.mobil || company.hjemmeside) && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Kontaktinformasjon</h3>
              <dl className="space-y-2">
                {company.epostadresse && (
                  <div>
                    <dt className="font-medium text-gray-600">E-post:</dt>
                    <dd className="text-gray-800">{company.epostadresse}</dd>
                  </div>
                )}
                {company.telefon && (
                  <div>
                    <dt className="font-medium text-gray-600">Telefon:</dt>
                    <dd className="text-gray-800">{company.telefon}</dd>
                  </div>
                )}
                {company.mobil && (
                  <div>
                    <dt className="font-medium text-gray-600">Mobil:</dt>
                    <dd className="text-gray-800">{company.mobil}</dd>
                  </div>
                )}
                {company.hjemmeside && (
                  <div>
                    <dt className="font-medium text-gray-600">Hjemmeside:</dt>
                    <dd className="text-gray-800">
                      <a href={`https://${company.hjemmeside}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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

