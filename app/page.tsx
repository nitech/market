'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { DevelopmentBoard } from '@/app/components/DevelopmentBoard';
import { AdminTenantsPanel } from '@/app/components/AdminTenantsPanel';
import {
  SalesFlowBoard,
  createDefaultFlowData,
  normalizeFlowData,
  type CustomerFlowData,
  type FlowCompany,
} from '@/app/components/SalesFlowBoard';
import { SettingsModal } from '@/app/components/SettingsModal';
import { useCompanies } from '@/app/hooks/useCompanies';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useAuth } from '@/app/hooks/useAuth';
import { useTenantWorkspace } from '@/app/hooks/useTenantWorkspace';
import type { CompanyWithRoles, SearchFilters } from '@/server/types';

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
  const [activeNavItem, setActiveNavItem] = useState('search');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerFlow, setCustomerFlow] = useState<CustomerFlowData>(createDefaultFlowData);

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
  const { user, isAdmin } = useAuth();
  const { tenant } = useTenantWorkspace();
  const [selectedOrgnr, setSelectedOrgnr] = useState<string | null>(null);
  const flowStorageKey = user?.uid ? `sevenfold-customer-flow:${user.uid}` : null;

  const handleSearch = (filters: SearchFilters) => {
    search(filters);
  };

  const handleViewDetails = (orgnr: string) => {
    setSelectedOrgnr(orgnr);
  };

  const handleCloseDetails = () => {
    setSelectedOrgnr(null);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!flowStorageKey) {
        setCustomerFlow(createDefaultFlowData());
        return;
      }

      try {
        const raw = localStorage.getItem(flowStorageKey);
        if (!raw) {
          setCustomerFlow(createDefaultFlowData());
          return;
        }
        setCustomerFlow(normalizeFlowData(JSON.parse(raw)));
      } catch {
        setCustomerFlow(createDefaultFlowData());
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [flowStorageKey]);

  useEffect(() => {
    if (!flowStorageKey) {
      return;
    }
    localStorage.setItem(flowStorageKey, JSON.stringify(customerFlow));
  }, [customerFlow, flowStorageKey]);

  const qualifyStageId = customerFlow.stages[0]?.id;
  const qualifyOrgnrs = useMemo(() => {
    if (!qualifyStageId) {
      return new Set<string>();
    }
    return new Set((customerFlow.companiesByStage[qualifyStageId] ?? []).map((company) => company.orgnr));
  }, [customerFlow, qualifyStageId]);

  const handleAddToQualify = (company: CompanyWithRoles) => {
    setCustomerFlow((prev) => {
      const firstStageId = prev.stages[0]?.id;
      if (!firstStageId) {
        return prev;
      }

      // Prevent duplicates across all stages.
      for (const stage of prev.stages) {
        if ((prev.companiesByStage[stage.id] ?? []).some((item) => item.orgnr === company.organisasjonsnummer)) {
          return prev;
        }
      }

      const flowCompany: FlowCompany = {
        orgnr: company.organisasjonsnummer,
        name: company.navn || 'Ukjent bedrift',
        addedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        companiesByStage: {
          ...prev.companiesByStage,
          [firstStageId]: [flowCompany, ...(prev.companiesByStage[firstStageId] ?? [])],
        },
      };
    });
  };

  // Calculate stats
  const totalCompanies = companies.length;
  const totalCapital = companies.reduce((sum, c) => sum + (c.kapital?.belop || 0), 0);
  const avgCapital = totalCompanies > 0 ? totalCapital / totalCompanies : 0;
  const favoriteCount = favorites.length;

  // Get account label for settings modal
  const accountLabel = user?.email || user?.displayName || 'Ukjent bruker';
  const developmentUserId = user?.uid || 'anonymous';
  const developmentUserName = user?.displayName || user?.email || 'Ukjent bruker';
  const franchiseEnabledForTenant = Boolean(tenant?.features.franchiseSearchEnabled);

  useEffect(() => {
    if (!franchiseEnabledForTenant && activeNavItem === 'franchise') {
      setActiveNavItem('search');
    }
    if (!isAdmin && activeNavItem === 'admin') {
      setActiveNavItem('search');
    }
    if (activeNavItem === 'company') {
      setActiveNavItem('search');
    }
  }, [activeNavItem, franchiseEnabledForTenant, isAdmin]);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--gs-bg-primary)' }}>
      {/* Sidebar - Desktop (always visible) + Mobile (drawer) */}
      <Sidebar
        activeItem={activeNavItem}
        onNavigate={(id) => {
          setActiveNavItem(id);
          setSelectedOrgnr(null);
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isMobile={true}
        showFranchise={franchiseEnabledForTenant}
        showAdmin={isAdmin}
      />

      {/* Desktop Sidebar - Separate instance for desktop */}
      <div className="hidden lg:block">
        <Sidebar
          activeItem={activeNavItem}
          onNavigate={(id) => {
            setActiveNavItem(id);
            setSelectedOrgnr(null);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
          showFranchise={franchiseEnabledForTenant}
          showAdmin={isAdmin}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          onSearch={(query) => console.log('Search:', query)} 
          onMenuClick={() => setMobileMenuOpen(true)}
          activeNavItem={activeNavItem}
          showFranchise={franchiseEnabledForTenant}
          showAdmin={isAdmin}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Søk View */}
          {activeNavItem === 'search' && (
            <>
              <PageHeader
                title="Bedriftssøk"
                subtitle={`${totalFiltered || 0} bedrifter funnet`}
              />

              {/* Stats Grid - Horizontal scroll on mobile */}
              {!loading && companies.length > 0 && (
                <div className="relative mb-4 sm:mb-6">
                  <div 
                    className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 scrollbar-hide"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                    }}
                  >
                    <div className="flex-shrink-0 w-[140px] sm:w-auto">
                      <StatCard
                        title="Bedrifter"
                        value={totalFiltered || 0}
                        subtitle={`${totalCompanies} på siden`}
                        icon={Icons.building}
                        color="lime"
                      />
                    </div>
                    <div className="flex-shrink-0 w-[140px] sm:w-auto">
                      <StatCard
                        title="Aksjekapital"
                        value={new Intl.NumberFormat('no-NO', {
                          style: 'currency',
                          currency: 'NOK',
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(totalCapital)}
                        subtitle={`Snitt: ${new Intl.NumberFormat('no-NO', {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(avgCapital)}`}
                        icon={Icons.dollar}
                        color="blue"
                      />
                    </div>
                    <div className="flex-shrink-0 w-[140px] sm:w-auto">
                      <StatCard
                        title="Favoritter"
                        value={favoriteCount}
                        subtitle="Lagret"
                        icon={Icons.star}
                        color="orange"
                        onClick={() => console.log('Show favorites')}
                      />
                    </div>
                    <div className="flex-shrink-0 w-[140px] sm:w-auto">
                      <StatCard
                        title="Aktive søk"
                        value={companies.length > 0 ? '1' : '0'}
                        subtitle={companies.length > 0 ? 'Aktiv' : 'Ingen'}
                        icon={Icons.funnel}
                        color="green"
                      />
                    </div>
                  </div>
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

              {/* Table Actions */}
              {!loading && companies.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm" style={{ color: 'var(--gs-text-tertiary)' }}>
                      Viser {companies.length} av {totalFiltered} bedrifter
                    </span>
                  </div>
                  <ExportButton companies={companies} variant="button" />
                </div>
              )}

              {/* Company List */}
              <CompanyList
                companies={companies}
                loading={loading}
                onViewDetails={handleViewDetails}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onAddToQualify={handleAddToQualify}
                qualifyOrgnrs={qualifyOrgnrs}
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

          {/* Flyt View */}
          {activeNavItem === 'flow' && (
            <>
              <PageHeader
                title="Kundeflyt"
                subtitle="Bygg og rediger egen flyt basert på standarden Kvalifiser → Berik → Salg"
              />
              <SalesFlowBoard flow={customerFlow} onFlowChange={setCustomerFlow} />
            </>
          )}

          {/* Franchise View */}
          {activeNavItem === 'franchise' && (
            <>
              <PageHeader
                title="Franchise Eierskifte"
                subtitle="Analyser eierskifter i franchisekjeder"
              />
              {franchiseEnabledForTenant ? (
                <FranchiseEierskifteTool />
              ) : (
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'var(--gs-bg-card)',
                    border: '1px solid var(--gs-border-default)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--gs-text-secondary)' }}>
                    Franchise-søk er ikke aktivert for bedriften din ennå. Kontakt administrator.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Utvikling View */}
          {activeNavItem === 'development' && (
            <>
              <PageHeader
                title="Utvikling"
                subtitle="Kanbanboard for brukerinnspill og forbedringer"
              />
              <DevelopmentBoard key={developmentUserId} userId={developmentUserId} userName={developmentUserName} />
            </>
          )}

          {/* Other menu items - Placeholder */}
          {activeNavItem === 'admin' && (
            <>
              <PageHeader
                title="Administrasjon"
                subtitle="Administrer kunder, brukere og funksjonalitet per bedrift"
              />
              <AdminTenantsPanel />
            </>
          )}

          {/* Other menu items - Placeholder */}
          {activeNavItem === 'territory' && (
            <>
              <PageHeader
                title="Territorium"
                subtitle="Oversikt over geografiske områder"
              />
              <div
                className="rounded-xl p-12 flex flex-col items-center justify-center"
                style={{
                  background: 'var(--gs-bg-card)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                <div style={{ color: 'var(--gs-text-tertiary)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" x2="22" y1="12" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <p className="mt-4 text-base font-medium" style={{ color: 'var(--gs-text-secondary)' }}>
                  Territorium-funksjonen kommer snart
                </p>
              </div>
            </>
          )}

          {activeNavItem === 'network' && (
            <>
              <PageHeader
                title="Nettverk"
                subtitle="Ditt profesjonelle nettverk"
              />
              <div
                className="rounded-xl p-12 flex flex-col items-center justify-center"
                style={{
                  background: 'var(--gs-bg-card)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                <div style={{ color: 'var(--gs-text-tertiary)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
                    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
                  </svg>
                </div>
                <p className="mt-4 text-base font-medium" style={{ color: 'var(--gs-text-secondary)' }}>
                  Nettverk-funksjonen kommer snart
                </p>
              </div>
            </>
          )}

          {activeNavItem === 'team' && (
            <>
              <PageHeader
                title="Team"
                subtitle="Administrer teammedlemmer"
              />
              <div
                className="rounded-xl p-12 flex flex-col items-center justify-center"
                style={{
                  background: 'var(--gs-bg-card)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                <div style={{ color: 'var(--gs-text-tertiary)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p className="mt-4 text-base font-medium" style={{ color: 'var(--gs-text-secondary)' }}>
                  Team-funksjonen kommer snart
                </p>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      {user && (
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={user}
          accountLabel={accountLabel}
        />
      )}
    </div>
  );
}
