import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getComunicacaoUser, podeGerenciarArea } from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'

/** Área do passo customizado, ou null se ele não existir. */
async function areaDoPasso(id: number): Promise<string | null> {
  const sql = getDb()
  const rows = await sql`SELECT area_id FROM checklist_passos_customizados WHERE id = ${id}`
  return rows.length > 0 ? String((rows[0] as any).area_id) : null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const passoId = parseInt(id)
    if (Number.isNaN(passoId)) {
      return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
    }

    const areaId = await areaDoPasso(passoId)
    if (!areaId) {
      return NextResponse.json({ error: 'Passo não encontrado' }, { status: 404 })
    }

    const user = await getComunicacaoUser(req)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!podeGerenciarArea(user, areaId)) {
      return NextResponse.json(
        { error: 'Apenas admin e coordenadores podem editar passos' },
        { status: 403 }
      )
    }

    const { titulo, descricao, tipo } = await req.json()
    if (!titulo?.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const sql = getDb()
    if (tipo) {
      await sql`
        UPDATE checklist_passos_customizados
        SET titulo = ${titulo.trim()}, descricao = ${descricao?.trim() ?? ''}, tipo = ${tipo}
        WHERE id = ${passoId}
      `
    } else {
      await sql`
        UPDATE checklist_passos_customizados
        SET titulo = ${titulo.trim()}, descricao = ${descricao?.trim() ?? ''}
        WHERE id = ${passoId}
      `
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Erro ao editar passo customizado:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const passoId = parseInt(id)
    if (Number.isNaN(passoId)) {
      return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
    }

    const areaId = await areaDoPasso(passoId)
    if (!areaId) {
      return NextResponse.json({ error: 'Passo não encontrado' }, { status: 404 })
    }

    const user = await getComunicacaoUser(req)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!podeGerenciarArea(user, areaId)) {
      return NextResponse.json(
        { error: 'Apenas admin e coordenadores podem remover passos' },
        { status: 403 }
      )
    }

    const sql = getDb()
    await sql`DELETE FROM checklist_passos_customizados WHERE id = ${passoId}`

    return NextResponse.json({ ok: true, message: 'Passo removido com sucesso' })
  } catch (err: any) {
    console.error('Erro ao remover passo customizado:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
