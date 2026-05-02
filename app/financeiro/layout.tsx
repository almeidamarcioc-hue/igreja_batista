import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario } from '@/lib/db'
import FinanceiroShell from '@/components/FinanceiroShell'

export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) redirect('/login')

  const userId = await verifySessionToken(token)
  if (!userId) redirect('/login')

  const user = await getUsuario(userId) as any
  if (!user || !user.ativo) redirect('/login')

  const modulos: string = user.modulos ?? ''
  if (modulos !== '*' && !modulos.split(',').map((m: string) => m.trim()).includes('financeiro')) {
    redirect('/')
  }

  return <FinanceiroShell>{children}</FinanceiroShell>
}
