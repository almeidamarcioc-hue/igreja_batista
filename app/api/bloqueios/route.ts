import { NextRequest, NextResponse } from 'next/server'
import { getBloqueios, criarBloqueio, criarBloqueiosDia, deleteBloqueiosDia } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pastorId = searchParams.get('pastorId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    if (!pastorId || !dataInicio || !dataFim) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: pastorId, dataInicio, dataFim.' },
        { status: 400 }
      )
    }

    const bloqueios = await getBloqueios(parseInt(pastorId, 10), dataInicio, dataFim)
    return NextResponse.json(bloqueios)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pastorId, data, hora, motivo } = body

    if (!pastorId || !data) {
      return NextResponse.json({ error: 'Campos obrigatórios: pastorId, data.' }, { status: 400 })
    }

    if (!hora || hora === 'dia') {
      await criarBloqueiosDia(Number(pastorId), data, motivo || 'Dia bloqueado')
      return NextResponse.json({ success: true }, { status: 201 })
    }

    const id = await criarBloqueio(Number(pastorId), data, hora, motivo)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pastorId = searchParams.get('pastorId')
    const data = searchParams.get('data')
    if (!pastorId || !data) {
      return NextResponse.json({ error: 'pastorId e data obrigatórios' }, { status: 400 })
    }
    await deleteBloqueiosDia(Number(pastorId), data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
