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

    const sql = getDb()

    // Deletar o registro de finalização para permitir edição
    await sql`
      DELETE FROM checklist_finalizado
      WHERE culto_data = ${culto_data} AND area_id = ${area_id}
    `

    return NextResponse.json({
      ok: true,
      message: 'Checklist desbloqueado para edição',
      redirectUrl: `/comunicacao/area/${area_id}?culto_data=${culto_data}`
    })
  } catch (err: any) {
    console.error('Erro ao editar checklist:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
