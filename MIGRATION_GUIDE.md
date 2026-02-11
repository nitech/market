# Migrasjon til Next.js

## Oversikt
Dette prosjektet migreres fra Vite + Elysia (Bun) til Next.js for enklere deployment på Vercel.

## Steg 1: Installer Next.js (✅ Gjort)
- Next.js er installert
- `next.config.js` er opprettet
- `tsconfig.json` er oppdatert

## Steg 2: Opprett Next.js API Routes

### `/app/api/search/route.ts`
Konverter `server/routes/api.ts` GET `/search` til Next.js Route Handler.

### `/app/api/companies/[orgnr]/route.ts`
Konverter `server/routes/api.ts` GET `/companies/:orgnr` til Next.js Route Handler.

### `/app/api/companies/[orgnr]/roles/route.ts`
Konverter `server/routes/api.ts` GET `/companies/:orgnr/roles` til Next.js Route Handler.

## Steg 3: Opprett hovedside
- `/app/page.tsx` - Hovedside med React-komponenter
- Flytt komponenter fra `src/components/` til `app/components/`
- Oppdater imports

## Steg 4: Oppdater package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## Steg 5: Oppdater imports
- Endre `import type { ... } from '../server/types'` til `import type { ... } from '@/server/types'`
- Oppdater alle relative imports

## Steg 6: Test og deploy
- Test lokalt med `npm run dev`
- Deploy til Vercel

