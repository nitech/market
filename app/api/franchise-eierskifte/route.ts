import { NextRequest, NextResponse } from 'next/server';
import { BRREG_API_BASE } from '@/lib/brreg';
import type {
  FranchiseEierskifteItem,
  Underenhet,
  UnderenheterResponse,
  Enhet,
} from '@/server/types';
import * as nodePath from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const runtime = 'nodejs';

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function toTimeMaybe(dateString?: string): number {
  if (!dateString) return 0;
  const t = new Date(dateString).getTime();
  return Number.isFinite(t) ? t : 0;
}

function normalizeText(s?: string | null): string {
  return (s ?? '').trim().toLowerCase();
}

async function loadFranchisesFromCsv(): Promise<string[]> {
  // Resolve relative to this file, not process.cwd(). This is more reliable
  // in Next/Bun runtime environments.
  const routeFileDir = nodePath.dirname(fileURLToPath(import.meta.url));
  const csvPath = nodePath.resolve(routeFileDir, '../../../franchise-utvalgt.csv');

  let content: string;
  try {
    content = await readFile(csvPath, 'utf8');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Kunne ikke lese franchise-utvalgt.csv. Tried: ${csvPath}. Original error: ${msg}`
    );
  }

  // Each line may be:
  // - "FranchiseName" (current format)
  // - "FranchiseName;True" (older format)
  // We take everything before ';' and trim.
  const lines = content
    .split(/\r?\n/g)
    .map((l) => l.replace(/^\uFEFF/, '').trim())
    .filter(Boolean);

  const franchises = lines
    .map((line) => line.split(';')[0]?.trim())
    .filter(Boolean) as string[];

  // De-dupe after normalization (case-insensitive)
  const seen = new Set<string>();
  const result: string[] = [];
  for (const f of franchises) {
    const key = normalizeText(f);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(f);
  }
  return result;
}

async function fetchUnderenheterInWindow(params: {
  fromDatoEierskifte: string;
  tilDatoEierskifte: string;
  maxRecords: number;
}): Promise<{ items: Underenhet[]; truncated: boolean }> {
  const { fromDatoEierskifte, tilDatoEierskifte, maxRecords } = params;

  const size = 100;
  let page = 0;
  let truncated = false;
  const all: Underenhet[] = [];

  while (true) {
    const url = new URL(`${BRREG_API_BASE}/underenheter`);
    // BRREG bruker norsk parameter: `fraDatoEierskifte` (ikke `fromDatoEierskifte`)
    url.searchParams.set('fraDatoEierskifte', fromDatoEierskifte);
    url.searchParams.set('tilDatoEierskifte', tilDatoEierskifte);
    url.searchParams.set('page', String(page));
    url.searchParams.set('size', String(size));

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/vnd.brreg.enhetsregisteret.underenhet.v2+json',
      },
    });

    if (!response.ok) {
      let bodySnippet = '';
      try {
        const text = await response.text();
        bodySnippet = text ? ` Body: ${text.slice(0, 500)}` : '';
      } catch {
        // ignore - we already have status
      }
      throw new Error(
        `BRREG underenheter error: ${response.status} ${response.statusText}.${bodySnippet}`
      );
    }

    const data: UnderenheterResponse = await response.json();
    const pageItems = data._embedded?.underenheter ?? [];

    if (pageItems.length === 0) break;

    all.push(...pageItems);

    if (all.length >= maxRecords) {
      truncated = true;
      break;
    }

    const totalPages = data.page?.totalPages;
    if (typeof totalPages === 'number' && page + 1 >= totalPages) break;

    page++;
  }

  return { items: all, truncated };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = Number(searchParams.get('days') ?? '7');
    const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 7;

    const now = new Date();
    const tilDatoEierskifte = isoDate(now);
    const from = new Date(now);
    from.setDate(now.getDate() - safeDays);
    const fromDatoEierskifte = isoDate(from);

    const franchiseNames = await loadFranchisesFromCsv();
    const franchisePrefixes = franchiseNames.map((f) => ({
      original: f,
      lower: normalizeText(f),
    }));

    // 1) date-first: fetch underenheter in the window
    // 2) then filter by franchise name prefix locally
    const { items: underenheterRaw, truncated } = await fetchUnderenheterInWindow({
      fromDatoEierskifte,
      tilDatoEierskifte,
      maxRecords: 10000,
    });

    const matches: { under: Underenhet; franchiseMatch: string }[] = [];

    for (const u of underenheterRaw) {
      const underName = normalizeText(u.navn);
      if (!underName) continue;

      const matched = franchisePrefixes.find((p) => underName.startsWith(p.lower));
      if (!matched) continue;

      if (!u.overordnetEnhet) continue; // cannot resolve hovedenhet

      matches.push({ under: u, franchiseMatch: matched.original });
    }

    // Fetch hovedenhet names
    const uniqueMainOrgnrs = Array.from(new Set(matches.map((m) => m.under.overordnetEnhet).filter(Boolean))) as string[];
    const mainNameByOrgnr = new Map<string, string | undefined>();

    // Sequential is slower but avoids flooding BRREG with calls.
    for (const orgnr of uniqueMainOrgnrs) {
      const response = await fetch(`${BRREG_API_BASE}/enheter/${orgnr}`, {
        headers: {
          'Accept': 'application/vnd.brreg.enhetsregisteret.enhet.v2+json',
        },
      });

      if (!response.ok) {
        // Skip silently; we still return orgnr.
        mainNameByOrgnr.set(orgnr, undefined);
        continue;
      }

      const data = (await response.json()) as Enhet;
      mainNameByOrgnr.set(orgnr, data.navn);
    }

    const responseItems: FranchiseEierskifteItem[] = matches.map((m) => {
      const u = m.under;
      const mainOrgnr = u.overordnetEnhet as string;

      return {
        franchiseMatch: m.franchiseMatch,
        underenhet: {
          organisasjonsnummer: u.organisasjonsnummer,
          navn: u.navn,
          datoEierskifte: u.datoEierskifte,
          epostadresse: u.epostadresse,
          telefon: u.telefon,
          mobil: u.mobil,
          hjemmeside: u.hjemmeside,
          postadresse: u.postadresse,
          forretningsadresse: u.forretningsadresse,
          beliggenhetsadresse: u.beliggenhetsadresse,
        },
        hovedenhet: {
          organisasjonsnummer: mainOrgnr,
          navn: mainNameByOrgnr.get(mainOrgnr),
        },
      };
    });

    responseItems.sort((a, b) => toTimeMaybe(b.underenhet.datoEierskifte) - toTimeMaybe(a.underenhet.datoEierskifte));

    return NextResponse.json({
      items: responseItems,
      meta: {
        safeDays,
        fromDatoEierskifte,
        tilDatoEierskifte,
        fetchedUnderenheter: underenheterRaw.length,
        matches: responseItems.length,
        truncated,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

