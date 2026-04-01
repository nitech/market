'use client';

import { useMemo, useState } from 'react';
import type { CompanyWithRoles } from '@/server/types';

interface CompanyListProps {
  companies: CompanyWithRoles[];
  loading?: boolean;
  onViewDetails?: (orgnr: string) => void;
  favorites?: string[];
  onToggleFavorite?: (orgnr: string) => void;
  onAddToQualify?: (company: CompanyWithRoles) => void;
  qualifyOrgnrs?: Set<string>;
}

// Custom Checkbox Component matching GeoSales style
function Checkbox({ checked, onChange, id }: { checked: boolean; onChange: () => void; id?: string }) {
  return (
    <label className="relative flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
        id={id}
      />
      <div
        className="w-4 h-4 rounded border-2 transition-all duration-150 flex items-center justify-center"
        style={{
          borderColor: checked ? 'var(--gs-accent-lime)' : 'var(--gs-border-hover)',
          backgroundColor: checked ? 'var(--gs-accent-lime)' : 'transparent',
        }}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gs-bg-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        )}
      </div>
    </label>
  );
}

// Icons
const Icons = {
  star: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  starFilled: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  external: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" x2="21" y1="14" y2="3"/>
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M8 10h.01"/>
      <path d="M16 10h.01"/>
      <path d="M8 14h.01"/>
      <path d="M16 14h.01"/>
    </svg>
  ),
  loader: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  search: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  filter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
};

// Status Badge Component
function StatusBadge({ 
  children, 
  variant = 'lime' 
}: { 
  children: React.ReactNode; 
  variant?: 'lime' | 'green' | 'yellow' | 'orange' | 'red' | 'blue';
}) {
  const variants = {
    lime: {
      bg: 'rgba(163, 230, 53, 0.15)',
      border: 'rgba(163, 230, 53, 0.3)',
      color: '#a3e635',
    },
    green: {
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.3)',
      color: '#22c55e',
    },
    yellow: {
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.3)',
      color: '#eab308',
    },
    orange: {
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.3)',
      color: '#f97316',
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      color: '#ef4444',
    },
    blue: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.3)',
      color: '#3b82f6',
    },
  };

  const theme = variants[variant];

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.color,
      }}
    >
      {children}
    </span>
  );
}

export function CompanyList({
  companies,
  loading,
  onViewDetails,
  favorites,
  onToggleFavorite,
  onAddToQualify,
  qualifyOrgnrs,
}: CompanyListProps) {
  const [copiedOrgnr, setCopiedOrgnr] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Alle', count: companies.length },
    { id: 'favorites', label: 'Favoritter', count: favorites?.length || 0 },
  ];

  // Empty state message based on active tab
  const getEmptyMessage = () => {
    if (activeTab === 'favorites') {
      return {
        title: 'Ingen favoritter',
        subtitle: 'Legg til bedrifter i favoritter ved å klikke på stjernen',
      };
    }
    return {
      title: 'Ingen bedrifter funnet',
      subtitle: 'Prøv å justere søkekriteriene dine',
    };
  };

  // Filter companies based on active tab
  const filteredCompanies = useMemo<CompanyWithRoles[]>(() => {
    const seen = new Set<string>();
    const result: CompanyWithRoles[] = [];

    for (const company of companies) {
      const id = company.organisasjonsnummer;
      if (seen.has(id)) continue;
      
      // Apply tab filter
      if (activeTab === 'favorites') {
        if (!favorites?.includes(id)) continue;
      }
      
      seen.add(id);
      result.push(company);
    }

    return result;
  }, [companies, activeTab, favorites]);

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
    if (!amount) return '-';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyCompact = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    try {
      const dateStr = date.split('T')[0];
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${day}.${month}.${year}`;
      }
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();
      return `${dayStr}.${monthStr}.${yearStr}`;
    } catch (e) {
      return '-';
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
    if (!address) return '-';
    return [
      address.adresse?.join(', '),
      address.postnummer,
      address.poststed,
    ]
      .filter(Boolean)
      .join(', ');
  };

  const toggleRowSelection = (orgnr: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(orgnr)) {
      newSelected.delete(orgnr);
    } else {
      newSelected.add(orgnr);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredCompanies.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredCompanies.map(c => c.organisasjonsnummer)));
    }
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-xl"
        style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}
      >
        <div style={{ color: 'var(--gs-accent-lime)' }}>{Icons.loader}</div>
        <p className="mt-4 text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
          Laster bedrifter...
        </p>
      </div>
    );
  }

  if (filteredCompanies.length === 0) {
    const emptyMessage = getEmptyMessage();
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-xl"
        style={{ background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-default)' }}
      >
        <div style={{ color: 'var(--gs-text-tertiary)' }}>
          {activeTab === 'favorites' ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ) : (
            Icons.search
          )}
        </div>
        <p
          className="mt-4 text-base font-medium"
          style={{ color: 'var(--gs-text-secondary)' }}
        >
          {emptyMessage.title}
        </p>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--gs-text-tertiary)' }}
        >
          {emptyMessage.subtitle}
        </p>
      </div>
    );
  }

  const allSelected = selectedRows.size === filteredCompanies.length && filteredCompanies.length > 0;

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{
        background: 'var(--gs-bg-card)',
        border: '1px solid var(--gs-border-default)',
      }}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--gs-border-default)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? 'var(--gs-bg-elevated)' : 'transparent',
              color: activeTab === tab.id ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)',
            }}
          >
            {tab.label}
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{
                background: activeTab === tab.id ? 'var(--gs-accent-lime)' : 'var(--gs-bg-tertiary)',
                color: activeTab === tab.id ? 'var(--gs-bg-primary)' : 'var(--gs-text-secondary)',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Header Info - Desktop only */}
      <div
        className="hidden sm:flex items-center justify-between px-3 sm:px-4 py-3"
        style={{ borderBottom: '1px solid var(--gs-border-default)' }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Checkbox 
            checked={allSelected} 
            onChange={toggleAllSelection}
            id="select-all"
          />
          <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--gs-text-secondary)' }}>
            {selectedRows.size > 0 ? (
              <span style={{ color: 'var(--gs-accent-lime)' }}>{selectedRows.size} valgt</span>
            ) : (
              <span>{filteredCompanies.length} bedrifter</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--gs-text-tertiary)' }}
          >
            <span>{Icons.filter}</span>
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden">
        <div 
          className="flex flex-col"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filteredCompanies.map((company) => {
            const isSelected = selectedRows.has(company.organisasjonsnummer);
            const isFavorite = favorites?.includes(company.organisasjonsnummer);
            const isInQualify = qualifyOrgnrs?.has(company.organisasjonsnummer) ?? false;

            return (
              <div
                key={company.organisasjonsnummer}
                className="transition-all duration-150"
                style={{
                  background: isSelected ? 'rgba(163, 230, 53, 0.08)' : 'transparent',
                  borderBottom: '1px solid var(--gs-border-default)',
                }}
              >
                <div className="p-4">
                  {/* Top row: Checkbox, Favorite, Name */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex items-center gap-2 pt-1">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRowSelection(company.organisasjonsnummer)}
                      />
                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(company.organisasjonsnummer)}
                          className="transition-colors duration-150"
                          style={{
                            color: isFavorite ? 'var(--gs-accent-lime)' : 'var(--gs-text-tertiary)',
                          }}
                          title={isFavorite ? 'Fjern fra favoritter' : 'Legg til favoritter'}
                        >
                          {isFavorite ? Icons.starFilled : Icons.star}
                        </button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: 'var(--gs-text-primary)' }}
                        title={company.navn || 'Navn ikke oppgitt'}
                      >
                        {company.navn || 'Navn ikke oppgitt'}
                      </h3>
                      {company.organisasjonsform && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gs-text-tertiary)' }}>
                          {company.organisasjonsform.beskrivelse || company.organisasjonsform.kode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(company.organisasjonsnummer)}
                        className="flex items-center gap-1 px-2 py-1 rounded font-mono"
                        style={{
                          background: copiedOrgnr === company.organisasjonsnummer
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'var(--gs-bg-tertiary)',
                          color: copiedOrgnr === company.organisasjonsnummer
                            ? 'var(--gs-accent-green)'
                            : 'var(--gs-text-secondary)',
                        }}
                      >
                        {copiedOrgnr === company.organisasjonsnummer ? 'Kopiert' : company.organisasjonsnummer}
                      </button>
                      {company.kapital?.belop && company.kapital.belop > 0 && (
                        <span style={{ color: 'var(--gs-text-secondary)' }}>
                          {formatCurrencyCompact(company.kapital.belop)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {onAddToQualify && (
                        <button
                          onClick={() => onAddToQualify(company)}
                          disabled={isInQualify}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                          style={{
                            background: isInQualify ? 'rgba(34, 197, 94, 0.15)' : 'rgba(163, 230, 53, 0.15)',
                            color: isInQualify ? 'var(--gs-accent-green)' : 'var(--gs-accent-lime)',
                            opacity: isInQualify ? 0.8 : 1,
                          }}
                          title={isInQualify ? 'Allerede i kvalifiser' : 'Legg til i kvalifiser'}
                        >
                          {Icons.plus}
                          {isInQualify ? 'Lagt til' : 'Kvalifiser'}
                        </button>
                      )}
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(company.organisasjonsnummer)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: 'var(--gs-text-tertiary)' }}
                        >
                          {Icons.chevronRight}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr style={{ background: 'var(--gs-bg-tertiary)' }}>
              <th className="px-3 sm:px-4 py-3 text-left w-10">
                <span className="sr-only">Velg</span>
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                Bedrift
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                Org.nr
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                Adresse
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                Daglig leder
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                Kapital
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                Registrert
              </th>
              <th
                className="px-3 sm:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                Næring
              </th>
              <th className="px-3 sm:px-4 py-3 text-left w-10">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => {
              const isSelected = selectedRows.has(company.organisasjonsnummer);
              const isFavorite = favorites?.includes(company.organisasjonsnummer);
              const isInQualify = qualifyOrgnrs?.has(company.organisasjonsnummer) ?? false;

              return (
                <tr
                  key={company.organisasjonsnummer}
                  className="transition-all duration-150"
                  style={{
                    background: isSelected ? 'rgba(163, 230, 53, 0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--gs-bg-elevated)';
                    } else {
                      e.currentTarget.style.background = 'rgba(163, 230, 53, 0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected ? 'rgba(163, 230, 53, 0.08)' : 'transparent';
                  }}
                >
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRowSelection(company.organisasjonsnummer)}
                      />
                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(company.organisasjonsnummer)}
                          className="transition-colors duration-150"
                          style={{
                            color: isFavorite ? 'var(--gs-accent-lime)' : 'var(--gs-text-tertiary)',
                          }}
                          title={isFavorite ? 'Fjern fra favoritter' : 'Legg til favoritter'}
                        >
                          {isFavorite ? Icons.starFilled : Icons.star}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'var(--gs-bg-tertiary)' }}
                      >
                        <span style={{ color: 'var(--gs-text-secondary)' }}>{Icons.building}</span>
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium truncate max-w-[120px] sm:max-w-none"
                          style={{ color: 'var(--gs-text-primary)' }}
                          title={company.navn || 'Navn ikke oppgitt'}
                        >
                          {company.navn || 'Navn ikke oppgitt'}
                        </p>
                        {company.organisasjonsform && (
                          <p className="text-xs" style={{ color: 'var(--gs-text-tertiary)' }}>
                            {company.organisasjonsform.beskrivelse || company.organisasjonsform.kode}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <button
                      onClick={() => copyToClipboard(company.organisasjonsnummer)}
                      className="flex items-center gap-1.5 text-sm transition-colors duration-150 group"
                      style={{ color: 'var(--gs-text-secondary)' }}
                      title={copiedOrgnr === company.organisasjonsnummer ? 'Kopiert!' : 'Klikk for å kopiere'}
                    >
                      <span
                        className="px-1.5 sm:px-2 py-1 rounded font-mono text-xs"
                        style={{
                          background: 'var(--gs-bg-tertiary)',
                          color: copiedOrgnr === company.organisasjonsnummer
                            ? 'var(--gs-accent-green)'
                            : 'var(--gs-text-secondary)',
                        }}
                      >
                        {copiedOrgnr === company.organisasjonsnummer ? 'Kopiert' : company.organisasjonsnummer}
                      </span>
                      <span
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--gs-text-tertiary)' }}
                      >
                        {copiedOrgnr === company.organisasjonsnummer ? Icons.check : Icons.copy}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                    <p
                      className="text-sm max-w-xs truncate"
                      style={{ color: 'var(--gs-text-secondary)' }}
                      title={getAddressString(company)}
                    >
                      {getAddressString(company)}
                    </p>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                    <p className="text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                      {getDagligLederNavn(company.dagligLeder) || '-'}
                    </p>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <p className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                      {formatCurrency(company.kapital?.belop)}
                    </p>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                    <p className="text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                      {formatDate(company.registreringsdatoEnhetsregisteret)}
                    </p>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    {company.naeringskode1?.kode ? (
                      <StatusBadge variant="lime">
                        {company.naeringskode1.kode}
                      </StatusBadge>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-1">
                      {onAddToQualify && (
                        <button
                          onClick={() => onAddToQualify(company)}
                          disabled={isInQualify}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                          style={{
                            background: isInQualify ? 'rgba(34, 197, 94, 0.15)' : 'rgba(163, 230, 53, 0.15)',
                            color: isInQualify ? 'var(--gs-accent-green)' : 'var(--gs-accent-lime)',
                            opacity: isInQualify ? 0.8 : 1,
                          }}
                          title={isInQualify ? 'Allerede i kvalifiser' : 'Legg til i kvalifiser'}
                        >
                          {Icons.plus}
                          {isInQualify ? 'Lagt til' : 'Kvalifiser'}
                        </button>
                      )}
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(company.organisasjonsnummer)}
                          className="p-1.5 rounded-md transition-all duration-150 hover:scale-110"
                          style={{
                            color: 'var(--gs-text-tertiary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--gs-accent-lime)';
                            e.currentTarget.style.background = 'rgba(163, 230, 53, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--gs-text-tertiary)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Se detaljer"
                        >
                          {Icons.external}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
