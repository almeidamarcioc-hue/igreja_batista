import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario } from '@/lib/db'

export default async function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) redirect('/login')

  const userId = await verifySessionToken(token)
  if (!userId) redirect('/login')

  const user = await getUsuario(userId) as any
  if (!user || !user.ativo) redirect('/login')

  // Permitir admin
  if (user.role === 'admin') return <>{children}</>

  // Permitir coordenadores de comunicação
  let temPermissao = false

  if (user.perfil_id) {
    try {
      const { getDb } = await import('@/lib/db')
      const sql = getDb()
      const perfil = await sql`SELECT permissoes FROM perfis_acesso WHERE id = ${user.perfil_id}`

      if (perfil.length > 0) {
        const permissoes = JSON.parse(perfil[0].permissoes)
        // Verificar se é coordenador de QUALQUER área de comunicação
        temPermissao = permissoes.some((p: string) =>
          typeof p === 'string' && p.includes('comunicacao') && p.includes('coordenador')
        )
      }
    } catch (e) {
      console.error('Erro ao verificar permissões:', e)
      temPermissao = false
    }
  }

  if (!temPermissao) redirect('/')

  return <>{children}</>
}
