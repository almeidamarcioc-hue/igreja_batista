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

    // Buscar detalhes de todos os passos do checklist
    const passos = await sql`
      SELECT
        cp.passo_id,
        cp.marcado,
        cp.usuario_id,
        u.nome as usuario_nome,
        cp.data_marcacao,
        MAX(CASE WHEN cp.marcado = true THEN cp.data_marcacao END) as data_finalizacao
      FROM checklist_progresso cp
      LEFT JOIN usuarios u ON cp.usuario_id = u.id
      WHERE cp.culto_data = ${cultoData} AND cp.area_id = ${areaId}
      GROUP BY cp.passo_id, cp.marcado, cp.usuario_id, u.nome, cp.data_marcacao
      ORDER BY cp.passo_id
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

    // Resumo: pegar o último status de cada passo
    const resumo: Record<string, { marcado: boolean; usuario_nome: string; data_marcacao: string }> = {}

    passos.forEach((passo: any) => {
      if (!resumo[passo.passo_id] || new Date(passo.data_marcacao) > new Date(resumo[passo.passo_id].data_marcacao)) {
        resumo[passo.passo_id] = {
          marcado: passo.marcado,
          usuario_nome: passo.usuario_nome || 'Desconhecido',
          data_marcacao: passo.data_marcacao
        }
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
