import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Agenda Pastoral — IBTM',
  description: 'Aplicativo de agenda dos pastores',
  manifest: '/manifest-pastor.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Agenda IBTM',
  },
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
}

export default function PastorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest-pastor.json" />
        <meta name="theme-color" content="#002347" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Agenda IBTM" />
        <link rel="apple-touch-icon" href="/ibtm-logo.png" />
        {typeof window !== 'undefined' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                }
              `,
            }}
          />
        )}
      </head>
      <body style={{ backgroundColor: '#002347', color: '#1f2937', margin: 0, padding: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
