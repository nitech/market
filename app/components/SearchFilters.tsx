'use client';

import { useState, FormEvent, useMemo, useRef, useEffect } from 'react';
import type { SearchFilters } from '@/server/types';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const Icons = {
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  filter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  money: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
      <path d="M12 18V6"/>
    </svg>
  ),
  tag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
      <path d="M7 7h.01"/>
    </svg>
  ),
  loader: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  filterActive: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
};

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

const ALLE_NAERINGSKODER = [
  { code: '01', name: 'Jordbruk og tjenester tilknyttet jordbruk, jakt og viltstell' },
  { code: '02', name: 'Skogbruk og tjenester tilknyttet skogbruk' },
  { code: '03', name: 'Fiske, fangst og akvakultur' },
  { code: '47', name: 'Detaljhandel' },
  { code: '56', name: 'Serveringsvirksomhet' },
  { code: '62', name: 'Dataprogrammering, konsulentvirksomhet og andre tjenester tilknyttet informasjonsteknologi' },
  { code: '96', name: 'Personlig tjenesteyting' },
  { code: '43', name: 'Spesialisert bygge- og anleggsvirksomhet' },
];

const STORAGE_KEY = '7markets-filters-expanded';

export function SearchFiltersComponent({ onSearch, loading }: SearchFiltersProps) {
  // Load expanded state from localStorage
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    }
    return false;
  });

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
  const isoToNorwegian = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

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

  const [inkluderNaeringskoder, setInkluderNaeringskoder] = useState<string[]>([
    '47', '56', '96', '43', '62'
  ]);

  // Check if any advanced filters are active
  const hasActiveFilters = 
    minAksjekapital !== '50000' ||
    fraDato !== isoToNorwegian(defaultDates.fra) ||
    tilDato !== isoToNorwegian(defaultDates.til) ||
    organisasjonsform.length > 0 ||
    inkluderNaeringskoder.length > 0;

  // Save expanded state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, expanded.toString());
    }
  }, [expanded]);

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
    const minAksjekapitalNum = minAksjekapital.trim() === ''
      ? 50000
      : Number(minAksjekapital) || 50000;

    onSearch({
      minAksjekapital: minAksjekapitalNum,
      fraRegistreringsdato: fraDato ? norwegianToIso(fraDato) : undefined,
      tilRegistreringsdato: tilDato ? norwegianToIso(tilDato) : undefined,
      organisasjonsform: organisasjonsform.length > 0 ? organisasjonsform : undefined,
      navn: navn || undefined,
      inkluderNaeringskoder: inkluderNaeringskoder.length > 0 ? inkluderNaeringskoder : [],
      ekskluderNaeringskoder: [],
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

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--gs-bg-card)',
        border: '1px solid var(--gs-border-default)',
      }}
    >
      {/* Compact Search Bar */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--gs-text-tertiary)' }}
            >
              {Icons.search}
            </span>
            <input
              type="text"
              placeholder="Søk på bedriftsnavn..."
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none"
              style={{
                background: 'var(--gs-bg-tertiary)',
                border: '1px solid var(--gs-border-default)',
                color: 'var(--gs-text-primary)',
              }}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: expanded || hasActiveFilters
                ? 'rgba(163, 230, 53, 0.15)'
                : 'var(--gs-bg-tertiary)',
              border: `1px solid ${expanded || hasActiveFilters
                ? 'rgba(163, 230, 53, 0.3)'
                : 'var(--gs-border-default)'}`,
              color: expanded || hasActiveFilters
                ? 'var(--gs-accent-lime)'
                : 'var(--gs-text-secondary)',
            }}
            title={expanded ? 'Skjul filtre' : 'Vis filtre'}
          >
            {hasActiveFilters && !expanded ? Icons.filterActive : Icons.filter}
            <span className="hidden sm:inline">
              {expanded ? 'Skjul' : 'Filter'}
            </span>
            {hasActiveFilters && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded text-xs"
                style={{
                  background: 'var(--gs-accent-lime)',
                  color: 'var(--gs-bg-primary)',
                }}
              >
                {organisasjonsform.length + inkluderNaeringskoder.length + (minAksjekapital !== '50000' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: loading ? 'var(--gs-bg-tertiary)' : 'var(--gs-accent-lime)',
              color: loading ? 'var(--gs-text-tertiary)' : 'var(--gs-bg-primary)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? Icons.loader : Icons.search}
            <span className="hidden sm:inline">Søk</span>
          </button>
        </form>
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: '1px solid var(--gs-border-default)' }}
        >
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Minimum aksjekapital */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  {Icons.money}
                  Minimum aksjekapital
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: 'var(--gs-text-tertiary)' }}
                  >
                    kr
                  </span>
                  <input
                    type="number"
                    value={minAksjekapital}
                    onChange={(e) => setMinAksjekapital(e.target.value)}
                    min="0"
                    step="1000"
                    placeholder="50000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                    style={{
                      background: 'var(--gs-bg-tertiary)',
                      border: '1px solid var(--gs-border-default)',
                      color: 'var(--gs-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Datoer */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  {Icons.calendar}
                  Registreringsperiode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'var(--gs-text-tertiary)' }}>
                      Fra dato
                    </label>
                    <input
                      type="text"
                      value={fraDato}
                      onChange={(e) => setFraDato(e.target.value)}
                      placeholder="dd.mm.yyyy"
                      className="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                      style={{
                        background: 'var(--gs-bg-tertiary)',
                        border: '1px solid var(--gs-border-default)',
                        color: 'var(--gs-text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: 'var(--gs-text-tertiary)' }}>
                      Til dato
                    </label>
                    <input
                      type="text"
                      value={tilDato}
                      onChange={(e) => setTilDato(e.target.value)}
                      placeholder="dd.mm.yyyy"
                      className="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                      style={{
                        background: 'var(--gs-bg-tertiary)',
                        border: '1px solid var(--gs-border-default)',
                        color: 'var(--gs-text-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Næringskoder */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  {Icons.tag}
                  Næringskoder
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-tertiary)' }}>
                    {inkluderNaeringskoder.length}
                  </span>
                </label>
                <div className="relative" ref={searchContainerRef}>
                  <div
                    className="flex min-h-[44px] flex-wrap gap-2 rounded-lg p-2.5 transition-all duration-200"
                    style={{
                      background: 'var(--gs-bg-tertiary)',
                      border: '1px solid var(--gs-border-default)',
                    }}
                  >
                    {inkluderNaeringskoder.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{
                          background: 'rgba(163, 230, 53, 0.15)',
                          color: 'var(--gs-accent-lime)',
                          border: '1px solid rgba(163, 230, 53, 0.3)',
                        }}
                      >
                        <span>{getNaeringskodeLabel(code)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNaeringskode(code)}
                          className="hover:opacity-70 transition-opacity"
                          title="Fjern"
                        >
                          {Icons.x}
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={naeringskodeSearch}
                      onChange={(e) => {
                        setNaeringskodeSearch(e.target.value);
                        setShowSearchResults(e.target.value.trim().length > 0);
                        setSelectedIndex(-1);
                      }}
                      onKeyDown={handleSearchKeyDown}
                      onFocus={() => {
                        if (naeringskodeSearch.trim().length > 0) {
                          setShowSearchResults(true);
                        }
                      }}
                      className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
                      style={{ color: 'var(--gs-text-primary)' }}
                      placeholder={inkluderNaeringskoder.length === 0 ? 'Søk på kode eller navn...' : ''}
                    />
                  </div>

                  {/* Search results dropdown */}
                  {showSearchResults && filteredNaeringskoder.length > 0 && (
                    <div
                      className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg shadow-lg"
                      style={{
                        background: 'var(--gs-bg-elevated)',
                        border: '1px solid var(--gs-border-default)',
                      }}
                    >
                      {filteredNaeringskoder.map((nk, index) => (
                        <button
                          key={nk.code}
                          type="button"
                          onClick={() => handleAddNaeringskode(nk.code)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className="w-full px-4 py-2.5 text-left transition-colors duration-150"
                          style={{
                            background: index === selectedIndex ? 'var(--gs-bg-tertiary)' : 'transparent',
                            borderLeft: index === selectedIndex ? '2px solid var(--gs-accent-lime)' : '2px solid transparent',
                          }}
                        >
                          <span className="text-sm font-semibold" style={{ color: 'var(--gs-text-primary)' }}>
                            {nk.code}
                          </span>
                          <span className="ml-2 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                            – {nk.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Organisasjonsform */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  {Icons.building}
                  Organisasjonsform
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--gs-bg-tertiary)', color: 'var(--gs-text-tertiary)' }}>
                    {organisasjonsform.length}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ORGANISASJONSFORMER.map((form) => (
                    <label
                      key={form.value}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={organisasjonsform.includes(form.value)}
                        onChange={() => handleOrganisasjonsformChange(form.value)}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: 'var(--gs-accent-lime)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                        {form.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
