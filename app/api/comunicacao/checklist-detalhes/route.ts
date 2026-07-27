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

    // Buscar dados do checklist
    let passos: any[] = []
    try {
      passos = await sql`
        SELECT passo_id, marcado, usuario_id, data_marcacao
        FROM checklist_progresso
        WHERE culto_data = ${cultoData} AND area_id = ${areaId}
        ${!ehCoordenador ? sql`AND usuario_id = ${userId}` : sql``}
        ORDER BY passo_id, data_marcacao DESC
      `
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

    // Montar resumo (último status de cada passo)
    const resumo: Record<string, any> = {}
    passos.forEach((p: any) => {
      if (!resumo[p.passo_id]) {
        resumo[p.passo_id] = {
          marcado: p.marcado,
          usuario_id: p.usuario_id,
          data_marcacao: p.data_marcacao
        }
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
