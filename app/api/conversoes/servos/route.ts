import { NextRequest, NextResponse } from 'next/server'
import { getServosFacilitadores } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q') || ''

    const servos = await getServosFacilitadores()

    const filtered = query
      ? servos.filter(s => s.nome.toLowerCase().includes(query.toLowerCase()))
      : servos

    return NextResponse.json(filtered)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao buscar servos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
