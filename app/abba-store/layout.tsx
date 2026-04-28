import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario } from '@/lib/db'
import AbbaStoreShell from '@/components/AbbaStoreShell'

export default async function AbbaStoreLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) redirect('/login')

  const userId = await verifySessionToken(token)
  if (!userId) redirect('/login')

  const user = await getUsuario(userId) as any
  if (!user || !user.ativo) redirect('/login')

  const modulos: string = user.modulos ?? ''
  if (modulos !== '*' && !modulos.split(',').map((m: string) => m.trim()).includes('abba-store')) {
    redirect('/')
  }

  return <AbbaStoreShell>{children}</AbbaStoreShell>
}
