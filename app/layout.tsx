import type { Metadata } from 'next'
import './globals.css'
import ShellClient from './ShellClient'
import InitDb from './InitDb'

export const metadata: Metadata = {
  title: 'Igreja Batista Transformação',
  description: 'Sistema Integrado — Secretaria e Centro Educacional',
  metadataBase: new URL('https://igreja-batista.vercel.app'),
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IBTM',
  },
  openGraph: {
    title: 'Igreja Batista Transformação',
    description: 'Sistema Integrado — Secretaria e Centro Educacional',
    url: 'https://igreja-batista.vercel.app',
    siteName: 'IBTM Workspace',
    images: [{ url: '/ibtm-logo.png', width: 512, height: 512, alt: 'Logo IBTM' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Igreja Batista Transformação',
    description: 'Sistema Integrado — Secretaria e Centro Educacional',
    images: ['/ibtm-logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body style={{ backgroundColor: '#f0f2f5' }}>
        <InitDb />
        <ShellClient>{children}</ShellClient>
      </body>
    </html>
  )
}
