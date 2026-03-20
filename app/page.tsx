'use client';

import { useState } from 'react';
import { SearchFiltersComponent } from '@/app/components/SearchFilters';
import { CompanyList } from '@/app/components/CompanyList';
import { Pagination } from '@/app/components/Pagination';
import { CompanyDetails } from '@/app/components/CompanyDetails';
import { Statistics } from '@/app/components/Statistics';
import { ExportButton } from '@/app/components/ExportButton';
import { useCompanies } from '@/app/hooks/useCompanies';
import { useFavorites } from '@/app/hooks/useFavorites';
import type { SearchFilters } from '@/server/types';
import { FranchiseEierskifteTool } from '@/app/components/FranchiseEierskifteTool';
import { AuthControls } from '@/app/components/AuthControls';

export default function Home() {
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
    // Company details er knyttet til søk-resultater
    setSelectedOrgnr(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="border-b border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                7markets
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Søk og analyser bedrifter for market research og candidate qualification
              </p>
            </div>

            <div className="shrink-0 pt-1">
              <AuthControls />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex gap-2 rounded-lg bg-gray-200 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => switchTab('search')}
              className={[
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition',
                activeTab === 'search'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:shadow-md'
                  : 'bg-transparent text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
              ].join(' ')}
            >
              Søk
            </button>
            <button
              type="button"
              onClick={() => switchTab('franchise')}
              className={[
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition',
                activeTab === 'franchise'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:shadow-md'
                  : 'bg-transparent text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
              ].join(' ')}
            >
              Franchise
            </button>
          </div>
        </div>

        {activeTab === 'search' && (
          <>
            <SearchFiltersComponent onSearch={handleSearch} loading={loading} />

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {!loading && companies.length > 0 && (
              <>
                <Statistics companies={companies} totalFiltered={totalFiltered} />
                <ExportButton companies={companies} />
              </>
            )}

            <CompanyList
              companies={companies}
              loading={loading}
              onViewDetails={handleViewDetails}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />

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

            {selectedOrgnr && (
              <CompanyDetails orgnr={selectedOrgnr} onClose={handleCloseDetails} />
            )}
          </>
        )}

        {activeTab === 'franchise' && (
          <>
            <FranchiseEierskifteTool />
          </>
        )}
      </main>
    </div>
  );
}

