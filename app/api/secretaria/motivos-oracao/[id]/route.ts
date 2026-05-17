import { NextRequest, NextResponse } from 'next/server'
import { updateMotivoOracao, deleteMotivoOracao, toggleMotivoOracao, getDb } from '@/lib/db'
import { requirePermission, unauthorized } from '@/lib/guard'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const body = await req.json()

    // Toggle ativo
    if (body.ativo !== undefined && Object.keys(body).length === 1) {
      await toggleMotivoOracao(id)
      const sql = getDb()
      const rows = await sql`SELECT id, motivo, data_fim, ativo, data_criacao FROM motivos_oracao WHERE id = ${id}`
      return NextResponse.json(rows[0])
    }

    // Full update
    if (!body.motivo?.trim()) {
      return NextResponse.json({ error: 'Motivo é obrigatório' }, { status: 400 })
    }

    if (!body.data_fim) {
      return NextResponse.json({ error: 'Data fim é obrigatória' }, { status: 400 })
    }

    if (body.motivo.length > 500) {
      return NextResponse.json({ error: 'Motivo não pode exceder 500 caracteres' }, { status: 400 })
    }

    await updateMotivoOracao(id, {
      motivo: body.motivo.trim(),
      data_fim: body.data_fim,
      ativo: body.ativo !== undefined ? body.ativo : true,
    })

    const sql = getDb()
    const rows = await sql`SELECT id, motivo, data_fim, ativo, data_criacao FROM motivos_oracao WHERE id = ${id}`
    return NextResponse.json(rows[0])
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar motivo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    await deleteMotivoOracao(id)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao deletar motivo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
