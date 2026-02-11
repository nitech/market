// Frontend types (re-export from server types for consistency)
export type {
  Enhet,
  CompanyWithRoles,
  SearchFilters,
  Address,
  Capital,
  Naeringskode,
  Organisasjonsform,
  Person,
} from '../server/types';

export interface SearchResponse {
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

