import { NextRequest, NextResponse } from 'next/server'
import { deletarFerias } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deletarFerias(Number(params.id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
