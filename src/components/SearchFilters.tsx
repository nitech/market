import { useState, FormEvent } from 'react';
import type { SearchFilters } from '../types';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const ORGANISASJONSFORMER = [
  { value: 'AS', label: 'Aksjeselskap (AS)' },
  { value: 'ASA', label: 'Allmennaksjeselskap (ASA)' },
  { value: 'BA', label: 'Ansvarlig selskap (BA)' },
  { value: 'SA', label: 'Samvirkeforetak (SA)' },
  { value: 'SF', label: 'Statsforetak (SF)' },
  { value: 'STI', label: 'Stiftelse (STI)' },
  { value: 'FKF', label: 'Fylkeskommunalt foretak (FKF)' },
  { value: 'KSA', label: 'Kommunalt selskap (KSA)' },
];

export function SearchFiltersComponent({ onSearch, loading }: SearchFiltersProps) {
  // Set default date to 30 days ago
  const getDefaultDates = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      fra: thirtyDaysAgo.toISOString().split('T')[0],
      til: today.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();
  
  // Convert ISO date (YYYY-MM-DD) to Norwegian format (dd.mm.yyyy)
  const isoToNorwegian = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };
  
  // Convert Norwegian format (dd.mm.yyyy) to ISO (YYYY-MM-DD)
  const norwegianToIso = (norDate: string): string => {
    if (!norDate) return '';
    const [day, month, year] = norDate.split('.');
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  };

  const [minAksjekapital, setMinAksjekapital] = useState<string>('50000');
  const [fraDato, setFraDato] = useState(isoToNorwegian(defaultDates.fra));
  const [tilDato, setTilDato] = useState(isoToNorwegian(defaultDates.til));
  const [organisasjonsform, setOrganisasjonsform] = useState<string[]>(['AS']);
  const [navn, setNavn] = useState('');
  
  // Alle tilgjengelige næringskoder
  const alleNaeringskoder = [
    { code: '47', label: '47.xx – Butikkhandel' },
    { code: '56', label: '56.xx – Servering' },
    { code: '96', label: '96.xx – Personlige tjenester' },
    { code: '43', label: '43.xx – Håndverk/bygg' },
    { code: '62', label: '62.xx – IT/konsulent' },
    { code: '64', label: '64.xx – Finans/holding' },
    { code: '70.10', label: '70.10 – Hovedkontor' },
    { code: '68.20', label: '68.20 – Eiendom/utleie' },
    { code: '46', label: '46.xx – Engros uten ansatte' },
  ];

  // Standardverdier for næringskoder
  const [inkluderNaeringskoder, setInkluderNaeringskoder] = useState<string[]>([
    '47', '56', '96', '43', '62'
  ]);
  const [ekskluderNaeringskoder, setEkskluderNaeringskoder] = useState<string[]>([
    '64', '70.10', '68.20', '46'
  ]);

  // Finn næringskoder som ikke er i noen av listene
  const tilgjengeligeNaeringskoder = alleNaeringskoder.filter(
    nk => !inkluderNaeringskoder.includes(nk.code) && !ekskluderNaeringskoder.includes(nk.code)
  );

  const moveToInkluder = (code: string) => {
    setEkskluderNaeringskoder(prev => prev.filter(c => c !== code));
    setInkluderNaeringskoder(prev => [...prev, code]);
  };

  const moveToEkskluder = (code: string) => {
    setInkluderNaeringskoder(prev => prev.filter(c => c !== code));
    setEkskluderNaeringskoder(prev => [...prev, code]);
  };

  const moveToAvailable = (code: string, fromList: 'inkluder' | 'ekskluder') => {
    if (fromList === 'inkluder') {
      setInkluderNaeringskoder(prev => prev.filter(c => c !== code));
    } else {
      setEkskluderNaeringskoder(prev => prev.filter(c => c !== code));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Convert string to number, use default 50000 if empty or invalid
    const minAksjekapitalNum = minAksjekapital.trim() === '' 
      ? 50000 
      : Number(minAksjekapital) || 50000;
    
    onSearch({
      minAksjekapital: minAksjekapitalNum,
      fraRegistreringsdato: fraDato ? norwegianToIso(fraDato) : undefined,
      tilRegistreringsdato: tilDato ? norwegianToIso(tilDato) : undefined,
      organisasjonsform: organisasjonsform.length > 0 ? organisasjonsform : undefined,
      navn: navn || undefined,
      // Always send næringskoder arrays, even if empty (backend will handle it)
      inkluderNaeringskoder: inkluderNaeringskoder.length > 0 ? inkluderNaeringskoder : [],
      ekskluderNaeringskoder: ekskluderNaeringskoder.length > 0 ? ekskluderNaeringskoder : [],
      page: 0,
      size: 100,
    });
  };

  const handleOrganisasjonsformChange = (value: string) => {
    setOrganisasjonsform(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Søkefiltre</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="minAksjekapital" className="block text-sm font-medium text-gray-700 mb-1">
              Minimums aksjekapital (kr)
            </label>
            <input
              type="number"
              id="minAksjekapital"
              value={minAksjekapital}
              onChange={(e) => setMinAksjekapital(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
              placeholder="50000"
            />
          </div>

          <div>
            <label htmlFor="navn" className="block text-sm font-medium text-gray-700 mb-1">
              Bedriftsnavn (valgfritt)
            </label>
            <input
              type="text"
              id="navn"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Søk på navn..."
            />
          </div>

          <div>
            <label htmlFor="fraDato" className="block text-sm font-medium text-gray-700 mb-1">
              Fra registreringsdato
            </label>
            <input
              type="text"
              id="fraDato"
              value={fraDato}
              onChange={(e) => setFraDato(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="dd.mm.yyyy"
              pattern="\d{2}\.\d{2}\.\d{4}"
            />
          </div>

          <div>
            <label htmlFor="tilDato" className="block text-sm font-medium text-gray-700 mb-1">
              Til registreringsdato
            </label>
            <input
              type="text"
              id="tilDato"
              value={tilDato}
              onChange={(e) => setTilDato(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="dd.mm.yyyy"
              pattern="\d{2}\.\d{2}\.\d{4}"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organisasjonsform (valgfritt)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ORGANISASJONSFORMER.map((form) => (
              <label key={form.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organisasjonsform.includes(form.value)}
                  onChange={() => handleOrganisasjonsformChange(form.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{form.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Næringskode-filtre</h3>
          <p className="text-sm text-gray-600 mb-4">
            Flytt næringskoder mellom listene ved å bruke pil-knappene. Næringskoder i "Inkluder" vil bli prioritert, 
            mens næringskoder i "Ekskluder" vil bli filtrert bort.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Inkluder liste */}
            <div className="border border-green-300 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold text-green-800 mb-2">Inkluder (Prioriter)</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inkluderNaeringskoder.map((code) => {
                  const nk = alleNaeringskoder.find(n => n.code === code);
                  return (
                    <div key={code} className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                      <span className="text-sm text-gray-700 flex-1">{nk?.label || code}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveToEkskluder(code)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Flytt til Ekskluder"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => moveToAvailable(code, 'inkluder')}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          title="Fjern fra liste"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
                {inkluderNaeringskoder.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Ingen næringskoder valgt</p>
                )}
              </div>
            </div>

            {/* Tilgjengelige næringskoder */}
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-800 mb-2">Tilgjengelige</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tilgjengeligeNaeringskoder.map((nk) => (
                  <div key={nk.code} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <span className="text-sm text-gray-700 flex-1">{nk.label}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveToInkluder(nk.code)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title="Flytt til Inkluder"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveToEkskluder(nk.code)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="Flytt til Ekskluder"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
                {tilgjengeligeNaeringskoder.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Alle næringskoder er valgt</p>
                )}
              </div>
            </div>

            {/* Ekskluder liste */}
            <div className="border border-red-300 rounded-lg p-4 bg-red-50">
              <h4 className="font-semibold text-red-800 mb-2">Ekskluder</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ekskluderNaeringskoder.map((code) => {
                  const nk = alleNaeringskoder.find(n => n.code === code);
                  return (
                    <div key={code} className="flex items-center justify-between bg-white p-2 rounded border border-red-200">
                      <span className="text-sm text-gray-700 flex-1">{nk?.label || code}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveToInkluder(code)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          title="Flytt til Inkluder"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moveToAvailable(code, 'ekskluder')}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          title="Fjern fra liste"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
                {ekskluderNaeringskoder.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Ingen næringskoder valgt</p>
                )}
              </div>
            </div>
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Søker...' : 'Søk'}
        </button>
      </form>
    </div>
  );
}

