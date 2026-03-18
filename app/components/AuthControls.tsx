'use client';

import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { auth } from '@/app/lib/firebaseClient';

function getAvatarLetter(emailOrUid?: string) {
  if (!emailOrUid) return '?';
  const trimmed = emailOrUid.trim();
  const first = trimmed[0] ?? '?';
  return first.toUpperCase();
}

export function AuthControls() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" aria-label="Laster auth..." />
    );
  }

  const label = user?.email ?? user?.uid;
  const initials = getAvatarLetter(label);

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          ?
        </div>
        <Link href="/login" className="text-blue-600 hover:underline">
          Logg inn
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold"
        title={label}
        aria-label="Brukerprofil"
      >
        {initials}
      </div>
      <button
        className="rounded bg-gray-900 px-3 py-1 text-white hover:bg-gray-800"
        onClick={() => signOut(auth)}
        type="button"
      >
        Logg ut
      </button>
    </div>
  );
}

