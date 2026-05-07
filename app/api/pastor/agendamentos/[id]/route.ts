import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { updateAgendamentoPastoral } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'pastor')) return unauthorized()
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
