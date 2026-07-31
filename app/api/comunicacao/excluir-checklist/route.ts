import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getComunicacaoUser, podeGerenciarArea } from '@/lib/comunicacao/auth'

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

    // Apenas admin e coordenadores da área podem excluir.
    // Antes exigia a permissão exata `comunicacao:<area>.coordenador`, que a tela
    // de perfis nunca grava — na prática só o admin conseguia excluir.
    const user = await getComunicacaoUser(req)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!podeGerenciarArea(user, area_id)) {
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
