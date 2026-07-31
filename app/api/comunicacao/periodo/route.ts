import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import { obterPassosEfetivos } from '@/lib/comunicacao/passos'
import { getComunicacaoUser, areasPermitidas, podeVerArea, podeGerenciarArea } from '@/lib/comunicacao/auth'

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

  // O progresso é gravado por usuário (checklist_progresso.usuario_id). Quem
  // coordena a área vê os checklists de toda a equipe; o operador vê apenas os
  // que ele mesmo preencheu — antes ele via as datas preenchidas pelos colegas
  // e abria o checklist vazio, porque as marcações eram de outra pessoa.
  const areasComEquipe = areas.filter(id => podeGerenciarArea(user, id))
  const areasSoMinhas = areas.filter(id => !areasComEquipe.includes(id))

  try {
    const sql = getDb()
    const query = `
      SELECT
        culto_data,
        area_id,
        COUNT(DISTINCT CASE WHEN marcado = true THEN passo_id END) as marcados
      FROM checklist_progresso
      WHERE culto_data >= $1 AND culto_data <= $2
        AND (
          area_id = ANY($3::text[])
          OR (area_id = ANY($4::text[]) AND usuario_id = $5)
        )
      GROUP BY culto_data, area_id ORDER BY culto_data DESC
    `
    const params: any[] = [dataInicio, dataFim, areasComEquipe, areasSoMinhas, user.id]

    const resultado = await sql(query, params)

    // Total pela lista efetiva (sem passos removidos, com os customizados), para
    // a porcentagem daqui bater com a da tela do checklist
    const totalPorArea = new Map<string, number>()
    for (const id of areas) {
      const efetivos = await obterPassosEfetivos(id)
      const area = PROCEDIMENTOS.areas.find(a => a.id === id)
      const total = efetivos
        ? efetivos.pre.length + efetivos.pos.length
        : area
          ? area.fases.pre.length + area.fases.pos.length
          : 0
      totalPorArea.set(id, total)
    }

    const resultadoComTotal = resultado.map((row: any) => ({
      ...row,
      total: totalPorArea.get(String(row.area_id)) ?? 0,
      marcados: parseInt(row.marcados) || 0,
    }))

    return NextResponse.json(resultadoComTotal)
  } catch (err: any) {
    console.error('Erro ao buscar período:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
