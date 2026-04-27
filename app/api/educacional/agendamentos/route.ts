import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { requirePermission, unauthorized } from '@/lib/guard'
import { getAgendamentosEdu, criarAgendamentoEdu } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await requirePermission(req, 'educacional')) return unauthorized()
  try {
    const { searchParams } = new URL(req.url)
    const turma_id = searchParams.get('turma_id')
    const data = searchParams.get('data')
    const data_inicio = searchParams.get('data_inicio')
    const data_fim = searchParams.get('data_fim')
    const rows = await getAgendamentosEdu({
      turma_id: turma_id ? Number(turma_id) : undefined,
      data: data ?? undefined,
      data_inicio: data_inicio ?? undefined,
      data_fim: data_fim ?? undefined,
    })
    return NextResponse.json(rows)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + weeks * 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  if (!await requirePermission(req, 'educacional')) return unauthorized()
  try {
    const body = await req.json()
    if (!body.turma_id) return NextResponse.json({ error: 'Turma é obrigatória.' }, { status: 400 })
    if (!body.data) return NextResponse.json({ error: 'Data é obrigatória.' }, { status: 400 })
    if (!body.hora) return NextResponse.json({ error: 'Hora é obrigatória.' }, { status: 400 })

    const semanas = Math.min(Math.max(Number(body.recorrencia_semanas) || 1, 1), 52)
    const base = {
      turma_id: Number(body.turma_id),
      aluno_id: body.aluno_id ? Number(body.aluno_id) : null,
      professor_id: body.professor_id ? Number(body.professor_id) : null,
      hora: body.hora,
      duracao_min: body.duracao_min ?? 50,
      assunto: body.assunto ?? '',
      status: body.status ?? 'confirmado',
      observacoes: body.observacoes ?? '',
    }

    const recorrencia_id = semanas > 1 ? randomUUID() : null
    const criados = []
    for (let i = 0; i < semanas; i++) {
      const ag = await criarAgendamentoEdu({ ...base, data: addWeeks(body.data, i), recorrencia_id })
      criados.push(ag)
    }

    return NextResponse.json(
      semanas === 1 ? criados[0] : { criados: semanas, primeiro_id: criados[0].id },
      { status: 201 }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
