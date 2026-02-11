import type { CompanyWithRoles } from '@/server/types';

interface StatisticsProps {
  companies: CompanyWithRoles[];
  totalFiltered: number;
}

export function Statistics({ companies, totalFiltered }: StatisticsProps) {
  const totalCapital = companies.reduce((sum, company) => {
    return sum + (company.kapital?.belop || 0);
  }, 0);

  const avgCapital = companies.length > 0 ? totalCapital / companies.length : 0;

  const companiesWithCapital = companies.filter(c => c.kapital?.belop && c.kapital.belop > 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Totalt antall resultater</h3>
        <p className="text-3xl font-bold text-gray-800">{totalFiltered}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Gjennomsnittlig aksjekapital</h3>
        <p className="text-3xl font-bold text-gray-800">
          {new Intl.NumberFormat('no-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(avgCapital)}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Med registrert kapital</h3>
        <p className="text-3xl font-bold text-gray-800">{companiesWithCapital}</p>
      </div>
    </div>
  );
}


