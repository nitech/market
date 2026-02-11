import type { CompanyWithRoles } from '../types';

interface CompanyCardProps {
  company: CompanyWithRoles;
  onViewDetails?: (orgnr: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (orgnr: string) => void;
}

export function CompanyCard({ company, onViewDetails, isFavorite, onToggleFavorite }: CompanyCardProps) {
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
    // Handle object with navn property
    if (leder.navn && typeof leder.navn === 'string') {
      return leder.navn;
    }
    // Handle Person object with fornavn/etternavn
    if (leder.fornavn || leder.etternavn) {
      const nameParts = [leder.fornavn, leder.mellomnavn, leder.etternavn].filter(Boolean);
      return nameParts.length > 0 ? nameParts.join(' ') : null;
    }
    return null;
  };

  const address = company.forretningsadresse || company.postadresse;
  const addressString = address
    ? [
        address.adresse?.join(', '),
        address.postnummer,
        address.poststed,
      ]
      .filter(Boolean)
      .join(', ')
    : 'Ikke oppgitt';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800">
              {company.navn || 'Navn ikke oppgitt'}
            </h3>
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(company.organisasjonsnummer)}
                className="text-yellow-500 hover:text-yellow-600 focus:outline-none"
                title={isFavorite ? 'Fjern fra favoritter' : 'Legg til favoritter'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">
            Org.nr: {company.organisasjonsnummer}
          </p>
        </div>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(company.organisasjonsnummer)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Detaljer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Adresse:</span> {addressString}
          </p>
          {(() => {
            const dagligLederNavn = getDagligLederNavn(company.dagligLeder);
            return dagligLederNavn ? (
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Daglig leder:</span> {dagligLederNavn}
              </p>
            ) : null;
          })()}
          {company.organisasjonsform && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Organisasjonsform:</span> {company.organisasjonsform.beskrivelse || company.organisasjonsform.kode}
            </p>
          )}
        </div>

        <div>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Aksjekapital:</span> {formatCurrency(company.kapital?.belop)}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Registrert:</span> {formatDate(company.registreringsdatoEnhetsregisteret)}
          </p>
          {company.stiftelsesdato && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Stiftet:</span> {formatDate(company.stiftelsesdato)}
            </p>
          )}
          {company.naeringskode1 && (
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Næringskode:</span> {company.naeringskode1.kode} - {company.naeringskode1.beskrivelse}
            </p>
          )}
        </div>
      </div>

      {company.antallAnsatte !== undefined && (
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-medium">Ansatte:</span> {company.antallAnsatte}
        </p>
      )}
    </div>
  );
}

