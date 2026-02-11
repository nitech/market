import { NextRequest, NextResponse } from 'next/server';
import type { SearchFilters, EnheterResponse, CompanyWithRoles, Enhet } from '@/server/types';
import { BRREG_API_BASE, fetchRoles } from '@/lib/brreg';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: SearchFilters = {
      minAksjekapital: searchParams.get('minAksjekapital') ? Number(searchParams.get('minAksjekapital')) : 50000,
      fraRegistreringsdato: searchParams.get('fraRegistreringsdato') || undefined,
      tilRegistreringsdato: searchParams.get('tilRegistreringsdato') || undefined,
      organisasjonsform: searchParams.get('organisasjonsform') ? searchParams.get('organisasjonsform')!.split(',') : undefined,
      navn: searchParams.get('navn') || undefined,
      inkluderNaeringskoder: searchParams.get('inkluderNaeringskoder') ? searchParams.get('inkluderNaeringskoder')!.split(',').filter(s => s.trim().length > 0) : (searchParams.get('inkluderNaeringskoder') === '' ? [] : undefined),
      ekskluderNaeringskoder: searchParams.get('ekskluderNaeringskoder') ? searchParams.get('ekskluderNaeringskoder')!.split(',').filter(s => s.trim().length > 0) : (searchParams.get('ekskluderNaeringskoder') === '' ? [] : undefined),
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
      size: searchParams.get('size') ? Number(searchParams.get('size')) : 100,
    };

    // Build query parameters for Brønnøysundregistrene API
    const params = new URLSearchParams();
    
    if (filters.fraRegistreringsdato) {
      params.append('fraRegistreringsdatoEnhetsregisteret', filters.fraRegistreringsdato);
    }
    
    if (filters.tilRegistreringsdato) {
      params.append('tilRegistreringsdatoEnhetsregisteret', filters.tilRegistreringsdato);
    }
    
    if (filters.organisasjonsform && filters.organisasjonsform.length > 0) {
      params.append('organisasjonsform', filters.organisasjonsform.join(','));
    }
    
    if (filters.navn) {
      params.append('navn', filters.navn);
    }
    
    if (filters.inkluderNaeringskoder && filters.inkluderNaeringskoder.length > 0) {
      params.append('naeringskode', filters.inkluderNaeringskoder.join(','));
    }
    
    params.append('page', '0');
    params.append('size', '100');
    params.append('sort', 'registreringsdatoEnhetsregisteret,DESC');

    // Fetch all pages from Brreg API
    let allEnheter: Enhet[] = [];
    let brregPage = 0;
    let hasMorePages = true;
    let lastResponseLinks: EnheterResponse['_links'] | undefined;
    const maxPages = 100;

    while (hasMorePages && brregPage < maxPages) {
      params.set('page', String(brregPage));
      const apiUrl = `${BRREG_API_BASE}/enheter?${params.toString()}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.brreg.enhetsregisteret.enhet.v2+json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: EnheterResponse = await response.json();
      const pageEnheter = data._embedded?.enheter || [];
      
      if (data._links) {
        lastResponseLinks = data._links;
      }
      
      if (pageEnheter.length === 0) {
        hasMorePages = false;
      } else {
        allEnheter = [...allEnheter, ...pageEnheter];
        const totalPages = data.page?.totalPages || 0;
        hasMorePages = brregPage + 1 < totalPages;
        brregPage++;
        
        if (pageEnheter.length < 100) {
          hasMorePages = false;
        }
      }
    }

    // Filter by minimum aksjekapital
    let filteredEnheter = allEnheter;
    
    if (filters.minAksjekapital) {
      filteredEnheter = filteredEnheter.filter(enhet => {
        const kapital = enhet.kapital?.belop || 0;
        return kapital >= filters.minAksjekapital!;
      });
    }

    // Helper function to check if næringskode matches pattern
    const matchesNaeringskode = (naeringskode: string | undefined, pattern: string): boolean => {
      if (!naeringskode || !pattern) return false;
      const trimmedPattern = pattern.trim();
      if (!trimmedPattern) return false;
      
      if (trimmedPattern.includes('.')) {
        return naeringskode.startsWith(trimmedPattern);
      } else {
        return naeringskode.startsWith(trimmedPattern + '.') || naeringskode === trimmedPattern;
      }
    };

    // Filter by næringskoder - exclude first
    if (filters.ekskluderNaeringskoder && filters.ekskluderNaeringskoder.length > 0) {
      filteredEnheter = filteredEnheter.filter(enhet => {
        const hovedkode = enhet.naeringskode1?.kode;
        if (!hovedkode) return true;
        const shouldExclude = filters.ekskluderNaeringskoder!.some(pattern => 
          matchesNaeringskode(hovedkode, pattern)
        );
        return !shouldExclude;
      });
    }

    // Filter by næringskoder - include
    if (filters.inkluderNaeringskoder && filters.inkluderNaeringskoder.length > 0) {
      filteredEnheter = filteredEnheter.filter(enhet => {
        const hovedkode = enhet.naeringskode1?.kode;
        if (!hovedkode) return false;
        const matches = filters.inkluderNaeringskoder!.some(pattern => 
          matchesNaeringskode(hovedkode, pattern)
        );
        return matches;
      });
    }

    // Sort by priority næringskoder
    if (filters.inkluderNaeringskoder && filters.inkluderNaeringskoder.length > 0) {
      filteredEnheter.sort((a, b) => {
        const aCode = a.naeringskode1?.kode || '';
        const bCode = b.naeringskode1?.kode || '';
        const aPriority = filters.inkluderNaeringskoder!.findIndex(pattern => 
          matchesNaeringskode(aCode, pattern)
        );
        const bPriority = filters.inkluderNaeringskoder!.findIndex(pattern => 
          matchesNaeringskode(bCode, pattern)
        );
        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority;
        }
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        return 0;
      });
    }

    // Calculate pagination
    const totalFiltered = filteredEnheter.length;
    const pageSize = filters.size || 100;
    const currentPage = filters.page || 0;
    const totalPages = Math.ceil(totalFiltered / pageSize);

    // Fetch roles for each company in parallel
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const pageEnheter = filteredEnheter.slice(startIndex, endIndex);
    
    const companiesWithRoles: CompanyWithRoles[] = await Promise.all(
      pageEnheter.map(async (enhet) => {
        const dagligLeder = await fetchRoles(enhet.organisasjonsnummer);
        return {
          ...enhet,
          dagligLeder,
        };
      })
    );

    return NextResponse.json({
      companies: companiesWithRoles,
      pagination: {
        number: currentPage,
        size: pageSize,
        totalPages: totalPages,
        totalElements: totalFiltered,
      },
      links: lastResponseLinks,
      totalFiltered: totalFiltered,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      companies: [],
      pagination: { number: 0, size: 100, totalPages: 0, totalElements: 0 },
    }, { status: 500 });
  }
}

