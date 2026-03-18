'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/app/lib/firebaseClient';

type Mode = 'signin' | 'signup';

export function LoginCard() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (mode === 'signin' ? 'Logg inn' : 'Opprett konto'), [mode]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      // La AuthGate ta over UI når auth-state oppdateres.
      router.replace('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      // Oppretter konto automatisk hvis brukeren ikke finnes fra før.
      await signInWithPopup(auth, provider);
      router.replace('/');
    } catch (err) {
      // Vanlig ved blokkering av popups.
      const message = err instanceof Error ? err.message : 'Ukjent feil';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-md flex-col justify-center gap-4 p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Logg inn med Firebase Auth (Google eller email/passord).
          </p>

          <div className="mt-6">
            <button
              type="button"
              className="w-full rounded bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-60"
              onClick={() => void signInWithGoogle()}
              disabled={loading}
            >
              {loading ? 'Vennligst vent...' : 'Fortsett med Google'}
            </button>
          </div>

          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">E-post</span>
              <input
                className="rounded border border-gray-300 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-700">Passord</span>
              <input
                className="rounded border border-gray-300 px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                disabled={loading}
              />
            </label>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Vennligst vent...' : mode === 'signin' ? 'Logg inn' : 'Opprett konto'}
            </button>

            <div className="text-sm text-gray-600">
              {mode === 'signin' ? (
                <>
                  Har du ikke konto?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setMode('signup')}
                  >
                    Opprett konto
                  </button>
                </>
              ) : (
                <>
                  Har du allerede konto?{' '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setMode('signin')}
                  >
                    Logg inn
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

