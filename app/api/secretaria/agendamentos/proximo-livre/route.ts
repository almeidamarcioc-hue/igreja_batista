import { NextRequest, NextResponse } from 'next/server'
import { requireModule, unauthorized } from '@/lib/guard'
import { getProximoHorarioLivre } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requireModule(req, 'secretaria')) return unauthorized()
  try {
    const { searchParams } = new URL(req.url)
    const pastorId = Number(searchParams.get('pastorId') ?? '0')
    const aPartir = searchParams.get('aPartir') ?? undefined
    const proximo = await getProximoHorarioLivre(pastorId, aPartir)
    return NextResponse.json({ proximo })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
