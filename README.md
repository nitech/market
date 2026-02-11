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

- **Backend**: Bun runtime med Elysia
- **Frontend**: React med Vite
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Installasjon

1. Installer dependencies:
```bash
bun install
```

2. Start utviklingsserverne:

**Alternativ 1: Kjør i separate terminaler (anbefalt)**
```bash
# Terminal 1 - Backend server
bun run server

# Terminal 2 - Frontend
bun run dev:frontend
```

**Alternativ 2: Bruk dev:all (kan kreve ekstra konfigurasjon)**
```bash
bun run dev:all
```

Backend-serveren kjører på port 3000 og frontend på port 5173.

## Bruk

1. Åpne http://localhost:5173 i nettleseren
2. Sett ønskede filtre (minimums aksjekapital er satt til 50000 som standard)
3. Klikk "Søk" for å hente resultater
4. Bruk paginering for å navigere gjennom resultater
5. Klikk "Detaljer" på en bedrift for å se full informasjon
6. Bruk eksport-knappene for å laste ned resultater

## API

Backend-serveren fungerer som en proxy til Brønnøysundregistrene API:
- `GET /api/search` - Søk etter bedrifter med filtre
- `GET /api/companies/:orgnr` - Hent detaljer om en bedrift
- `GET /api/companies/:orgnr/roles` - Hent roller for en bedrift

## Notater

- API-et støtter ikke direkte filtrering på aksjekapital, så filtreringen skjer i backend etter henting
- Roller (daglig leder) hentes for hver bedrift i resultatlisten
- Maks 100 resultater per side (API-begrensning)

