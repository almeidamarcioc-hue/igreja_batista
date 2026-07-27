import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'

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

    // Buscar permissões do usuário
    const sql = getDb()
    const userRows = await sql`
      SELECT
        u.id, u.usuario, u.nome, u.role,
        COALESCE(p.permissoes, '[]') as permissoes
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
      permissoes = JSON.parse(user.permissoes)
    } catch (e) {
      permissoes = []
    }

    // Verificar se tem permissão para esta área
    const temPermissao = permissoes.includes('*') ||
      permissoes.some((p: string) => p.startsWith(`comunicacao:${areaId}`))

    if (!temPermissao) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se é coordenador (pode ver todos) ou operador (só vê seus)
    const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${areaId}.coordenador`)

    const sql2 = getDb()

    // Buscar último status de cada passo
    let passos
    if (ehCoordenador) {
      // Coordenador vê todos os passos
      passos = await sql2`
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
    } else {
      // Operador só vê seus próprios passos
      passos = await sql2`
        SELECT DISTINCT ON (passo_id)
          cp.passo_id,
          cp.marcado,
          cp.usuario_id,
          u.nome as usuario_nome,
          cp.data_marcacao
        FROM checklist_progresso cp
        LEFT JOIN usuarios u ON cp.usuario_id = u.id
        WHERE cp.culto_data = ${cultoData} AND cp.area_id = ${areaId} AND cp.usuario_id = ${userId}
        ORDER BY cp.passo_id, cp.data_marcacao DESC
      `
    }

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
