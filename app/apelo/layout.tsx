import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Apelo de Conversão — IBTM',
  description: 'Formulário para registro de conversão a Cristo',
  manifest: '/manifest-apelo.json',
  icons: {
    icon: '/ibtm-logo.png',
    apple: '/ibtm-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Apelo IBTM',
  },
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
}

export default function ApeloLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest-apelo.json" />
        <meta name="theme-color" content="#002347" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Apelo IBTM" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/ibtm-logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/ibtm-logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/ibtm-logo.png" />
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
