import { NextRequest, NextResponse } from 'next/server'
import { getMotivosoracao, criarMotivoOracao, getDb } from '@/lib/db'
import { requirePermission, unauthorized } from '@/lib/guard'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const motivos = await getMotivosoracao()
    return NextResponse.json(motivos)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar motivos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const body = await req.json()

    if (!body.motivo?.trim()) {
      return NextResponse.json({ error: 'Motivo é obrigatório' }, { status: 400 })
    }

    if (!body.data_fim) {
      return NextResponse.json({ error: 'Data fim é obrigatória' }, { status: 400 })
    }

    if (body.motivo.length > 500) {
      return NextResponse.json({ error: 'Motivo não pode exceder 500 caracteres' }, { status: 400 })
    }

    const id = await criarMotivoOracao({
      motivo: body.motivo.trim(),
      data_fim: body.data_fim,
    })

    const sql = getDb()
    const rows = await sql`SELECT id, motivo, data_fim, ativo, data_criacao FROM motivos_oracao WHERE id = ${id}`
    return NextResponse.json(rows[0])
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao criar motivo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
