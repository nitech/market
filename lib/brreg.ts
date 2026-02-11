import type { RollerResponse, EnheterResponse, Enhet, CompanyWithRoles, SearchFilters } from '@/server/types';

const BRREG_API_BASE = 'https://data.brreg.no/enhetsregisteret/api';

// Helper function to find daglig leder from roles
export function findDagligLeder(rollerResponse: RollerResponse): { navn?: string } | undefined {
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
export async function fetchRoles(orgnr: string): Promise<{ navn?: string } | undefined> {
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
    return findDagligLeder(data);
  } catch (error) {
    console.error(`Error fetching roles for ${orgnr}:`, error);
    return undefined;
  }
}

export { BRREG_API_BASE };

