import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized, getCurrentUserId } from '@/lib/guard'
import { obterProgressoCulto, alternarPassoProgresso, obterResumoAreaCulto } from '@/lib/db'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requirePermission(req, 'comunicacao')) return unauthorized()
  try {
    const userId = await getCurrentUserId(req)
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const cultoData = searchParams.get('culto_data')
    const areaId = searchParams.get('area_id')

    if (!cultoData) {
      return NextResponse.json({ error: 'culto_data é obrigatório' }, { status: 400 })
    }

    if (areaId && areaId !== 'undefined') {
      // Retornar progresso de uma área específica para um usuário
      const passos = await obterProgressoCulto(cultoData, areaId, userId)
      const mapa = new Map(passos.map((p: any) => [p.passo_id, p.marcado]))

      const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)
      if (!area) {
        return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 })
      }

      const passosPre = area.fases.pre.filter(p => !area.pendente)
      const passosPos = area.fases.pos.filter(p => !area.pendente)
      const todosPassos = [...passosPre, ...passosPos]

      const resultado = {
        pre: passosPre.map(p => ({
          id: p.id,
          marcado: mapa.get(p.id) ?? false,
        })),
        pos: passosPos.map(p => ({
          id: p.id,
          marcado: mapa.get(p.id) ?? false,
        })),
        total: todosPassos.length,
        marcados: Array.from(mapa.values()).filter(Boolean).length,
      }

      return NextResponse.json(resultado)
    }

    // Retornar resumo de todas as áreas para um culto
    const resultado: Record<string, { total: number; marcados: number }> = {}

    for (const area of PROCEDIMENTOS.areas) {
      if (area.pendente) {
        resultado[area.id] = { total: 0, marcados: 0 }
        continue
      }

      const passos = await obterProgressoCulto(cultoData, area.id, userId)
      const marcados = passos.filter((p: any) => p.marcado).length
      const total = area.fases.pre.length + area.fases.pos.length

      resultado[area.id] = { total, marcados }
    }

    return NextResponse.json(resultado)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requirePermission(req, 'comunicacao')) return unauthorized()
  try {
    const userId = await getCurrentUserId(req)
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const { culto_data, area_id, passo_id, marcado } = body

    if (!culto_data || !area_id || !passo_id || marcado === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    await alternarPassoProgresso(culto_data, area_id, passo_id, userId, marcado)

    return NextResponse.json({ sucesso: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
