import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brønnøysundregistrene Dashboard',
  description: 'Søk og analyser bedrifter for market research og candidate qualification',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}

