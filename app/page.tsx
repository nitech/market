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

export default function Home() {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Brønnøysundregistrene Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Søk og analyser bedrifter for market research og candidate qualification
          </p>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <SearchFiltersComponent onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
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
      </main>
    </div>
  );
}

