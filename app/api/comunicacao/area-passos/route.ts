import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import { getComunicacaoUser, podeVerArea, podeGerenciarArea } from '@/lib/comunicacao/auth'
import { obterPassosEfetivos, garantirTabelaOverride } from '@/lib/comunicacao/passos'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const areaId = searchParams.get('area_id')

  if (!areaId) {
    return NextResponse.json(
      { error: 'Parâmetro area_id é obrigatório' },
      { status: 400 }
    )
  }

  const user = await getComunicacaoUser(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!podeVerArea(user, areaId)) {
    return NextResponse.json({ error: 'Acesso negado a esta área' }, { status: 403 })
  }

  try {
    const sql = getDb()
    const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)

    if (!area) {
      return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 })
    }

    // Buscar passos desabilitados
    const desabilitados = await sql`
      SELECT passo_id FROM area_passos_desabilitados WHERE area_id = ${areaId}
    `
    const desabilitadosIds = desabilitados.map(d => d.passo_id)

    // Montar lista de todos os passos (padrão + customizados)
    const todosPadrao = [
      ...area.fases.pre.filter(p => !desabilitadosIds.includes(p.id)),
      ...area.fases.operacao.filter(p => !desabilitadosIds.includes(p.id)),
      ...area.fases.pos.filter(p => !desabilitadosIds.includes(p.id))
    ]

    // Buscar customizados (não são filtrados por data aqui, retorna todos da área)
    const customizados = await sql`
      SELECT DISTINCT ON (titulo) id, titulo, descricao, tipo, criado_em
      FROM checklist_passos_customizados
      WHERE area_id = ${areaId}
      ORDER BY titulo, criado_em DESC
    `

    // Edições feitas nos passos padrão (o texto original vem do código)
    await garantirTabelaOverride()
    const overrides = await sql`
      SELECT passo_id, titulo, descricao FROM area_passos_override WHERE area_id = ${areaId}
    `
    const overridePorPasso = new Map<string, { titulo: string; descricao: string }>(
      overrides.map((o: any) => [String(o.passo_id), { titulo: String(o.titulo), descricao: String(o.descricao ?? '') }])
    )

    return NextResponse.json({
      padrao: todosPadrao.map(p => {
        const ov = overridePorPasso.get(p.id)
        return {
          id: p.id,
          titulo: ov?.titulo ?? p.titulo,
          descricao: ov?.descricao ?? (p.descricao || ''),
          tipo: area.fases.pre.includes(p) ? 'pre' : area.fases.operacao.includes(p) ? 'operacao' : 'pos',
          isCustomizado: false,
          editado: !!ov,
        }
      }),
      customizados: customizados.map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        descricao: p.descricao,
        tipo: p.tipo,
        isCustomizado: true
      })),
      desabilitados: desabilitadosIds,
      // Lista final usada pela tela do checklist (com edições, remoções e customizados)
      efetivos: await obterPassosEfetivos(areaId)
    })
  } catch (err: any) {
    console.error('Erro ao buscar passos:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

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
    const { areaId, action, passoId, titulo, descricao } = body

    if (!areaId || !action || !passoId) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const sql = getDb()

    const user = await getComunicacaoUser(req)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!podeGerenciarArea(user, areaId)) {
      return NextResponse.json(
        { error: 'Apenas admin e coordenadores podem gerenciar o checklist desta área' },
        { status: 403 }
      )
    }

    if (action === 'desabilitar') {
      // Desabilitar um passo padrão
      await sql`
        INSERT INTO area_passos_desabilitados (area_id, passo_id)
        VALUES (${areaId}, ${passoId})
        ON CONFLICT DO NOTHING
      `
    } else if (action === 'habilitar') {
      // Habilitar um passo que foi desabilitado
      await sql`
        DELETE FROM area_passos_desabilitados
        WHERE area_id = ${areaId} AND passo_id = ${passoId}
      `
    } else if (action === 'editar') {
      // Editar um passo padrão: guarda sobreposição do texto vindo do código
      if (!titulo?.trim()) {
        return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
      }
      await garantirTabelaOverride()
      await sql`
        INSERT INTO area_passos_override (area_id, passo_id, titulo, descricao)
        VALUES (${areaId}, ${passoId}, ${titulo.trim()}, ${descricao?.trim() ?? ''})
        ON CONFLICT (area_id, passo_id)
        DO UPDATE SET titulo = EXCLUDED.titulo, descricao = EXCLUDED.descricao, atualizado_em = NOW()
      `
    } else if (action === 'restaurar') {
      // Voltar ao texto original do template
      await sql`
        DELETE FROM area_passos_override
        WHERE area_id = ${areaId} AND passo_id = ${passoId}
      `
    } else {
      return NextResponse.json({ error: `Ação desconhecida: ${action}` }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Erro ao gerenciar passos:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
