import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

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
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const userId = await verifySessionToken(token)
    if (!userId) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    const sql = getDb()

    // Buscar permissões do usuário
    const userRows = await sql`
      SELECT u.id, u.role, COALESCE(p.permissoes, '[]') as permissoes
      FROM usuarios u
      LEFT JOIN perfis_acesso p ON u.perfil_id = p.id
      WHERE u.id = ${userId}
    `
    const user = userRows[0]
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    let permissoes: string[] = []
    try {
      permissoes = JSON.parse(user.permissoes || '[]')
    } catch (e) {
      permissoes = []
    }

    // Verificar se tem permissão
    const temPermissao = permissoes.includes('*') ||
      permissoes.some((p: string) => p.startsWith(`comunicacao:${areaId}`))

    if (!temPermissao && user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Admin e coordenadores veem todos; operadores veem apenas seus
    const ehCoordenador = user.role === 'admin' ||
      permissoes.some((p: string) => p === `comunicacao:${areaId}.coordenador`)

    // Buscar dados do checklist com nome do usuário
    let passos: any[] = []
    try {
      if (ehCoordenador) {
        // Coordenador vê todos
        passos = await sql`
          SELECT cp.passo_id, cp.marcado, cp.usuario_id, cp.data_marcacao, u.nome as usuario_nome
          FROM checklist_progresso cp
          LEFT JOIN usuarios u ON cp.usuario_id = u.id
          WHERE cp.culto_data = ${cultoData} AND cp.area_id = ${areaId}
          ORDER BY cp.passo_id, cp.data_marcacao DESC
        `
      } else {
        // Operador vê apenas seus
        passos = await sql`
          SELECT cp.passo_id, cp.marcado, cp.usuario_id, cp.data_marcacao, u.nome as usuario_nome
          FROM checklist_progresso cp
          LEFT JOIN usuarios u ON cp.usuario_id = u.id
          WHERE cp.culto_data = ${cultoData} AND cp.area_id = ${areaId} AND cp.usuario_id = ${userId}
          ORDER BY cp.passo_id, cp.data_marcacao DESC
        `
      }
    } catch (passosErr) {
      console.error('Erro ao buscar passos:', passosErr)
      passos = []
    }

    let finalizacao: any[] = []
    try {
      finalizacao = await sql`
        SELECT usuario_id, data_finalizacao
        FROM checklist_finalizado
        WHERE culto_data = ${cultoData} AND area_id = ${areaId}
        LIMIT 1
      `
    } catch (finErr) {
      console.error('Erro ao buscar finalização:', finErr)
    }

    // Montar resumo com TODOS os passos da área (apenas pré e pós, não operação)
    const area = PROCEDIMENTOS.areas.find((a: any) => a.id === areaId)
    const todosPassos = area ? [...area.fases.pre, ...area.fases.pos] : []

    // Mapa dos passos registrados
    const passosMarcados: Record<string, any> = {}
    passos.forEach((p: any) => {
      if (!passosMarcados[p.passo_id]) {
        passosMarcados[p.passo_id] = {
          marcado: p.marcado,
          usuario_id: p.usuario_id,
          usuario_nome: p.usuario_nome,
          data_marcacao: p.data_marcacao
        }
      }
    })

    // Incluir todos os passos, marcados ou não
    const resumo: Record<string, any> = {}
    todosPassos.forEach((passo: any) => {
      resumo[passo.id] = passosMarcados[passo.id] || {
        marcado: false,
        usuario_nome: '',
        usuario_id: null,
        data_marcacao: null
      }
    })

    return NextResponse.json({
      culto_data: cultoData,
      area_id: areaId,
      resumo,
      finalizacao: finalizacao[0] || null
    })
  } catch (err: any) {
    console.error('Erro ao buscar detalhes:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao buscar detalhes' },
      { status: 500 }
    )
  }
}
