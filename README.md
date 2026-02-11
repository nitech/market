# Brønnøysundregistrene Dashboard

En dashboard-app for å søke og analysere bedrifter fra Brønnøysundregistrene. Appen er designet for market research og candidate qualification.

## Funksjoner

- **Søkefiltre**: Filtrer på minimums aksjekapital, registreringsdato, organisasjonsform og navn
- **Bedriftsliste**: Vis 100 bedrifter per side med relevante opplysninger
- **Daglig leder**: Automatisk henting av daglig leder for hver bedrift
- **Paginering**: Naviger gjennom resultater
- **Detaljvisning**: Se full informasjon om en bedrift
- **Eksport**: Last ned resultater som CSV eller JSON
- **Statistikk**: Oversikt over resultater og gjennomsnittlig aksjekapital

## Teknisk Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 18
- **Backend**: Next.js API Routes (serverless)
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Installasjon

1. Installer dependencies:
```bash
npm install
```

2. Start utviklingsserveren:
```bash
npm run dev
```

Appen kjører på http://localhost:3000

## Bruk

1. Åpne http://localhost:3000 i nettleseren
2. Sett ønskede filtre (minimums aksjekapital er satt til 50000 som standard)
3. Klikk "Søk" for å hente resultater
4. Bruk paginering for å navigere gjennom resultater
5. Klikk "Detaljer" på en bedrift for å se full informasjon
6. Bruk eksport-knappene for å laste ned resultater

## API

Next.js API Routes fungerer som en proxy til Brønnøysundregistrene API:
- `GET /api/search` - Søk etter bedrifter med filtre
- `GET /api/companies/[orgnr]` - Hent detaljer om en bedrift
- `GET /api/companies/[orgnr]/roles` - Hent roller for en bedrift

## Deployment

### Vercel (Anbefalt)

1. Push koden til GitHub
2. Importer prosjektet i Vercel
3. Vercel vil automatisk detektere Next.js og deploye

```bash
# Bygg lokalt
npm run build

# Start produksjonsserver
npm start
```

## Notater

- API-et støtter ikke direkte filtrering på aksjekapital, så filtreringen skjer i backend etter henting
- Roller (daglig leder) hentes for hver bedrift i resultatlisten
- Maks 100 resultater per side (API-begrensning)

