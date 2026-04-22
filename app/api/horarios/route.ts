import { NextRequest, NextResponse } from 'next/server'
import { getHorarios, salvarHorarios } from '@/lib/db'
import type { HorarioAtendimento } from '@/lib/db'

export async function GET() {
  try {
    const horarios = await getHorarios()
    return NextResponse.json(horarios)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const horarios: HorarioAtendimento[] = await request.json()
    if (!Array.isArray(horarios) || horarios.length !== 7) {
      return NextResponse.json({ error: 'Esperado array de 7 dias.' }, { status: 400 })
    }
    await salvarHorarios(horarios)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
