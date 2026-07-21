import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { obterResumoAreaCulto } from '@/lib/db'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requirePermission(req, 'comunicacao')) return unauthorized()
  try {
    const { searchParams } = new URL(req.url)
    const cultoData = searchParams.get('culto_data')

    if (!cultoData) {
      return NextResponse.json({ error: 'culto_data é obrigatório' }, { status: 400 })
    }

    const resultado: Array<{ areaId: string; total: number; marcados: number }> = []

    for (const area of PROCEDIMENTOS.areas) {
      if (area.pendente) {
        resultado.push({ areaId: area.id, total: 0, marcados: 0 })
        continue
      }

      const passos = await obterResumoAreaCulto(cultoData, area.id)
      const marcados = passos.filter((p: any) => p.marcado).length
      const total = area.fases.pre.length + area.fases.pos.length

      resultado.push({ areaId: area.id, total, marcados })
    }

    return NextResponse.json(resultado)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
