import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import { getComunicacaoUser, areasPermitidas, podeVerArea } from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dataInicio = searchParams.get('data_inicio')
  const dataFim = searchParams.get('data_fim')
  const areaId = searchParams.get('area_id')

  if (!dataInicio || !dataFim) {
    return NextResponse.json(
      { error: 'Parâmetros data_inicio e data_fim são obrigatórios' },
      { status: 400 }
    )
  }

  const user = await getComunicacaoUser(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  if (areaId && !podeVerArea(user, areaId)) {
    return NextResponse.json({ error: 'Acesso negado a esta área' }, { status: 403 })
  }

  // Sem area_id, restringe às áreas que o usuário pode ver
  const areas = areaId ? [areaId] : areasPermitidas(user)
  if (areas.length === 0) return NextResponse.json([])

  try {
    const sql = getDb()
    const query = `
      SELECT
        culto_data,
        area_id,
        SUM(CASE WHEN marcado = true THEN 1 ELSE 0 END) as marcados
      FROM checklist_progresso
      WHERE culto_data >= $1 AND culto_data <= $2
        AND area_id = ANY($3::text[])
      GROUP BY culto_data, area_id ORDER BY culto_data DESC
    `
    const params: any[] = [dataInicio, dataFim, areas]

    const resultado = await sql(query, params)

    // Adicionar o total correto de passos por área
    const resultadoComTotal = resultado.map((row: any) => {
      let totalPassos = 0
      if (row.area_id) {
        const area = PROCEDIMENTOS.areas.find(a => a.id === row.area_id)
        if (area) {
          totalPassos = area.fases.pre.length + area.fases.pos.length
        }
      }
      return {
        ...row,
        total: totalPassos,
        marcados: parseInt(row.marcados) || 0
      }
    })

    return NextResponse.json(resultadoComTotal)
  } catch (err: any) {
    console.error('Erro ao buscar período:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
