import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const userId = await verifySessionToken(token)
  if (!userId) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })

  try {
    const sql = getDb()
    // Buscar usuário com permissões do perfil
    const rows = await sql`
      SELECT
        u.id, u.usuario, u.nome, u.email, u.role, u.modulos, u.perfil_id, u.ativo,
        COALESCE(p.permissoes, '[]') as permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE u.id = ${userId}
    `
    const usuario = rows[0]
    if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const response = NextResponse.json(usuario)
    // Dados de sessão não devem ser cacheados - forçar revalidação a cada requisição
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('ETag', `user-${usuario.id}-${Date.now()}`)
    return response
  } catch (err: any) {
    console.error('Erro ao buscar usuário:', err)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
