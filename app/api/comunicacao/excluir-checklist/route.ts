import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userId = await verifySessionToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const body = await req.json()
    const { culto_data, area_id } = body

    if (!culto_data || !area_id) {
      return NextResponse.json(
        { error: 'Parâmetros culto_data e area_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se é coordenador
    const sql = getDb()
    const userRows = await sql`
      SELECT
        u.id, u.usuario, u.role,
        COALESCE(p.permissoes, '[]') as permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE u.id = ${userId}
    `
    const user = userRows[0]
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    let permissoes: string[] = []
    try {
      permissoes = JSON.parse(user.permissoes)
    } catch (e) {
      permissoes = []
    }

    // Apenas admin e coordenadores podem excluir
    const ehAdmin = user.role === 'admin'
    const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${area_id}.coordenador`)

    if (!ehAdmin && !ehCoordenador) {
      return NextResponse.json({ error: 'Apenas admin e coordenadores podem excluir checklists' }, { status: 403 })
    }

    const sql2 = getDb()

    // Deletar todos os registros de progresso deste checklist
    await sql2`
      DELETE FROM checklist_progresso
      WHERE culto_data = ${culto_data} AND area_id = ${area_id}
    `

    // Deletar o registro de finalização
    await sql2`
      DELETE FROM checklist_finalizado
      WHERE culto_data = ${culto_data} AND area_id = ${area_id}
    `

    return NextResponse.json({ ok: true, message: 'Checklist excluído com sucesso' })
  } catch (err: any) {
    console.error('Erro ao excluir checklist:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
