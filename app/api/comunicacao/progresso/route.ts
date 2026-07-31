import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized, getCurrentUserId } from '@/lib/guard'
import { obterProgressoCulto, obterProgressoCultoEquipe, obterResponsaveisChecklist, alternarPassoProgresso, obterResumoAreaCulto } from '@/lib/db'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import { getComunicacaoUser, podeVerArea, podeGerenciarArea } from '@/lib/comunicacao/auth'
import { obterPassosEfetivos } from '@/lib/comunicacao/passos'

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
      const user = await getComunicacaoUser(req)
      if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      if (!podeVerArea(user, areaId)) {
        return NextResponse.json({ error: 'Acesso negado a esta área' }, { status: 403 })
      }

      // Quem coordena a área e está visualizando um checklist vê o resultado da
      // equipe. As marcações são gravadas por usuário, então olhando só as
      // próprias o coordenador veria a tela vazia. Na marcação (sem `equipe`)
      // continua sendo o progresso individual, coerente com o que ele grava.
      const verEquipe = searchParams.get('equipe') === '1' && podeGerenciarArea(user, areaId)
      const passos = verEquipe
        ? await obterProgressoCultoEquipe(cultoData, areaId)
        : await obterProgressoCulto(cultoData, areaId, userId)
      const mapa = new Map(passos.map((p: any) => [p.passo_id, p.marcado]))

      const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)
      if (!area) {
        return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 })
      }

      // Usa a lista efetiva (sem os removidos, com os customizados) para que os
      // contadores batam com o que a tela mostra
      const efetivos = await obterPassosEfetivos(areaId)
      const passosPre = area.pendente ? [] : (efetivos?.pre ?? area.fases.pre)
      const passosPos = area.pendente ? [] : (efetivos?.pos ?? area.fases.pos)
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
        // Só conta marcações de passos que ainda existem no template
        marcados: todosPassos.filter(p => mapa.get(p.id)).length,
        // Quem de fato preencheu — a tela mostrava só o responsável sugerido
        responsaveis: await obterResponsaveisChecklist(
          cultoData,
          areaId,
          verEquipe ? undefined : userId,
        ),
      }

      return NextResponse.json(resultado)
    }

    // Retornar resumo das áreas que o usuário pode ver
    const userResumo = await getComunicacaoUser(req)
    if (!userResumo) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const resultado: Record<string, { total: number; marcados: number }> = {}

    for (const area of PROCEDIMENTOS.areas) {
      if (!podeVerArea(userResumo, area.id)) continue

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

    if (area_id) {
      const user = await getComunicacaoUser(req)
      if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      if (!podeVerArea(user, area_id)) {
        return NextResponse.json({ error: 'Acesso negado a esta área' }, { status: 403 })
      }
    }

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
