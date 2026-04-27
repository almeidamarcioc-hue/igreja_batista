import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { getAgendamentoPastoral, updateAgendamentoPastoral, deleteAgendamentoPastoral } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id } = await params
    const ag = await getAgendamentoPastoral(Number(id))
    if (!ag) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(ag)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id } = await params
    const body = await req.json()
    await updateAgendamentoPastoral(Number(id), body)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id } = await params
    await deleteAgendamentoPastoral(Number(id))
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
