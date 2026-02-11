import { Elysia } from 'elysia';
import type { SearchFilters, EnheterResponse, RollerResponse, CompanyWithRoles, Enhet } from '../types';

const BRREG_API_BASE = 'https://data.brreg.no/enhetsregisteret/api';

// Helper function to find daglig leder from roles
function findDagligLeder(rollerResponse: RollerResponse): { navn?: string } | undefined {
  if (!rollerResponse.rollegrupper) return undefined;

  for (const gruppe of rollerResponse.rollegrupper) {
    if (!gruppe.roller) continue;
    
    for (const rolle of gruppe.roller) {
      // Check for daglig leder role types
      // DAGL = Daglig leder
      // DAGLØ = Daglig leder (utenlands)
      // DAGLS = Daglig leder (styre)
      const rolleKode = rolle.type?.kode;
      
      // Also check for lowercase variants in case API returns them
      const normalizedKode = rolleKode?.toUpperCase();
      
      if (normalizedKode === 'DAGL' || normalizedKode === 'DAGLØ' || normalizedKode === 'DAGLS') {
        // Try to get name from person first
        if (rolle.person) {
          let nameParts: string[] = [];
          
          // Check if person.navn is an object with fornavn/etternavn
          if (rolle.person.navn && typeof rolle.person.navn === 'object' && !Array.isArray(rolle.person.navn)) {
            const navnObj = rolle.person.navn as { fornavn?: string; mellomnavn?: string; etternavn?: string };
            nameParts = [
              navnObj.fornavn,
              navnObj.mellomnavn,
              navnObj.etternavn
            ].filter(Boolean).filter(part => typeof part === 'string') as string[];
          }
          
          // If we didn't get name from person.navn object, try direct properties
          if (nameParts.length === 0) {
            nameParts = [
              rolle.person.fornavn,
              rolle.person.mellomnavn,
              rolle.person.etternavn
            ].filter(Boolean).filter(part => typeof part === 'string') as string[];
          }
          
          // If we have name parts, join them
          if (nameParts.length > 0) {
            const navn = nameParts.join(' ').trim();
            if (navn.length > 0) {
              return { navn };
            }
          }
          
          // Fallback: try person.navn if it's a string
          if (rolle.person.navn && typeof rolle.person.navn === 'string') {
            const navn = rolle.person.navn.trim();
            if (navn.length > 0) {
              return { navn };
            }
          }
        }
        // Fallback to enhet name if person name not available
        if (rolle.enhet?.navn) {
          const enhetNavn = typeof rolle.enhet.navn === 'string' 
            ? rolle.enhet.navn 
            : String(rolle.enhet.navn || '');
          if (enhetNavn.trim().length > 0) {
            return { navn: enhetNavn.trim() };
          }
        }
      }
    }
  }
  return undefined;
}

// Helper to fetch roles for a company
async function fetchRoles(orgnr: string): Promise<{ navn?: string } | undefined> {
  try {
    const url = `${BRREG_API_BASE}/enheter/${orgnr}/roller`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.brreg.enhetsregisteret.rolle.v1+json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch roles for ${orgnr}: ${response.status} ${response.statusText}`);
      return undefined;
    }
    
    const data: RollerResponse = await response.json();
    
    // Debug: Log the full response structure for DAGL roles
    if (!data.rollegrupper || data.rollegrupper.length === 0) {
      console.log(`No rollegrupper found for ${orgnr}`);
      return undefined;
    }
    
    // Debug: Log all role types found and their person data
    const allRoleTypes: string[] = [];
    const daglRoles: any[] = [];
    data.rollegrupper.forEach(gruppe => {
      gruppe.roller?.forEach(rolle => {
        if (rolle.type?.kode) {
          allRoleTypes.push(rolle.type.kode);
          
          // Log detailed info for DAGL roles
          const normalizedKode = rolle.type.kode.toUpperCase();
          if (normalizedKode === 'DAGL' || normalizedKode === 'DAGLØ' || normalizedKode === 'DAGLS') {
            daglRoles.push({
              rolleKode: rolle.type.kode,
              person: rolle.person,
              enhet: rolle.enhet,
            });
          }
        }
      });
    });
    console.log(`Role types found for ${orgnr}:`, allRoleTypes);
    
    if (daglRoles.length > 0) {
      console.log(`DAGL role details for ${orgnr}:`, JSON.stringify(daglRoles, null, 2));
    }
    
    const result = findDagligLeder(data);
    
    if (result && 'navn' in result && result.navn) {
      console.log(`Found daglig leder for ${orgnr}: ${result.navn}`);
      return result;
    }
    
    console.log(`No daglig leder found for ${orgnr} (checked for DAGL, DAGLØ, DAGLS)`);
    return undefined;
  } catch (error) {
    console.error(`Error fetching roles for ${orgnr}:`, error);
    return undefined;
  }
}

export const apiRoutes = new Elysia({ prefix: '/api' })
  .get('/search', async ({ query }) => {
    try {
      const filters: SearchFilters = {
        minAksjekapital: query.minAksjekapital ? Number(query.minAksjekapital) : 50000,
        fraRegistreringsdato: query.fraRegistreringsdato as string,
        tilRegistreringsdato: query.tilRegistreringsdato as string,
        organisasjonsform: query.organisasjonsform ? (query.organisasjonsform as string).split(',') : undefined,
        navn: query.navn as string,
        inkluderNaeringskoder: query.inkluderNaeringskoder ? (query.inkluderNaeringskoder as string).split(',').filter(s => s.trim().length > 0) : (query.inkluderNaeringskoder === '' ? [] : undefined),
        ekskluderNaeringskoder: query.ekskluderNaeringskoder ? (query.ekskluderNaeringskoder as string).split(',').filter(s => s.trim().length > 0) : (query.ekskluderNaeringskoder === '' ? [] : undefined),
        page: query.page ? Number(query.page) : 0,
        size: query.size ? Number(query.size) : 100,
      };

      // Build query parameters for Brønnøysundregistrene API
      // Send all filters that the API supports directly to Brreg for server-side filtering
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
      
      // Send naeringskode parameter to API when we have include filters
      // This lets the API do server-side filtering, which is more efficient.
      // Note: API supports exact næringskode matching, but we still do client-side
      // pattern matching below for prefix patterns (e.g., "47" matches "47.11")
      // and for exclude filters (which API doesn't support)
      if (filters.inkluderNaeringskoder && filters.inkluderNaeringskoder.length > 0) {
        params.append('naeringskode', filters.inkluderNaeringskoder.join(','));
      }
      
      // Use maximum page size to fetch all results at once (Brreg API supports up to 100 per page)
      params.append('page', '0');
      params.append('size', '100');
      params.append('sort', 'registreringsdatoEnhetsregisteret,DESC');

      // Log the API call for debugging
      console.log('Filters sent to Brreg API:', {
        fraRegistreringsdato: filters.fraRegistreringsdato,
        tilRegistreringsdato: filters.tilRegistreringsdato,
        organisasjonsform: filters.organisasjonsform,
        navn: filters.navn,
        naeringskode: filters.inkluderNaeringskoder,
      });
      console.log('Filters that must be applied client-side:', {
        minAksjekapital: filters.minAksjekapital,
        ekskluderNaeringskoder: filters.ekskluderNaeringskoder,
      });

      // Fetch all pages from Brreg API
      let allEnheter: Enhet[] = [];
      let brregPage = 0;
      let hasMorePages = true;
      let lastResponseLinks: EnheterResponse['_links'] | undefined;
      const maxPages = 100; // Safety limit to avoid infinite loops

      while (hasMorePages && brregPage < maxPages) {
        params.set('page', String(brregPage));
        const apiUrl = `${BRREG_API_BASE}/enheter?${params.toString()}`;
        
        if (brregPage === 0) {
          console.log('Brreg API call (first page):', apiUrl);
        }

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
        
        // Save links from last response
        if (data._links) {
          lastResponseLinks = data._links;
        }
        
        if (pageEnheter.length === 0) {
          hasMorePages = false;
        } else {
          allEnheter = [...allEnheter, ...pageEnheter];
          
          // Check if there are more pages
          const totalPages = data.page?.totalPages || 0;
          hasMorePages = brregPage + 1 < totalPages;
          brregPage++;
          
          // If we got less than 100 results, we've reached the last page
          if (pageEnheter.length < 100) {
            hasMorePages = false;
          }
        }
      }

      console.log(`Fetched ${allEnheter.length} companies from Brreg API across ${brregPage} page(s)`);
      
      // Filter by minimum aksjekapital (API doesn't support this directly)
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
        
        // Handle patterns like "47", "47.xx", "70.10"
        if (trimmedPattern.includes('.')) {
          // Exact match for patterns like "70.10" - matches 70.10, 70.10.1, etc.
          return naeringskode.startsWith(trimmedPattern);
        } else {
          // Match prefix for patterns like "47" (matches 47.xx, 47.11, 47.19, etc.)
          // This matches codes that start with "47." or are exactly "47"
          return naeringskode.startsWith(trimmedPattern + '.') || naeringskode === trimmedPattern;
        }
      };

      // Filter by næringskoder
      // First apply exclude filter (remove unwanted codes)
      if (filters.ekskluderNaeringskoder && filters.ekskluderNaeringskoder.length > 0) {
        filteredEnheter = filteredEnheter.filter(enhet => {
          const hovedkode = enhet.naeringskode1?.kode;
          if (!hovedkode) return true; // Include if no næringskode
          
          // Check if any of the exclude patterns match
          const shouldExclude = filters.ekskluderNaeringskoder!.some(pattern => 
            matchesNaeringskode(hovedkode, pattern)
          );
          
          return !shouldExclude;
        });
      }

      // Apply include filter only if we didn't send it to API
      // If we sent inkluderNaeringskoder to API, it's already filtered server-side
      // But we still need to do pattern matching for prefix patterns (e.g., "47" matches "47.11")
      // since API does exact matching, not prefix matching
      if (filters.inkluderNaeringskoder && filters.inkluderNaeringskoder.length > 0) {
        filteredEnheter = filteredEnheter.filter(enhet => {
          const hovedkode = enhet.naeringskode1?.kode;
          if (!hovedkode) return false; // Exclude if no næringskode when include filter is active
          
          // Check if any of the include patterns match
          // This handles prefix patterns that API might not catch (e.g., "47" should match "47.11")
          const matches = filters.inkluderNaeringskoder!.some(pattern => 
            matchesNaeringskode(hovedkode, pattern)
          );
          
          return matches;
        });
      }

      // Sort by priority næringskoder first
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
          
          // If both have priority, sort by priority index (lower = higher priority)
          if (aPriority !== -1 && bPriority !== -1) {
            return aPriority - bPriority;
          }
          // Prioritized items come first
          if (aPriority !== -1) return -1;
          if (bPriority !== -1) return 1;
          return 0;
        });
      }

      // Debug: Log filtered count before fetching roles
      console.log(`Filtered ${filteredEnheter.length} companies after næringskode filtering`);

      // Calculate correct pagination based on filtered results
      const totalFiltered = filteredEnheter.length;
      const pageSize = filters.size || 100;
      const currentPage = filters.page || 0;
      const totalPages = Math.ceil(totalFiltered / pageSize);

      // Fetch roles for each company in parallel (limit to avoid too many requests)
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

      return {
        companies: companiesWithRoles,
        pagination: {
          number: currentPage,
          size: pageSize,
          totalPages: totalPages,
          totalElements: totalFiltered,
        },
        links: lastResponseLinks,
        totalFiltered: totalFiltered,
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        companies: [],
        pagination: { number: 0, size: 100, totalPages: 0, totalElements: 0 },
      };
    }
  })
  .get('/companies/:orgnr', async ({ params }) => {
    try {
      const response = await fetch(`${BRREG_API_BASE}/enheter/${params.orgnr}`, {
        headers: {
          'Accept': 'application/vnd.brreg.enhetsregisteret.enhet.v2+json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })
  .get('/companies/:orgnr/roles', async ({ params }) => {
    try {
      const response = await fetch(`${BRREG_API_BASE}/enheter/${params.orgnr}/roller`, {
        headers: {
          'Accept': 'application/vnd.brreg.enhetsregisteret.rolle.v1+json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: RollerResponse = await response.json();
      const dagligLeder = findDagligLeder(data);
      
      return {
        roles: data,
        dagligLeder,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

