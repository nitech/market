'use client';

import { useState } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { Header, PageHeader } from '@/app/components/Header';
import { SearchFiltersComponent } from '@/app/components/SearchFilters';
import { CompanyList } from '@/app/components/CompanyList';
import { Pagination } from '@/app/components/Pagination';
import { CompanyDetails } from '@/app/components/CompanyDetails';
import { Statistics } from '@/app/components/Statistics';
import { ExportButton } from '@/app/components/ExportButton';
import { StatCard } from '@/app/components/StatCard';
import { FranchiseEierskifteTool } from '@/app/components/FranchiseEierskifteTool';
import { useCompanies } from '@/app/hooks/useCompanies';
import { useFavorites } from '@/app/hooks/useFavorites';
import type { SearchFilters } from '@/server/types';

// Icons for stat cards
const Icons = {
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  funnel: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" x2="12" y1="9" y2="13"/>
      <line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
  trendUp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  dollar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

export default function Home() {
  const [activeNavItem, setActiveNavItem] = useState('overview');
  const [activeTab, setActiveTab] = useState<'search' | 'franchise'>('search');

  const {
    companies,
    loading,
    error,
    pagination,
    totalFiltered,
    search,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
  } = useCompanies();

  const { favorites, toggleFavorite } = useFavorites();
  const [selectedOrgnr, setSelectedOrgnr] = useState<string | null>(null);

  const handleSearch = (filters: SearchFilters) => {
    search(filters);
  };

  const handleViewDetails = (orgnr: string) => {
    setSelectedOrgnr(orgnr);
  };

  const handleCloseDetails = () => {
    setSelectedOrgnr(null);
  };

  const switchTab = (tab: 'search' | 'franchise') => {
    setActiveTab(tab);
    setSelectedOrgnr(null);
  };

  // Calculate stats
  const totalCompanies = companies.length;
  const totalCapital = companies.reduce((sum, c) => sum + (c.kapital?.belop || 0), 0);
  const avgCapital = totalCompanies > 0 ? totalCapital / totalCompanies : 0;
  const favoriteCount = favorites.length;

  // Format date
  const today = new Date();
  const dateStr = today.toLocaleDateString('no-NO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--gs-bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        activeItem={activeNavItem}
        onNavigate={(id) => {
          setActiveNavItem(id);
          if (id === 'overview') switchTab('search');
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          userName="Alex Fox"
          userRole="CEO, admin"
          onSearch={(query) => console.log('Search:', query)}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Tab Switcher (Search / Franchise) */}
          <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ background: 'var(--gs-bg-tertiary)' }}>
            <button
              onClick={() => switchTab('search')}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === 'search' ? 'var(--gs-bg-elevated)' : 'transparent',
                color: activeTab === 'search' ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)',
                boxShadow: activeTab === 'search' ? 'var(--gs-shadow-sm)' : 'none',
              }}
            >
              Søk
            </button>
            <button
              onClick={() => switchTab('franchise')}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === 'franchise' ? 'var(--gs-bg-elevated)' : 'transparent',
                color: activeTab === 'franchise' ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)',
                boxShadow: activeTab === 'franchise' ? 'var(--gs-shadow-sm)' : 'none',
              }}
            >
              Franchise
            </button>
          </div>

          {activeTab === 'search' && (
            <>
              {/* Page Header */}
              <PageHeader
                title="Bedriftssøk"
                subtitle={`${totalFiltered || 0} bedrifter funnet`}
                date={dateStr}
                onShare={() => console.log('Share report')}
                onExport={() => console.log('Export')}
              />

              {/* Stats Grid */}
              {!loading && companies.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    title="Bedrifter funnet"
                    value={totalFiltered || 0}
                    subtitle={`${totalCompanies} på denne siden`}
                    icon={Icons.building}
                    color="lime"
                  />
                  <StatCard
                    title="Total aksjekapital"
                    value={new Intl.NumberFormat('no-NO', {
                      style: 'currency',
                      currency: 'NOK',
                      minimumFractionDigits: 0,
                    }).format(totalCapital)}
                    subtitle={`Gjennomsnitt: ${new Intl.NumberFormat('no-NO', {
                      style: 'currency',
                      currency: 'NOK',
                      minimumFractionDigits: 0,
                    }).format(avgCapital)}`}
                    icon={Icons.dollar}
                    color="blue"
                  />
                  <StatCard
                    title="Favoritter"
                    value={favoriteCount}
                    subtitle="Lagret for oppfølging"
                    icon={Icons.star}
                    color="orange"
                    onClick={() => console.log('Show favorites')}
                  />
                  <StatCard
                    title="Aktive søk"
                    value={companies.length > 0 ? '1' : '0'}
                    subtitle={companies.length > 0 ? 'Søk aktiv' : 'Ingen aktive søk'}
                    icon={Icons.funnel}
                    color="green"
                  />
                </div>
              )}

              {/* Search Filters */}
              <div className="mb-6">
                <SearchFiltersComponent onSearch={handleSearch} loading={loading} />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="mb-6 rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div style={{ color: 'var(--gs-accent-red)' }}>{Icons.warning}</div>
                  <p style={{ color: 'var(--gs-accent-red)' }}>{error}</p>
                </div>
              )}

              {/* Legacy Statistics (hidden for now, use new stat cards) */}
              {false && !loading && companies.length > 0 && (
                <Statistics companies={companies} totalFiltered={totalFiltered} />
              )}

              {/* Company List */}
              <CompanyList
                companies={companies}
                loading={loading}
                onViewDetails={handleViewDetails}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />

              {/* Pagination */}
              {!loading && companies.length > 0 && pagination && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.number || 0}
                    totalPages={pagination.totalPages || 1}
                    totalElements={pagination.totalElements || 0}
                    onNext={nextPage}
                    onPrev={prevPage}
                    hasNext={hasNext}
                    hasPrev={hasPrev}
                  />
                </div>
              )}

              {/* Company Details Modal */}
              {selectedOrgnr && (
                <CompanyDetails orgnr={selectedOrgnr} onClose={handleCloseDetails} />
              )}
            </>
          )}

          {activeTab === 'franchise' && (
            <>
              <PageHeader
                title="Franchise Eierskifte"
                subtitle="Analyser eierskifter i franchisekjeder"
              />
              <FranchiseEierskifteTool />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
