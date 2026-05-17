import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Conversões — IBTM',
  description: 'Módulo de acompanhamento de conversões',
}

export default async function ConversoesLayout({ children }: { children: React.ReactNode }) {
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
      <body style={{ backgroundColor: '#002347', color: '#1f2937', margin: 0, padding: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
