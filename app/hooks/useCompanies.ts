import { useState, useEffect, useCallback } from 'react';
import type { SearchFilters, CompanyWithRoles } from '@/server/types';

interface SearchResponse {
  companies: CompanyWithRoles[];
  pagination?: {
    number?: number;
    size?: number;
    totalPages?: number;
    totalElements?: number;
  };
  links?: {
    self?: { href?: string };
    first?: { href?: string };
    prev?: { href?: string };
    next?: { href?: string };
    last?: { href?: string };
  };
  totalFiltered?: number;
  error?: string;
}

interface UseCompaniesReturn {
  companies: CompanyWithRoles[];
  loading: boolean;
  error: string | null;
  pagination: SearchResponse['pagination'];
  totalFiltered: number;
  search: (filters: SearchFilters) => Promise<void>;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: () => void;
  prevPage: () => void;
}

export function useCompanies(): UseCompaniesReturn {
  const [companies, setCompanies] = useState<CompanyWithRoles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<SearchResponse['pagination']>();
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    minAksjekapital: 50000,
    page: 0,
    size: 100,
    fraRegistreringsdato: (() => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return thirtyDaysAgo.toISOString().split('T')[0];
    })(),
    tilRegistreringsdato: new Date().toISOString().split('T')[0],
    organisasjonsform: ['AS'],
    inkluderNaeringskoder: ['47', '56', '96', '43', '62'],
    ekskluderNaeringskoder: [],
  });

  const search = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);

    try {
      const params = new URLSearchParams();
      
      if (filters.minAksjekapital) {
        params.append('minAksjekapital', String(filters.minAksjekapital));
      }
      
      if (filters.fraRegistreringsdato) {
        params.append('fraRegistreringsdato', filters.fraRegistreringsdato);
      }
      
      if (filters.tilRegistreringsdato) {
        params.append('tilRegistreringsdato', filters.tilRegistreringsdato);
      }
      
      if (filters.organisasjonsform && filters.organisasjonsform.length > 0) {
        params.append('organisasjonsform', filters.organisasjonsform.join(','));
      }
      
      if (filters.navn) {
        params.append('navn', filters.navn);
      }
      
      if (filters.inkluderNaeringskoder !== undefined) {
        params.append('inkluderNaeringskoder', filters.inkluderNaeringskoder.length > 0 ? filters.inkluderNaeringskoder.join(',') : '');
      }
      
      if (filters.ekskluderNaeringskoder !== undefined) {
        params.append('ekskluderNaeringskoder', filters.ekskluderNaeringskoder.length > 0 ? filters.ekskluderNaeringskoder.join(',') : '');
      }
      
      params.append('page', String(filters.page || 0));
      params.append('size', String(filters.size || 100));

      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setCompanies(data.companies || []);
      setPagination(data.pagination);
      setTotalFiltered(data.totalFiltered || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const nextPage = useCallback(() => {
    if (pagination && pagination.number !== undefined && pagination.totalPages !== undefined) {
      const nextPageNum = pagination.number + 1;
      if (nextPageNum < pagination.totalPages) {
        search({ ...currentFilters, page: nextPageNum });
      }
    }
  }, [pagination, currentFilters, search]);

  const prevPage = useCallback(() => {
    if (pagination && pagination.number !== undefined) {
      const prevPageNum = pagination.number - 1;
      if (prevPageNum >= 0) {
        search({ ...currentFilters, page: prevPageNum });
      }
    }
  }, [pagination, currentFilters, search]);

  const hasNext = pagination !== undefined && 
    pagination.number !== undefined && 
    pagination.totalPages !== undefined &&
    pagination.number < pagination.totalPages - 1;

  const hasPrev = pagination !== undefined && 
    pagination.number !== undefined && 
    pagination.number > 0;

  useEffect(() => {
    search(currentFilters);
  }, []);

  return {
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
  };
}

