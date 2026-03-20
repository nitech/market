/** Normaliser tekst for sammenligning (prefiks-match mot BRREG-navn). */
export function normalizeFranchiseText(s?: string | null): string {
  return (s ?? '').trim().toLowerCase();
}

/**
 * Én linje per franchise (samme logikk som tidligere CSV).
 * Støtter valgfritt `Navn;rest` — kun første del brukes.
 */
export function parseFranchiseLines(text: string): string[] {
  const lines = text
    .split(/\r?\n/g)
    .map((l) => l.replace(/^\uFEFF/, '').trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const name = line.split(';')[0]?.trim();
    if (!name) continue;
    const key = normalizeFranchiseText(name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

export function franchiseLinesFromArray(franchises: string[]): string {
  return parseFranchiseLines(franchises.join('\n')).join('\n');
}

export function dedupeFranchiseArray(franchises: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of franchises) {
    if (typeof item !== 'string') continue;
    const name = item.trim();
    if (!name) continue;
    const key = normalizeFranchiseText(name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}
