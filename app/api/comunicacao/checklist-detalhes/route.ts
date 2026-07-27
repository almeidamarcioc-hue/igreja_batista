import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cultoData = searchParams.get('culto_data')
  const areaId = searchParams.get('area_id')

  if (!cultoData || !areaId) {
    return NextResponse.json(
      { error: 'Parâmetros culto_data e area_id são obrigatórios' },
      { status: 400 }
    )
  }

  try {
    const sql = getDb()

    // Buscar último status de cada passo
    const passos = await sql`
      SELECT DISTINCT ON (passo_id)
        cp.passo_id,
        cp.marcado,
        cp.usuario_id,
        u.nome as usuario_nome,
        cp.data_marcacao
      FROM checklist_progresso cp
      LEFT JOIN usuarios u ON cp.usuario_id = u.id
      WHERE cp.culto_data = ${cultoData} AND cp.area_id = ${areaId}
      ORDER BY cp.passo_id, cp.data_marcacao DESC
    `

    // Buscar quem finalizou o checklist
    const finalizacao = await sql`
      SELECT
        cf.usuario_id,
        u.nome as usuario_nome,
        cf.data_finalizacao
      FROM checklist_finalizado cf
      LEFT JOIN usuarios u ON cf.usuario_id = u.id
      WHERE cf.culto_data = ${cultoData} AND cf.area_id = ${areaId}
    `

    // Montar resumo
    const resumo: Record<string, { marcado: boolean; usuario_nome: string; data_marcacao: string }> = {}

    passos.forEach((passo: any) => {
      resumo[passo.passo_id] = {
        marcado: passo.marcado,
        usuario_nome: passo.usuario_nome || 'Desconhecido',
        data_marcacao: passo.data_marcacao
      }
    })

    return NextResponse.json({
      culto_data: cultoData,
      area_id: areaId,
      resumo,
      finalizacao: finalizacao[0] || null,
      historico: passos
    })
  } catch (err: any) {
    console.error('Erro ao buscar detalhes:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
