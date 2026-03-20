import type { CompanyWithRoles } from '@/server/types';

interface StatisticsProps {
  companies: CompanyWithRoles[];
  totalFiltered: number;
}

const Icons = {
  building: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M8 10h.01"/>
      <path d="M16 10h.01"/>
    </svg>
  ),
  dollar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
};

export function Statistics({ companies, totalFiltered }: StatisticsProps) {
  const totalCapital = companies.reduce((sum, company) => {
    return sum + (company.kapital?.belop || 0);
  }, 0);

  const avgCapital = companies.length > 0 ? totalCapital / companies.length : 0;
  const companiesWithCapital = companies.filter(c => c.kapital?.belop && c.kapital.belop > 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total results */}
      <div
        className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'var(--gs-bg-card)',
          border: '1px solid rgba(163, 230, 53, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(163, 230, 53, 0.1)' }}
          >
            <span style={{ color: 'var(--gs-accent-lime)' }}>{Icons.building}</span>
          </div>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: 'rgba(163, 230, 53, 0.15)',
              color: 'var(--gs-accent-lime)',
            }}
          >
            +{companies.length} nye
          </span>
        </div>
        <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--gs-text-secondary)' }}>
          Totalt antall resultater
        </h3>
        <p
          className="text-2xl font-bold"
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            color: 'var(--gs-text-primary)',
          }}
        >
          {totalFiltered.toLocaleString('no-NO')}
        </p>
      </div>

      {/* Average capital */}
      <div
        className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'var(--gs-bg-card)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(59, 130, 246, 0.1)' }}
          >
            <span style={{ color: 'var(--gs-accent-blue)' }}>{Icons.dollar}</span>
          </div>
        </div>
        <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--gs-text-secondary)' }}>
          Gjennomsnittlig aksjekapital
        </h3>
        <p
          className="text-2xl font-bold"
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            color: 'var(--gs-accent-blue)',
          }}
        >
          {new Intl.NumberFormat('no-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(avgCapital)}
        </p>
      </div>

      {/* With capital */}
      <div
        className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'var(--gs-bg-card)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <span style={{ color: 'var(--gs-success)' }}>{Icons.checkCircle}</span>
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--gs-text-tertiary)' }}
          >
            {companiesWithCapital > 0
              ? `${Math.round((companiesWithCapital / companies.length) * 100)}%`
              : '0%'}
          </span>
        </div>
        <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--gs-text-secondary)' }}>
          Med registrert kapital
        </h3>
        <p
          className="text-2xl font-bold"
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            color: 'var(--gs-success)',
          }}
        >
          {companiesWithCapital.toLocaleString('no-NO')}
        </p>
      </div>
    </div>
  );
}
