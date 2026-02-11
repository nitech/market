import type { CompanyWithRoles } from '../types';

interface CompanyListProps {
  companies: CompanyWithRoles[];
  loading?: boolean;
  onViewDetails?: (orgnr: string) => void;
  favorites?: string[];
  onToggleFavorite?: (orgnr: string) => void;
}

export function CompanyList({ companies, loading, onViewDetails, favorites, onToggleFavorite }: CompanyListProps) {
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
        <span className="ml-4 text-gray-600">Laster bedrifter...</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600 text-lg">Ingen bedrifter funnet som matcher søkekriteriene.</p>
        <p className="text-gray-500 text-sm mt-2">Prøv å justere filtrene dine.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Favoritt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Navn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Org.nr
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Daglig leder
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksjekapital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrert
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Næringskode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Handling
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.organisasjonsnummer} className="hover:bg-gray-50">
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
                  <div className="text-sm font-medium text-gray-900">{company.navn || 'Navn ikke oppgitt'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{company.organisasjonsnummer}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate" title={getAddressString(company)}>
                    {getAddressString(company)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{getDagligLederNavn(company.dagligLeder) || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatCurrency(company.kapital?.belop)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(company.registreringsdatoEnhetsregisteret)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
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
                      className="text-blue-600 hover:text-blue-900 focus:outline-none"
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

