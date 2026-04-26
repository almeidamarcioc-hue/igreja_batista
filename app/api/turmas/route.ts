import { NextRequest, NextResponse } from 'next/server'
import { getTurmas, criarTurma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const turmas = await getTurmas()
    return NextResponse.json(turmas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
    }
    const turma = await criarTurma({
      nome: body.nome.trim(),
      descricao: body.descricao ?? '',
      professor_id: body.professor_id ?? null,
      turno: body.turno ?? 'Manhã',
      ano_letivo: body.ano_letivo ?? '',
      ativo: body.ativo ?? true,
    })
    return NextResponse.json(turma, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
