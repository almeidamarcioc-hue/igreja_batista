import { NextRequest, NextResponse } from 'next/server'
import { getSalvos } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const salvos = await getSalvos()
    return NextResponse.json(salvos)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar salvos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
