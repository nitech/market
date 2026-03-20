import { NextRequest, NextResponse } from 'next/server';
import { BRREG_API_BASE } from '@/lib/brreg';
import type {
  FranchiseEierskifteItem,
  Underenhet,
  UnderenheterResponse,
  Enhet,
} from '@/server/types';
import { dedupeFranchiseArray, normalizeFranchiseText } from '@/lib/franchiseList';

export const runtime = 'nodejs';

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function toTimeMaybe(dateString?: string): number {
  if (!dateString) return 0;
  const t = new Date(dateString).getTime();
  return Number.isFinite(t) ? t : 0;
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
    url.searchParams.set('fraDatoEierskifte', fromDatoEierskifte);
    url.searchParams.set('tilDatoEierskifte', tilDatoEierskifte);
    url.searchParams.set('page', String(page));
    url.searchParams.set('size', String(size));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/vnd.brreg.enhetsregisteret.underenhet.v2+json',
      },
    });

    if (!response.ok) {
      let bodySnippet = '';
      try {
        const text = await response.text();
        bodySnippet = text ? ` Body: ${text.slice(0, 500)}` : '';
      } catch {
        // ignore
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

async function runEierskifteSearch(params: {
  safeDays: number;
  franchiseNames: string[];
}): Promise<NextResponse> {
  const { safeDays, franchiseNames } = params;

  const now = new Date();
  const tilDatoEierskifte = isoDate(now);
  const from = new Date(now);
  from.setDate(now.getDate() - safeDays);
  const fromDatoEierskifte = isoDate(from);

  const franchisePrefixes = franchiseNames.map((f) => ({
    original: f,
    lower: normalizeFranchiseText(f),
  }));

  const { items: underenheterRaw, truncated } = await fetchUnderenheterInWindow({
    fromDatoEierskifte,
    tilDatoEierskifte,
    maxRecords: 10000,
  });

  const matches: { under: Underenhet; franchiseMatch: string }[] = [];

  for (const u of underenheterRaw) {
    const underName = normalizeFranchiseText(u.navn);
    if (!underName) continue;

    const matched = franchisePrefixes.find((p) => underName.startsWith(p.lower));
    if (!matched) continue;

    if (!u.overordnetEnhet) continue;

    matches.push({ under: u, franchiseMatch: matched.original });
  }

  const uniqueMainOrgnrs = Array.from(
    new Set(matches.map((m) => m.under.overordnetEnhet).filter(Boolean))
  ) as string[];
  const mainNameByOrgnr = new Map<string, string | undefined>();

  for (const orgnr of uniqueMainOrgnrs) {
    const response = await fetch(`${BRREG_API_BASE}/enheter/${orgnr}`, {
      headers: {
        Accept: 'application/vnd.brreg.enhetsregisteret.enhet.v2+json',
      },
    });

    if (!response.ok) {
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

  responseItems.sort(
    (a, b) => toTimeMaybe(b.underenhet.datoEierskifte) - toTimeMaybe(a.underenhet.datoEierskifte)
  );

  return NextResponse.json({
    items: responseItems,
    meta: {
      safeDays,
      fromDatoEierskifte,
      tilDatoEierskifte,
      fetchedUnderenheter: underenheterRaw.length,
      matches: responseItems.length,
      truncated,
      franchiseCount: franchiseNames.length,
    },
  });
}

/** Klienten sender franchiser fra Firestore. */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Ugyldig JSON i forespørselen.' }, { status: 400 });
    }

    const b = body as { days?: unknown; franchises?: unknown };

    const days = Number(b.days ?? 7);
    const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 7;

    if (!Array.isArray(b.franchises)) {
      return NextResponse.json(
        {
          error:
            'Mangler franchiser i request body. Send { franchises: string[] } fra klienten.',
        },
        { status: 400 }
      );
    }

    const franchiseNames = dedupeFranchiseArray(b.franchises);

    return runEierskifteSearch({ safeDays, franchiseNames });
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

export async function GET() {
  return NextResponse.json(
    { error: 'Bruk POST med body: { days, franchises }.' },
    { status: 405 }
  );
}
