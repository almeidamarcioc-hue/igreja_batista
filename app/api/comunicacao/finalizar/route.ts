import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getComunicacaoUser, podeVerArea } from '@/lib/comunicacao/auth'

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

    const user = await getComunicacaoUser(req)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!podeVerArea(user, area_id)) {
      return NextResponse.json({ error: 'Acesso negado a esta área' }, { status: 403 })
    }

    const sql = getDb()

    // Criar uma tabela de checklists finalizados se não existir
    await sql`
      CREATE TABLE IF NOT EXISTS checklist_finalizado (
        id SERIAL PRIMARY KEY,
        culto_data DATE NOT NULL,
        area_id VARCHAR(50) NOT NULL,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        data_finalizacao TIMESTAMP DEFAULT NOW(),
        UNIQUE(culto_data, area_id)
      )
    `

    // Inserir o registro de finalização
    await sql`
      INSERT INTO checklist_finalizado (culto_data, area_id, usuario_id)
      VALUES (${culto_data}, ${area_id}, ${userId})
      ON CONFLICT (culto_data, area_id) DO UPDATE
      SET data_finalizacao = NOW()
    `

    return NextResponse.json({ ok: true, message: 'Checklist finalizado com sucesso' })
  } catch (err: any) {
    console.error('Erro ao finalizar checklist:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
