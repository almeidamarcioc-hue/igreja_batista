import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { criarBloqueio, criarBloqueiosDia } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!await requirePermission(req, 'pastor')) return unauthorized()
  try {
    const body = await req.json()
    const { pastorId, data, hora, motivo } = body
    if (hora === 'dia') {
      await criarBloqueiosDia(Number(pastorId), data, motivo || 'Dia bloqueado')
      return NextResponse.json({ ok: true })
    }
    const id = await criarBloqueio(Number(pastorId), data, hora, motivo)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
