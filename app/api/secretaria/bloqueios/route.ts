import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { getBloqueios, criarBloqueio, criarBloqueiosDia, deleteBloqueiosDia } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { searchParams } = new URL(req.url)
    const pastorId = Number(searchParams.get('pastorId') ?? '0')
    const dataInicio = searchParams.get('dataInicio') ?? ''
    const dataFim = searchParams.get('dataFim') ?? ''
    const rows = await getBloqueios(pastorId, dataInicio, dataFim)
    return NextResponse.json(rows)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const body = await req.json()
    const { pastorId, data, hora, horaInicio, horaFim, motivo } = body

    if (hora === 'dia') {
      await criarBloqueiosDia(Number(pastorId), data, motivo || 'Dia bloqueado')
      return NextResponse.json({ ok: true })
    }

    // Bloquear período (horaInicio até horaFim)
    if (horaInicio && horaFim) {
      const HORAS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']
      const idxInicio = HORAS.indexOf(horaInicio)
      const idxFim = HORAS.indexOf(horaFim)
      if (idxInicio === -1 || idxFim === -1 || idxInicio >= idxFim) {
        return NextResponse.json({ error: 'Período inválido' }, { status: 400 })
      }
      const ids: number[] = []
      for (let i = idxInicio; i < idxFim; i++) {
        const id = await criarBloqueio(Number(pastorId), data, HORAS[i], motivo)
        ids.push(id)
      }
      return NextResponse.json({ ok: true, ids }, { status: 201 })
    }

    // Bloquear horário específico
    const id = await criarBloqueio(Number(pastorId), data, hora, motivo)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { searchParams } = new URL(req.url)
    const pastorId = Number(searchParams.get('pastorId') ?? '0')
    const data = searchParams.get('data') ?? ''
    await deleteBloqueiosDia(pastorId, data)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
