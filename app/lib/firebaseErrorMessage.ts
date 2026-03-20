/** Lesbar feilmelding fra Firebase / Firestore (inkl. code). */
export function firebaseErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e && 'message' in e) {
    const code = String((e as { code: unknown }).code);
    const message = String((e as { message: unknown }).message);
    return `${code}: ${message}`;
  }
  if (e instanceof Error) return e.message;
  return 'Ukjent feil';
}
