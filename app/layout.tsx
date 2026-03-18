import type { Metadata } from 'next'
import './globals.css'
import { AuthGate } from '@/app/components/AuthGate'

export const metadata: Metadata = {
  title: '7markets',
  description: 'Søk og analyser bedrifter for market research og candidate qualification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  )
}

