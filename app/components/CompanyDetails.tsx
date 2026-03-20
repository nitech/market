import { useState, useEffect } from 'react';
import type { Enhet } from '@/server/types';

interface CompanyDetailsProps {
  orgnr: string;
  onClose: () => void;
}

const Icons = {
  x: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  warning: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" x2="12" y1="9" y2="13"/>
      <line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  ),
  external: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" x2="21" y1="14" y2="3"/>
    </svg>
  ),
  mapPin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  globe: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" x2="22" y1="12" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  tag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
      <path d="M7 7h.01"/>
    </svg>
  ),
  dollar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
};

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
    if (!amount) return '-';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
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

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        onClick={handleBackdropClick}
      >
        <div
          className="rounded-xl p-12 flex flex-col items-center"
          style={{
            background: 'var(--gs-bg-card)',
            border: '1px solid var(--gs-border-default)',
          }}
        >
          <div style={{ color: 'var(--gs-accent-lime)' }}>{Icons.loader}</div>
          <p className="mt-4 text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
            Laster bedriftsdetaljer...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        onClick={handleBackdropClick}
      >
        <div
          className="rounded-xl p-8 max-w-md w-full"
          style={{
            background: 'var(--gs-bg-card)',
            border: '1px solid var(--gs-border-default)',
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div style={{ color: 'var(--gs-accent-red)' }}>{Icons.warning}</div>
            <p className="mt-4 text-base font-medium" style={{ color: 'var(--gs-accent-red)' }}>
              {error}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: 'var(--gs-bg-tertiary)',
                color: 'var(--gs-text-primary)',
              }}
            >
              Lukk
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!company) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl"
        style={{
          background: 'var(--gs-bg-card)',
          border: '1px solid var(--gs-border-default)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6"
          style={{ borderBottom: '1px solid var(--gs-border-default)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gs-bg-tertiary)' }}
            >
              <span style={{ color: 'var(--gs-accent-lime)' }}>{Icons.building}</span>
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  color: 'var(--gs-text-primary)',
                }}
              >
                {company.navn || 'Navn ikke oppgitt'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-sm transition-colors duration-150 hover:opacity-80"
                  style={{ color: copied ? 'var(--gs-accent-green)' : 'var(--gs-text-secondary)' }}
                >
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{ background: 'var(--gs-bg-tertiary)' }}
                  >
                    {company.organisasjonsnummer}
                  </span>
                  {copied ? Icons.check : Icons.copy}
                </button>
                {company.organisasjonsform && (
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      background: 'rgba(163, 230, 53, 0.15)',
                      color: 'var(--gs-accent-lime)',
                    }}
                  >
                    {company.organisasjonsform.beskrivelse || company.organisasjonsform.kode}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--gs-text-tertiary)' }}
          >
            {Icons.x}
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grunnleggende informasjon */}
            <div
              className="rounded-xl p-5"
              style={{
                background: 'var(--gs-bg-tertiary)',
                border: '1px solid var(--gs-border-default)',
              }}
            >
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--gs-text-secondary)' }}
              >
                Grunnleggende informasjon
              </h3>
              <dl className="space-y-3">
                {company.registreringsdatoEnhetsregisteret && (
                  <div className="flex items-start justify-between">
                    <dt className="flex items-center gap-2 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                      {Icons.calendar}
                      Registrert
                    </dt>
                    <dd className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                      {formatDate(company.registreringsdatoEnhetsregisteret)}
                    </dd>
                  </div>
                )}
                {company.stiftelsesdato && (
                  <div className="flex items-start justify-between">
                    <dt className="flex items-center gap-2 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                      {Icons.calendar}
                      Stiftet
                    </dt>
                    <dd className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                      {formatDate(company.stiftelsesdato)}
                    </dd>
                  </div>
                )}
                {company.antallAnsatte !== undefined && (
                  <div className="flex items-start justify-between">
                    <dt className="flex items-center gap-2 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                      {Icons.users}
                      Antall ansatte
                    </dt>
                    <dd className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                      {company.antallAnsatte}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Kapital */}
            {company.kapital && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: 'var(--gs-bg-tertiary)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  Kapital
                </h3>
                <dl className="space-y-3">
                  <div className="flex items-start justify-between">
                    <dt className="flex items-center gap-2 text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                      {Icons.dollar}
                      Aksjekapital
                    </dt>
                    <dd
                      className="text-sm font-semibold"
                      style={{ color: 'var(--gs-accent-lime)' }}
                    >
                      {formatCurrency(company.kapital.belop)}
                    </dd>
                  </div>
                  {company.kapital.antallAksjer && (
                    <div className="flex items-start justify-between">
                      <dt className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                        Antall aksjer
                      </dt>
                      <dd className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                        {company.kapital.antallAksjer.toLocaleString('no-NO')}
                      </dd>
                    </div>
                  )}
                  {company.kapital.type && (
                    <div className="flex items-start justify-between">
                      <dt className="text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                        Type
                      </dt>
                      <dd className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                        {company.kapital.type}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Adresse */}
            {company.forretningsadresse && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: 'var(--gs-bg-tertiary)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  Forretningsadresse
                </h3>
                <div className="flex items-start gap-3">
                  <div style={{ color: 'var(--gs-text-tertiary)' }}>{Icons.mapPin}</div>
                  <div>
                    {company.forretningsadresse.adresse && (
                      <p className="text-sm" style={{ color: 'var(--gs-text-primary)' }}>
                        {company.forretningsadresse.adresse.join(', ')}
                      </p>
                    )}
                    <p className="text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                      {company.forretningsadresse.postnummer} {company.forretningsadresse.poststed}
                    </p>
                    {company.forretningsadresse.kommune && (
                      <p className="text-sm mt-1" style={{ color: 'var(--gs-text-tertiary)' }}>
                        {company.forretningsadresse.kommune}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Næringskoder */}
            {(company.naeringskode1 || company.naeringskode2 || company.naeringskode3) && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: 'var(--gs-bg-tertiary)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  Næringskoder
                </h3>
                <dl className="space-y-2">
                  {company.naeringskode1 && (
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--gs-accent-lime)' }}>{Icons.tag}</span>
                      <div>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2"
                          style={{
                            background: 'rgba(163, 230, 53, 0.15)',
                            color: 'var(--gs-accent-lime)',
                          }}
                        >
                          {company.naeringskode1.kode}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--gs-text-primary)' }}>
                          {company.naeringskode1.beskrivelse}
                        </span>
                      </div>
                    </div>
                  )}
                  {company.naeringskode2 && (
                    <div className="flex items-start gap-2">
                      <span style={{ color: 'var(--gs-text-tertiary)' }}>{Icons.tag}</span>
                      <div>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-medium mr-2"
                          style={{
                            background: 'var(--gs-bg-elevated)',
                            color: 'var(--gs-text-secondary)',
                          }}
                        >
                          {company.naeringskode2.kode}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                          {company.naeringskode2.beskrivelse}
                        </span>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Kontaktinformasjon */}
            {(company.epostadresse || company.telefon || company.mobil || company.hjemmeside) && (
              <div
                className="rounded-xl p-5 md:col-span-2"
                style={{
                  background: 'var(--gs-bg-tertiary)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: 'var(--gs-text-secondary)' }}
                >
                  Kontaktinformasjon
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.epostadresse && (
                    <a
                      href={`mailto:${company.epostadresse}`}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 hover:bg-white/5"
                    >
                      <div style={{ color: 'var(--gs-accent-lime)' }}>{Icons.mail}</div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--gs-text-tertiary)' }}>E-post</p>
                        <p className="text-sm" style={{ color: 'var(--gs-text-primary)' }}>
                          {company.epostadresse}
                        </p>
                      </div>
                    </a>
                  )}
                  {company.telefon && (
                    <a
                      href={`tel:${company.telefon}`}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 hover:bg-white/5"
                    >
                      <div style={{ color: 'var(--gs-accent-blue)' }}>{Icons.phone}</div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--gs-text-tertiary)' }}>Telefon</p>
                        <p className="text-sm" style={{ color: 'var(--gs-text-primary)' }}>
                          {company.telefon}
                        </p>
                      </div>
                    </a>
                  )}
                  {company.hjemmeside && (
                    <a
                      href={`https://${company.hjemmeside}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 hover:bg-white/5 group"
                    >
                      <div style={{ color: 'var(--gs-accent-orange)' }}>{Icons.globe}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs" style={{ color: 'var(--gs-text-tertiary)' }}>Hjemmeside</p>
                        <p className="text-sm truncate" style={{ color: 'var(--gs-text-primary)' }}>
                          {company.hjemmeside}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--gs-text-tertiary)' }}>
                        {Icons.external}
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
