import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import { getComunicacaoUser, podeVerArea } from '@/lib/comunicacao/auth'

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

    return NextResponse.json({
      padrao: todosPadrao.map(p => ({
        id: p.id,
        titulo: p.titulo,
        descricao: p.descricao || '',
        tipo: area.fases.pre.includes(p) ? 'pre' : area.fases.operacao.includes(p) ? 'operacao' : 'pos',
        isCustomizado: false
      })),
      customizados: customizados.map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        descricao: p.descricao,
        tipo: p.tipo,
        isCustomizado: true
      })),
      desabilitados: desabilitadosIds
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
    const { areaId, action, passoId } = body

    if (!areaId || !action || !passoId) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Verificar permissão
    const sql = getDb()
    const userRows = await sql`
      SELECT u.role, COALESCE(p.permissoes, '[]') as permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE u.id = ${userId}
    `

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const user = userRows[0]
    let permissoes: string[] = []
    try {
      permissoes = JSON.parse(user.permissoes)
    } catch (e) {
      permissoes = []
    }

    const ehAdmin = user.role === 'admin'
    const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${areaId}.coordenador`)

    if (!ehAdmin && !ehCoordenador) {
      return NextResponse.json(
        { error: 'Apenas admin e coordenadores podem gerenciar passos' },
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
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Erro ao gerenciar passos:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
