'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { LoginCard } from '@/app/components/LoginCard';

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Hindre "flash" av innhold før auth er lastet ferdig.
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 p-6 text-sm text-gray-600">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          <div>Laster inn...</div>
        </div>
      </div>
    );
  }

  // La innlogging/landing-siden være tilgjengelig uten gate.
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Ikke innlogget: vis kun login skjerm.
  if (!user) {
    return <LoginCard />;
  }

  // Innlogget: vis resten av appen.
  return <>{children}</>;
}

