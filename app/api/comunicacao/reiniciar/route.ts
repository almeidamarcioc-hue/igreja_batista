import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized, getCurrentUserId } from '@/lib/guard'
import { reiniciarAreaProgresso } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!await requirePermission(req, 'comunicacao')) return unauthorized()
  try {
    const userId = await getCurrentUserId(req)
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const { culto_data, area_id } = body

    if (!culto_data || !area_id) {
      return NextResponse.json({ error: 'culto_data e area_id são obrigatórios' }, { status: 400 })
    }

    await reiniciarAreaProgresso(culto_data, area_id, userId)

    return NextResponse.json({ sucesso: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
