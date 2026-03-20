import type { Metadata } from 'next';
import './globals.css';
import { AuthGate } from '@/app/components/AuthGate';
import { ThemeSync } from '@/app/components/ThemeSync';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='7markets-theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'&&t!=='system')t='system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: 'var(--gs-bg-primary)',
          color: 'var(--gs-text-primary)',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <ThemeSync />
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  )
}
