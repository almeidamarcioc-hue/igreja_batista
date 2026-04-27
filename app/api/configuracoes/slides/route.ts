import { NextRequest, NextResponse } from 'next/server'
import { initDb, getCarouselSlides, updateCarouselSlides } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initDb()
    const slides = await getCarouselSlides()
    return NextResponse.json(slides)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const slides = await req.json()
    if (!Array.isArray(slides)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }
    await updateCarouselSlides(slides)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
