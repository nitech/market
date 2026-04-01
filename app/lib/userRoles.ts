export type UserRole = 'admin' | 'user';

const ADMIN_EMAILS = new Set(
  [
    'nitech@gmail.com',
    'johannes_falk_davidsen@hotmail.com',
  ].map((email) => email.trim().toLowerCase())
);

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return ADMIN_EMAILS.has(normalizeEmail(email));
}

export function getUserRole(email: string | null | undefined): UserRole {
  return isAdminEmail(email) ? 'admin' : 'user';
}
