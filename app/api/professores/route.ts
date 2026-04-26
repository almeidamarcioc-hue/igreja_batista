import { NextRequest, NextResponse } from 'next/server'
import { getProfessores, criarProfessor } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const professores = await getProfessores()
    return NextResponse.json(professores)
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
    const professor = await criarProfessor({
      nome: body.nome.trim(),
      email: body.email ?? '',
      telefone: body.telefone ?? '',
      disciplina: body.disciplina ?? '',
      endereco: body.endereco ?? '',
      numero: body.numero ?? '',
      bairro: body.bairro ?? '',
      cidade: body.cidade ?? '',
      estado: body.estado ?? '',
      observacoes: body.observacoes ?? '',
    })
    return NextResponse.json(professor, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
