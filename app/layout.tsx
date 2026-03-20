import type { Metadata } from 'next'
import './globals.css'
import { AuthGate } from '@/app/components/AuthGate'
import { ThemeSync } from '@/app/components/ThemeSync'

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
    <html lang="no" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='7markets-theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'&&t!=='system')t='system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-100 text-gray-900 antialiased transition-colors dark:bg-gray-950 dark:text-gray-100">
        <ThemeSync />
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  )
}

