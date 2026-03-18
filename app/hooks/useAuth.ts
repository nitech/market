'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/lib/firebaseClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    }, (e) => {
      console.error('Auth error:', e);
      setError(e?.message ?? 'Ukjent auth-feil');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}

