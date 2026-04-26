import { NextRequest, NextResponse } from 'next/server'
import { getAlunos, criarAluno } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const turma_id = searchParams.get('turma_id')
    const busca = searchParams.get('busca')
    const alunos = await getAlunos({
      turma_id: turma_id ? Number(turma_id) : undefined,
      busca: busca ?? undefined,
    })
    return NextResponse.json(alunos)
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
    const aluno = await criarAluno({
      nome: body.nome.trim(),
      email: body.email ?? '',
      telefone: body.telefone ?? '',
      data_nascimento: body.data_nascimento ?? '',
      turma_id: body.turma_id ?? null,
      responsavel: body.responsavel ?? '',
      telefone_responsavel: body.telefone_responsavel ?? '',
      endereco: body.endereco ?? '',
      numero: body.numero ?? '',
      bairro: body.bairro ?? '',
      cidade: body.cidade ?? '',
      estado: body.estado ?? '',
      observacoes: body.observacoes ?? '',
      ativo: body.ativo ?? true,
    })
    return NextResponse.json(aluno, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
