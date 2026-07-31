import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getComunicacaoUser, areasGerenciaveis } from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'

// Operadores que preencheram checklist nas áreas que a pessoa coordena.
// Alimenta o filtro por operador no dashboard. A lista sai das próprias
// marcações, então nunca oferece alguém cujos checklists não seriam visíveis.
// Operador recebe lista vazia: ele não filtra o trabalho dos colegas.
export async function GET(req: NextRequest) {
  const user = await getComunicacaoUser(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const areas = areasGerenciaveis(user)
  if (areas.length === 0) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const dataInicio = searchParams.get('data_inicio')
  const dataFim = searchParams.get('data_fim')

  try {
    const sql = getDb()
    const query = `
      SELECT DISTINCT u.id, u.nome
      FROM checklist_progresso cp
      JOIN usuarios u ON u.id = cp.usuario_id
      WHERE cp.area_id = ANY($1::text[])
        AND cp.marcado = true
        AND ($2::date IS NULL OR cp.culto_data >= $2)
        AND ($3::date IS NULL OR cp.culto_data <= $3)
      ORDER BY u.nome
    `
    const rows = await sql(query, [areas, dataInicio || null, dataFim || null])
    return NextResponse.json(rows)
  } catch (err: any) {
    console.error('Erro ao listar operadores:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
