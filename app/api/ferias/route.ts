import { NextRequest, NextResponse } from 'next/server'
import { getFerias, criarFerias } from '@/lib/db'

export async function GET(request: NextRequest) {
  const pastorId = request.nextUrl.searchParams.get('pastorId')
  if (!pastorId) return NextResponse.json({ error: 'pastorId obrigatório' }, { status: 400 })
  try {
    const rows = await getFerias(Number(pastorId))
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pastorId, dataInicio, dataFim, motivo } = await request.json()
    if (!pastorId || !dataInicio || !dataFim) return NextResponse.json({ error: 'Campos obrigatórios' }, { status: 400 })
    if (dataFim < dataInicio) return NextResponse.json({ error: 'Data fim deve ser após data início' }, { status: 400 })
    const id = await criarFerias(Number(pastorId), dataInicio, dataFim, motivo || 'Férias')
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
