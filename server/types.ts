// Types for Brønnøysundregistrene API responses

export interface Address {
  adresse?: string[];
  postnummer?: string;
  poststed?: string;
  kommunenummer?: string;
  kommune?: string;
  landkode?: string;
  land?: string;
}

export interface Capital {
  belop?: number;
  antallAksjer?: number;
  type?: string;
  bundet?: number;
  valuta?: string;
  innbetalt?: number;
  fulltInnbetalt?: boolean;
  innfortDato?: string;
}

export interface Naeringskode {
  kode?: string;
  beskrivelse?: string;
}

export interface Organisasjonsform {
  kode?: string;
  beskrivelse?: string;
}

export interface Enhet {
  organisasjonsnummer: string;
  navn?: string;
  organisasjonsform?: Organisasjonsform;
  postadresse?: Address;
  forretningsadresse?: Address;
  registreringsdatoEnhetsregisteret?: string;
  stiftelsesdato?: string;
  registrertIMvaregisteret?: boolean;
  registrertIForetaksregisteret?: boolean;
  naeringskode1?: Naeringskode;
  naeringskode2?: Naeringskode;
  naeringskode3?: Naeringskode;
  kapital?: Capital;
  antallAnsatte?: number;
  hjemmeside?: string;
  epostadresse?: string;
  telefon?: string;
  mobil?: string;
}

export interface Person {
  fornavn?: string;
  mellomnavn?: string;
  etternavn?: string;
  navn?: string | {
    fornavn?: string;
    mellomnavn?: string;
    etternavn?: string;
  };
  fodselsdato?: string;
  erDoed?: boolean;
}

export interface Rolle {
  type?: {
    kode?: string;
    beskrivelse?: string;
  };
  person?: Person;
  enhet?: {
    organisasjonsnummer?: string;
    navn?: string;
  };
  valgtAv?: string;
  valgtAvType?: string;
  rekkefolge?: number;
}

export interface Rollegruppe {
  type?: {
    kode?: string;
    beskrivelse?: string;
  };
  roller?: Rolle[];
}

export interface RollerResponse {
  rollegrupper?: Rollegruppe[];
  _links?: {
    self?: { href?: string };
    enhet?: { href?: string };
  };
}

export interface EnheterResponse {
  _embedded?: {
    enheter?: Enhet[];
  };
  _links?: {
    self?: { href?: string };
    first?: { href?: string };
    prev?: { href?: string };
    next?: { href?: string };
    last?: { href?: string };
  };
  page?: {
    number?: number;
    size?: number;
    totalPages?: number;
    totalElements?: number;
  };
}

export interface SearchFilters {
  minAksjekapital?: number;
  fraRegistreringsdato?: string;
  tilRegistreringsdato?: string;
  organisasjonsform?: string[];
  navn?: string;
  page?: number;
  size?: number;
  inkluderNaeringskoder?: string[];
  ekskluderNaeringskoder?: string[];
}

export interface CompanyWithRoles extends Enhet {
  dagligLeder?: Person | { navn?: string };
}

// --- Underenheter / franchise-eierskifte ---

export interface Underenhet extends Enhet {
  // BRREG undenhet
  datoEierskifte?: string;
  // Hovedenhet (overordnet) sin orgnr
  overordnetEnhet?: string;
  // Underenheter bruker samme adresseformat som Enhet, men BRREG kan returnere feltene
  // via postadresse/forretningsadresse/beliggenhetsadresse (avhengig av endpoint og versjon)
  beliggenhetsadresse?: Address;
  oppstartsdato?: string;
  nedleggelsesdato?: string;
}

export interface UnderenheterResponse {
  _embedded?: {
    underenheter?: Underenhet[];
  };
  _links?: {
    self?: { href?: string };
    first?: { href?: string };
    prev?: { href?: string };
    next?: { href?: string };
    last?: { href?: string };
  };
  page?: {
    number?: number;
    size?: number;
    totalPages?: number;
    totalElements?: number;
  };
}

export interface FranchiseEierskifteItem {
  franchiseMatch: string;
  underenhet: {
    organisasjonsnummer: string;
    navn?: string;
    datoEierskifte?: string;
    // Kontakt/adressefelt (valgfritt - kan mangle)
    epostadresse?: string;
    telefon?: string;
    mobil?: string;
    hjemmeside?: string;
    postadresse?: Address;
    forretningsadresse?: Address;
    beliggenhetsadresse?: Address;
  };
  hovedenhet: {
    organisasjonsnummer: string;
    navn?: string;
  };
}

