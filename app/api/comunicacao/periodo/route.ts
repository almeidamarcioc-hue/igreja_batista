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

  // Filtro por operador: só faz sentido nas áreas que a pessoa coordena. Nas
  // demais ela já está restrita às próprias marcações.
  const filtroUsuarioParam = searchParams.get('usuario_id')
  const filtroUsuarioId =
    filtroUsuarioParam && !Number.isNaN(Number(filtroUsuarioParam)) && areasComEquipe.length > 0
      ? Number(filtroUsuarioParam)
      : null

  try {
    const sql = getDb()
    const query = `
      SELECT
        cp.culto_data,
        cp.area_id,
        COUNT(DISTINCT CASE WHEN cp.marcado = true THEN cp.passo_id END) as marcados,
        COALESCE(ARRAY_AGG(DISTINCT u.nome) FILTER (WHERE cp.marcado = true), '{}') as responsaveis
      FROM checklist_progresso cp
      LEFT JOIN usuarios u ON u.id = cp.usuario_id
      WHERE cp.culto_data >= $1 AND cp.culto_data <= $2
        AND (
          (cp.area_id = ANY($3::text[]) AND ($4::int IS NULL OR cp.usuario_id = $4))
          OR (cp.area_id = ANY($5::text[]) AND cp.usuario_id = $6)
        )
      GROUP BY cp.culto_data, cp.area_id
      HAVING COUNT(DISTINCT CASE WHEN cp.marcado = true THEN cp.passo_id END) > 0
      ORDER BY cp.culto_data DESC
    `
    const params: any[] = [
      dataInicio,
      dataFim,
      areasComEquipe,
      filtroUsuarioId,
      areasSoMinhas,
      user.id,
    ]

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
