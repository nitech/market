import { useState, FormEvent, useMemo, useRef, useEffect } from 'react';
import type { SearchFilters } from '@/server/types';

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

// Alle rotnivå næringskoder (level 2) fra KLASS
const ALLE_NAERINGSKODER = [
  { code: '01', name: 'Jordbruk og tjenester tilknyttet jordbruk, jakt og viltstell' },
  { code: '02', name: 'Skogbruk og tjenester tilknyttet skogbruk' },
  { code: '03', name: 'Fiske, fangst og akvakultur' },
  { code: '05', name: 'Bryting av steinkull og brunkull' },
  { code: '06', name: 'Utvinning av råolje og naturgass' },
  { code: '07', name: 'Bryting av metallholdig malm' },
  { code: '08', name: 'Bryting og bergverksdrift ellers' },
  { code: '09', name: 'Tjenester tilknyttet bergverksdrift og utvinning' },
  { code: '10', name: 'Produksjon av nærings- og nytelsesmidler' },
  { code: '11', name: 'Produksjon av drikkevarer' },
  { code: '12', name: 'Produksjon av tobakksvarer' },
  { code: '13', name: 'Produksjon av tekstiler' },
  { code: '14', name: 'Produksjon av klær' },
  { code: '15', name: 'Produksjon av lær og andre relaterte produkter' },
  { code: '16', name: 'Produksjon av trelast og varer av tre, kork, strå og flettematerialer, unntatt møbler' },
  { code: '17', name: 'Produksjon av papir og papirvarer' },
  { code: '18', name: 'Trykking og reproduksjon av innspilte opptak' },
  { code: '19', name: 'Produksjon av kullprodukter og raffinerte petroleumsprodukter' },
  { code: '20', name: 'Produksjon av kjemikalier og kjemiske produkter' },
  { code: '21', name: 'Produksjon av farmasøytiske råvarer og preparater' },
  { code: '22', name: 'Produksjon av gummi- og plastprodukter' },
  { code: '23', name: 'Produksjon av andre ikke-metalliske mineralprodukter' },
  { code: '24', name: 'Produksjon av metaller' },
  { code: '25', name: 'Produksjon av metallvarer, unntatt maskiner og utstyr' },
  { code: '26', name: 'Produksjon av datamaskiner og elektroniske og optiske produkter' },
  { code: '27', name: 'Produksjon av elektrisk utstyr' },
  { code: '28', name: 'Produksjon av maskiner og utstyr ikke nevnt annet sted' },
  { code: '29', name: 'Produksjon av motorvogner og tilhengere' },
  { code: '30', name: 'Produksjon av andre transportmidler' },
  { code: '31', name: 'Produksjon av møbler' },
  { code: '32', name: 'Annen industriproduksjon' },
  { code: '33', name: 'Reparasjon, vedlikehold og installasjon av maskiner og utstyr' },
  { code: '35', name: 'Forsyning av elektrisitet, gass, damp og kjøleluft' },
  { code: '36', name: 'Uttak fra kilde, rensing og distribusjon av vann' },
  { code: '37', name: 'Oppsamling og behandling av avløpsvann' },
  { code: '38', name: 'Innsamling, gjenvinning og behandling av avfall' },
  { code: '39', name: 'Miljøutbedring, opprydding og lignende aktivitet' },
  { code: '41', name: 'Oppføring av bygninger' },
  { code: '42', name: 'Anleggsvirksomhet' },
  { code: '43', name: 'Spesialisert bygge- og anleggsvirksomhet' },
  { code: '46', name: 'Engroshandel' },
  { code: '47', name: 'Detaljhandel' },
  { code: '49', name: 'Landtransport og rørtransport' },
  { code: '50', name: 'Sjøfart' },
  { code: '51', name: 'Lufttransport' },
  { code: '52', name: 'Lagring og andre tjenester tilknyttet transport' },
  { code: '53', name: 'Post- og budtjenester' },
  { code: '55', name: 'Overnattingsvirksomhet' },
  { code: '56', name: 'Serveringsvirksomhet' },
  { code: '58', name: 'Utgivelsesvirksomhet' },
  { code: '59', name: 'Film-, video- og fjernsynsprogramproduksjon, utgivelse av musikk- og lydopptak' },
  { code: '60', name: 'Radio- og fjernsynsprogramvirksomhet, kringkasting, nyhetsbyråer og distribuering av annet innhold' },
  { code: '61', name: 'Telekommunikasjon' },
  { code: '62', name: 'Dataprogrammering, konsulentvirksomhet og andre tjenester tilknyttet informasjonsteknologi' },
  { code: '63', name: 'Datainfrastruktur, -behandling, -lagring og andre informasjonstjenester' },
  { code: '64', name: 'Finansieringsvirksomhet og kollektive investeringsfond' },
  { code: '65', name: 'Forsikringsvirksomhet, unntatt trygdeordninger underlagt offentlig forvaltning' },
  { code: '66', name: 'Tjenester tilknyttet finansiell virksomhet' },
  { code: '68', name: 'Eiendomsvirksomhet' },
  { code: '69', name: 'Juridisk og regnskapsmessig tjenesteyting' },
  { code: '70', name: 'Hovedkontortjenester og administrativ rådgivning' },
  { code: '71', name: 'Arkitektvirksomhet og teknisk konsulentvirksomhet, og teknisk prøving og analyse' },
  { code: '72', name: 'Forskning og eksperimentell utvikling' },
  { code: '73', name: 'Annonse- og reklamevirksomhet, markedsundersøkelser og PR og kommunikasjonstjenester' },
  { code: '74', name: 'Annen faglig, vitenskapelig og teknisk virksomhet' },
  { code: '75', name: 'Veterinærtjenester' },
  { code: '77', name: 'Utleie- og leasingvirksomhet' },
  { code: '78', name: 'Arbeidskrafttjenester' },
  { code: '79', name: 'Reisebyrå- og reisearrangørvirksomhet og tilknyttede tjenester' },
  { code: '80', name: 'Etterforsknings- og vakttjenester' },
  { code: '81', name: 'Tjenester tilknyttet eiendomsdrift og beplantning av hager og parkanlegg' },
  { code: '82', name: 'Annen forretningsmessig tjenesteyting' },
  { code: '84', name: 'Offentlig administrasjon og forsvar, og trygdeordninger underlagt offentlig forvaltning' },
  { code: '85', name: 'Undervisning' },
  { code: '86', name: 'Helsetjenester' },
  { code: '87', name: 'Helse- og omsorgstjenester i institusjoner og andre botilbud' },
  { code: '88', name: 'Omsorgs- og sosialtjenester uten botilbud' },
  { code: '90', name: 'Kunstnerisk virksomhet og underholdningsvirksomhet' },
  { code: '91', name: 'Drift av biblioteker, arkiver, museer og annen kulturvirksomhet' },
  { code: '92', name: 'Lotteri- og gamblingvirksomhet' },
  { code: '93', name: 'Sports-, fornøyelses- og fritidsaktiviteter' },
  { code: '94', name: 'Aktiviteter i medlemsorganisasjoner' },
  { code: '95', name: 'Reparasjon og vedlikehold av datamaskiner, husholdningsvarer, varer til personlig bruk og motorvogner og motorsykler' },
  { code: '96', name: 'Personlig tjenesteyting' },
  { code: '97', name: 'Lønnet arbeid i private husholdninger' },
  { code: '98', name: 'Annen vareproduksjon og tjenesteyting i private husholdninger til eget bruk' },
  { code: '99', name: 'Aktiviteter i internasjonale organisasjoner og organer' },
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
  const [naeringskodeSearch, setNaeringskodeSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Standardverdier for næringskoder (inkluder)
  const [inkluderNaeringskoder, setInkluderNaeringskoder] = useState<string[]>([
    '47', '56', '96', '43', '62'
  ]);

  // Filtrerte næringskoder basert på søk (ekskluderer allerede valgte)
  const filteredNaeringskoder = useMemo(() => {
    if (!naeringskodeSearch.trim()) {
      return [];
    }
    const searchLower = naeringskodeSearch.toLowerCase();
    return ALLE_NAERINGSKODER.filter(
      nk => 
        !inkluderNaeringskoder.includes(nk.code) &&
        (nk.code.toLowerCase().includes(searchLower) ||
        nk.name.toLowerCase().includes(searchLower))
    );
  }, [naeringskodeSearch, inkluderNaeringskoder]);

  const handleAddNaeringskode = (code: string) => {
    if (!inkluderNaeringskoder.includes(code)) {
      setInkluderNaeringskoder(prev => [...prev, code]);
      setNaeringskodeSearch('');
      setShowSearchResults(false);
      setSelectedIndex(-1);
    }
  };

  const handleRemoveNaeringskode = (code: string) => {
    setInkluderNaeringskoder(prev => prev.filter(c => c !== code));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && naeringskodeSearch === '' && inkluderNaeringskoder.length > 0) {
      // Remove last pill on backspace when search is empty
      setInkluderNaeringskoder(prev => prev.slice(0, -1));
    } else if (e.key === 'ArrowDown' && showSearchResults && filteredNaeringskoder.length > 0) {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredNaeringskoder.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp' && showSearchResults) {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && showSearchResults && selectedIndex >= 0 && selectedIndex < filteredNaeringskoder.length) {
      e.preventDefault();
      handleAddNaeringskode(filteredNaeringskoder[selectedIndex].code);
      setSelectedIndex(-1);
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSelectedIndex(-1);
    }
  };

  const getNaeringskodeLabel = (code: string) => {
    const nk = ALLE_NAERINGSKODER.find(n => n.code === code);
    return nk ? `${nk.code} – ${nk.name}` : code;
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
      ekskluderNaeringskoder: [], // No longer used, but kept for API compatibility
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
            Søk og legg til næringskoder. Bruk backspace for å fjerne siste valg.
          </p>
          
          <div className="relative" ref={searchContainerRef}>
            <label htmlFor="naeringskodeSearch" className="block text-sm font-medium text-gray-700 mb-2">
              Søk og legg til næringskoder
            </label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[42px]">
              {inkluderNaeringskoder.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                >
                  <span>{getNaeringskodeLabel(code)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNaeringskode(code)}
                    className="hover:text-blue-900 focus:outline-none"
                    title="Fjern"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="naeringskodeSearch"
                value={naeringskodeSearch}
                onChange={(e) => {
                  setNaeringskodeSearch(e.target.value);
                  setShowSearchResults(e.target.value.trim().length > 0);
                  setSelectedIndex(-1); // Reset selection when typing
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (naeringskodeSearch.trim().length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
                placeholder="Søk på kode eller navn..."
              />
            </div>

            {/* Search results dropdown */}
            {showSearchResults && filteredNaeringskoder.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredNaeringskoder.map((nk, index) => (
                  <button
                    key={nk.code}
                    type="button"
                    onClick={() => handleAddNaeringskode(nk.code)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-2 focus:outline-none ${
                      index === selectedIndex
                        ? 'bg-blue-50 border-l-2 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-900">{nk.code}</span>
                    <span className="text-sm text-gray-600 ml-2">– {nk.name}</span>
                  </button>
                ))}
              </div>
            )}
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

