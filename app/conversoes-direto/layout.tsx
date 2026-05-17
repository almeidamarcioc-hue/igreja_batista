import type { Metadata } from 'next'
import '../globals.css'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Conversões — IBTM',
  description: 'Acompanhamento de conversões',
  manifest: '/manifest-conversoes.json',
  icons: {
    icon: '/ibtm-logo.png',
    apple: '/ibtm-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Conversões IBTM',
  },
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
}

export default async function ConversoesDirectLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) redirect('/login')

  const userId = await verifySessionToken(token)
  if (!userId) redirect('/login')

  const user = await getUsuario(userId) as any
  if (!user || !user.ativo) redirect('/login')

  const modulos: string = user.modulos ?? ''
  if (modulos !== '*' && !modulos.split(',').map((m: string) => m.trim()).includes('conversoes')) {
    redirect('/')
  }

  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest-conversoes.json" />
        <meta name="theme-color" content="#002347" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Conversões IBTM" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/ibtm-logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/ibtm-logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/ibtm-logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ibtm-logo.png" />
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
