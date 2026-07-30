import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getComunicacaoUser, podeVerArea } from '@/lib/comunicacao/auth'

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

  const user = await getComunicacaoUser(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!podeVerArea(user, areaId)) {
    return NextResponse.json({ error: 'Acesso negado a esta área' }, { status: 403 })
  }

  try {
    const sql = getDb()
    const passos = await sql`
      SELECT id, titulo, descricao, tipo, criado_em
      FROM checklist_passos_customizados
      WHERE culto_data = ${cultoData} AND area_id = ${areaId}
      ORDER BY tipo, criado_em
    `
    return NextResponse.json(passos)
  } catch (err: any) {
    console.error('Erro ao buscar passos customizados:', err)
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
    const { culto_data, area_id, titulo, descricao, tipo } = body

    if (!culto_data || !area_id || !titulo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Verificar permissão: admin ou coordenador da área
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

    // Apenas admin e coordenadores podem adicionar passos
    const ehAdmin = user.role === 'admin'
    const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${area_id}.coordenador`)

    if (!ehAdmin && !ehCoordenador) {
      return NextResponse.json(
        { error: 'Apenas admin e coordenadores podem adicionar passos' },
        { status: 403 }
      )
    }

    // Adicionar novo passo customizado
    const result = await sql`
      INSERT INTO checklist_passos_customizados (culto_data, area_id, titulo, descricao, tipo)
      VALUES (${culto_data}, ${area_id}, ${titulo}, ${descricao || ''}, ${tipo || 'pre'})
      RETURNING id, titulo, descricao, tipo, criado_em
    `

    return NextResponse.json(result[0])
  } catch (err: any) {
    console.error('Erro ao adicionar passo customizado:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
