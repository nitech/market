// Frontend types (re-export from server types for consistency)
import type {
  Enhet,
  CompanyWithRoles as ServerCompanyWithRoles,
  SearchFilters,
  Address,
  Capital,
  Naeringskode,
  Organisasjonsform,
  Person,
} from '../server/types';

export type {
  Enhet,
  SearchFilters,
  Address,
  Capital,
  Naeringskode,
  Organisasjonsform,
  Person,
};

export type CompanyWithRoles = ServerCompanyWithRoles;

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

