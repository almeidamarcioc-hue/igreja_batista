import { NextRequest, NextResponse } from 'next/server'
import { getMotivoOracaoAtivos } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const motivos = await getMotivoOracaoAtivos()
    return NextResponse.json(motivos)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar motivos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
