import { NextRequest, NextResponse } from 'next/server'
import { getConfiguracoes, updateConfiguracoes } from '@/lib/db'
import { requirePermission, unauthorized } from '@/lib/guard'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const isPublic = req.nextUrl.pathname === '/api/configuracoes' && new URL(req.url).searchParams.has('public')

    if (!isPublic && !await requirePermission(req, 'secretaria')) {
      return unauthorized()
    }

    const config = await getConfiguracoes()

    if (isPublic) {
      return NextResponse.json({ imagem_fundo_dashboard: config.imagem_fundo_dashboard })
    }

    return NextResponse.json(config)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar configurações'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const body = await req.json()
    await updateConfiguracoes(body)
    const config = await getConfiguracoes()
    return NextResponse.json(config)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar configurações'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
