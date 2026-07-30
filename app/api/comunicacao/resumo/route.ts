import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { obterResumoAreaCulto } from '@/lib/db'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import { getComunicacaoUser, podeVerArea } from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requirePermission(req, 'comunicacao')) return unauthorized()
  try {
    const { searchParams } = new URL(req.url)
    const cultoData = searchParams.get('culto_data')

    if (!cultoData) {
      return NextResponse.json({ error: 'culto_data é obrigatório' }, { status: 400 })
    }

    const user = await getComunicacaoUser(req)
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const resultado: Array<{ areaId: string; total: number; marcados: number }> = []

    // Só as áreas que o usuário pode ver — o resumo alimenta o dashboard
    for (const area of PROCEDIMENTOS.areas) {
      if (!podeVerArea(user, area.id)) continue

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
