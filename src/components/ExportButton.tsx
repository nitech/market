import type { CompanyWithRoles } from '../types';

interface ExportButtonProps {
  companies: CompanyWithRoles[];
}

export function ExportButton({ companies }: ExportButtonProps) {
  const exportToCSV = () => {
    if (companies.length === 0) return;

    const headers = [
      'Organisasjonsnummer',
      'Navn',
      'Organisasjonsform',
      'Aksjekapital',
      'Registreringsdato',
      'Stiftelsesdato',
      'Adresse',
      'Postnummer',
      'Poststed',
      'Kommune',
      'Daglig leder',
      'Næringskode',
      'Antall ansatte',
      'E-post',
      'Telefon',
      'Hjemmeside',
    ];

    const rows = companies.map(company => {
      const address = company.forretningsadresse || company.postadresse;
      return [
        company.organisasjonsnummer,
        company.navn || '',
        company.organisasjonsform?.beskrivelse || company.organisasjonsform?.kode || '',
        company.kapital?.belop?.toString() || '',
        company.registreringsdatoEnhetsregisteret || '',
        company.stiftelsesdato || '',
        address?.adresse?.join(', ') || '',
        address?.postnummer || '',
        address?.poststed || '',
        address?.kommune || '',
        company.dagligLeder?.navn || '',
        company.naeringskode1?.beskrivelse || '',
        company.antallAnsatte?.toString() || '',
        company.epostadresse || '',
        company.telefon || '',
        company.hjemmeside || '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bedrifter_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (companies.length === 0) return;

    const jsonContent = JSON.stringify(companies, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bedrifter_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (companies.length === 0) return null;

  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={exportToCSV}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Eksporter CSV
      </button>
      <button
        onClick={exportToJSON}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Eksporter JSON
      </button>
    </div>
  );
}


