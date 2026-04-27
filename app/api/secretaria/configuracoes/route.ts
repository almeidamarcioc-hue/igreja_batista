import { NextRequest, NextResponse } from 'next/server'
import { requireModule, unauthorized } from '@/lib/guard'
import { getConfiguracoes, updateConfiguracoes } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requireModule(req, 'secretaria')) return unauthorized()
  try {
    const config = await getConfiguracoes()
    return NextResponse.json(config)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!await requireModule(req, 'secretaria')) return unauthorized()
  try {
    const body = await req.json()
    await updateConfiguracoes(body)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
