import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userId = await verifySessionToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const { id } = await params
    const passoBusca = await getDb()`
      SELECT area_id FROM checklist_passos_customizados WHERE id = ${parseInt(id)}
    `

    if (passoBusca.length === 0) {
      return NextResponse.json({ error: 'Passo não encontrado' }, { status: 404 })
    }

    const areaId = passoBusca[0].area_id

    // Verificar permissão: admin ou coordenador da área
    const sql = getDb()
    const userRows = await sql`
      SELECT u.role, COALESCE(p.permissoes, '[]') as permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE u.id = ${userId}
    `

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const user = userRows[0]
    let permissoes: string[] = []
    try {
      permissoes = JSON.parse(user.permissoes)
    } catch (e) {
      permissoes = []
    }

    // Apenas admin e coordenadores podem remover passos
    const ehAdmin = user.role === 'admin'
    const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${areaId}.coordenador`)

    if (!ehAdmin && !ehCoordenador) {
      return NextResponse.json(
        { error: 'Apenas admin e coordenadores podem remover passos' },
        { status: 403 }
      )
    }

    // Remover passo customizado
    await sql`
      DELETE FROM checklist_passos_customizados
      WHERE id = ${parseInt(id)}
    `

    return NextResponse.json({ ok: true, message: 'Passo removido com sucesso' })
  } catch (err: any) {
    console.error('Erro ao remover passo customizado:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
