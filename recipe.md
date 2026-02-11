# Brønnøysundregistrene Dashboard - Oppsummering

## Prosjektoppsett

### Teknisk Stack
- **Backend**: Bun runtime med Elysia framework
- **Frontend**: React 18 med TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Type Safety**: Full TypeScript support

### Prosjektstruktur
```
.
├── server/
│   ├── index.ts          # Bun server entry point
│   ├── routes/
│   │   └── api.ts        # API routes til Brønnøysundregistrene
│   └── types.ts          # TypeScript typer for API responses
├── src/
│   ├── components/       # React komponenter
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Hovedkomponent
│   └── main.tsx          # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Backend API

### Server
- **Port**: 3000
- **Framework**: Elysia
- **CORS**: Aktivert for alle origins

### API Endpoints

#### `GET /api/search`
Hovedendepunkt for å søke etter bedrifter.

**Query Parameters:**
- `minAksjekapital` (number): Minimums aksjekapital i NOK (standard: 50000)
- `fraRegistreringsdato` (string): Fra dato i ISO-format (YYYY-MM-DD)
- `tilRegistreringsdato` (string): Til dato i ISO-format (YYYY-MM-DD)
- `organisasjonsform` (string): Kommaseparert liste (f.eks. "AS,ASA")
- `navn` (string): Søk på bedriftsnavn
- `inkluderNaeringskoder` (string): Kommaseparert liste av næringskoder (f.eks. "47,56,62")
- `ekskluderNaeringskoder` (string): Kommaseparert liste av næringskoder (f.eks. "64,70.10")
- `page` (number): Sidenummer (standard: 0)
- `size` (number): Antall resultater per side (standard: 100)

**Response:**
```typescript
{
  companies: CompanyWithRoles[];
  pagination?: {
    number: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
  links?: {
    self?: { href: string };
    first?: { href: string };
    prev?: { href: string };
    next?: { href: string };
    last?: { href: string };
  };
  totalFiltered: number;
  error?: string;
}
```

**Funksjonalitet:**
- Henter bedrifter fra Brønnøysundregistrene API (`/api/enheter`)
- Filtrerer på minimums aksjekapital (client-side, da API ikke støtter dette direkte)
- Filtrerer på næringskoder (inkluder/ekskluder)
- Henter daglig leder for hver bedrift via `/api/enheter/{orgnr}/roller`
- Sorterer resultater med prioriterte næringskoder først
- Støtter paginering (100 resultater per side)

#### `GET /api/companies/:orgnr`
Henter detaljer om en spesifikk bedrift.

**Response:**
```typescript
Enhet // Full bedriftsopplysninger
```

#### `GET /api/companies/:orgnr/roles`
Henter roller for en bedrift, inkludert daglig leder.

**Response:**
```typescript
{
  roles: RollerResponse;
  dagligLeder?: { navn: string };
}
```

### Brønnøysundregistrene API Integration

**Base URL**: `https://data.brreg.no/enhetsregisteret/api`

**Endpoints brukt:**
- `GET /enheter` - Søk etter bedrifter
- `GET /enheter/{orgnr}` - Hent bedriftsdetaljer
- `GET /enheter/{orgnr}/roller` - Hent roller (daglig leder)

**API Headers:**
- `Accept: application/vnd.brreg.enhetsregisteret.enhet.v2+json` (for enheter)
- `Accept: application/vnd.brreg.enhetsregisteret.rolle.v1+json` (for roller)

**Begrensninger:**
- API-et støtter ikke direkte filtrering på aksjekapital
- API-et støtter ikke direkte filtrering på næringskode
- Maks 20 resultater per side direkte fra API
- Maks 10,000 resultater totalt fra direkte søk

**Løsning:**
- Filtrering på aksjekapital og næringskode gjøres på backend etter henting
- Henter bredere datasett og filtrerer lokalt
- Henter roller (daglig leder) for hver bedrift i parallell

## Frontend Funksjonalitet

### Søkefiltre

#### Grunnleggende filtre
- **Minimums aksjekapital**: Standardverdi 50,000 NOK
- **Registreringsdato**: Fra/til datoer i norsk format (dd.mm.yyyy)
- **Bedriftsnavn**: Fritekstsøk
- **Organisasjonsform**: Multi-select checkboxes
  - AS, ASA, BA, SA, SF, STI, FKF, KSA

#### Næringskode-filtre
**To-liste system med flytt-knapper:**

1. **Inkluder (Prioriter)**: Næringskoder som skal inkluderes og prioriteres
   - Standardverdier: 47, 56, 96, 43, 62
   - 47.xx – Butikkhandel
   - 56.xx – Servering
   - 96.xx – Personlige tjenester
   - 43.xx – Håndverk/bygg
   - 62.xx – IT/konsulent

2. **Ekskluder**: Næringskoder som skal ekskluderes
   - Standardverdier: 64, 70.10, 68.20, 46
   - 64.xx – Finans/holding
   - 70.10 – Hovedkontor
   - 68.20 – Eiendom/utleie
   - 46.xx – Engros uten ansatte

3. **Tilgjengelige**: Næringskoder som ikke er valgt i noen av listene

**Funksjonalitet:**
- Flytt-knapper (← →) for å flytte mellom lister
- Fjern-knapper (×) for å fjerne fra lister
- Prioriterte næringskoder vises først i resultatene

### Bedriftsliste (Tabellvisning)

**Kolonner:**
1. Favoritt (stjerne-ikon)
2. Navn
3. Organisasjonsnummer
4. Adresse
5. Daglig leder
6. Aksjekapital (formatert som NOK)
7. Registreringsdato (dd.mm.yyyy)
8. Næringskode
9. Handling (Detaljer-knapp)

**Funksjonalitet:**
- Full bredde tabell
- Responsiv med horisontal scrolling på små skjermer
- Hover-effekt på rader
- Favoritt-funksjonalitet (lagres i localStorage)

### Detaljvisning

Modal som viser full informasjon om en bedrift:
- Grunnleggende informasjon (org.nr, organisasjonsform, datoer)
- Kapital (beløp, antall aksjer, type, valuta)
- Forretningsadresse
- Næringskoder (hovednæring + 2-3)
- Kontaktinformasjon (e-post, telefon, mobil, hjemmeside)
- Antall ansatte

### Paginering

- 100 resultater per side
- Forrige/Neste knapper
- Viser nåværende side, totalt antall sider og totalt antall resultater

### Statistikk

Viser:
- Totalt antall resultater
- Gjennomsnittlig aksjekapital
- Antall bedrifter med registrert kapital

### Eksport

- **CSV-eksport**: Alle kolonner inkludert
- **JSON-eksport**: Full data struktur
- Filnavn inkluderer dato

### Favoritter

- Lagre/fjerne bedrifter som favoritter
- Lagres i localStorage
- Vises med stjerne-ikon i tabellen

## Dataformatering

### Datoer
- **Visning**: Norsk format (dd.mm.yyyy)
- **Input**: Norsk format (dd.mm.yyyy) i filterboksene
- **API**: Konverteres til ISO-format (YYYY-MM-DD) før sending

### Valuta
- Formatert som norsk krone (NOK)
- Eksempel: "kr 50 000"

### Daglig leder
- Hentes automatisk fra roller-endepunkt
- Håndterer både Person-objekter og navn-strings
- Vises som fullt navn

## Næringskode-filtrering

### Matching-logikk

**Pattern matching:**
- `"47"` matcher alle koder som starter med "47." (47.11, 47.19, etc.)
- `"70.10"` matcher eksakt kode eller koder som starter med "70.10"
- `"46"` matcher alle koder som starter med "46." (46.xx)

**Filtreringsrekkefølge:**
1. Ekskluder-filtrering (fjerner uønskede næringskoder)
2. Inkluder-filtrering (beholder kun ønskede næringskoder)
3. Sortering (prioriterte næringskoder først)

## Custom Hooks

### `useCompanies`
Håndterer datahenting og state for bedrifter:
- `companies`: Liste over bedrifter
- `loading`: Laster-status
- `error`: Feilmeldinger
- `pagination`: Pagineringsinfo
- `totalFiltered`: Totalt antall filtrerte resultater
- `search(filters)`: Søkefunksjon
- `nextPage()` / `prevPage()`: Navigasjon
- `hasNext` / `hasPrev`: Sjekk om flere sider

### `useFavorites`
Håndterer favoritt-funksjonalitet:
- `favorites`: Liste over favoritt-orgnumre
- `addFavorite(orgnr)`: Legg til favoritt
- `removeFavorite(orgnr)`: Fjern favoritt
- `isFavorite(orgnr)`: Sjekk om favoritt
- `toggleFavorite(orgnr)`: Toggle favoritt-status
- Lagres i localStorage

## TypeScript Typer

Alle typer er definert i `server/types.ts`:
- `Enhet`: Grunnleggende bedriftsopplysninger
- `CompanyWithRoles`: Enhet med daglig leder
- `SearchFilters`: Søkefiltre
- `Address`, `Capital`, `Naeringskode`, `Person`, etc.

## Kjøring

### Installasjon
```bash
bun install
```

### Utvikling
```bash
# Terminal 1 - Backend
bun run server

# Terminal 2 - Frontend
bun run dev:frontend
```

### Produksjon
```bash
bun run build
```

## Notater

- API-et støtter ikke direkte filtrering på aksjekapital eller næringskode
- Filtrering gjøres derfor på backend etter henting
- Roller (daglig leder) hentes for hver bedrift i parallell
- Maks 100 resultater per side (API-begrensning)
- Standardverdier for næringskoder er satt ved oppstart
- Datoer formateres til norsk format (dd.mm.yyyy)
- Favoritter lagres lokalt i nettleseren

