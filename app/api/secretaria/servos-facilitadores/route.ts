import { NextRequest, NextResponse } from 'next/server'
import { getServosFacilitadores, criarServoFacilitador } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const servos = await getServosFacilitadores()
    return NextResponse.json(servos)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar servos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (!body.data_nascimento?.trim()) {
      return NextResponse.json({ error: 'Data de nascimento é obrigatória' }, { status: 400 })
    }
    if (!body.telefone?.trim()) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    const id = await criarServoFacilitador({
      nome: body.nome.trim(),
      data_nascimento: body.data_nascimento,
      telefone: body.telefone.trim(),
      endereco: body.endereco?.trim() || '',
      numero: body.numero?.trim() || '',
      complemento: body.complemento?.trim() || '',
      bairro: body.bairro?.trim() || '',
      cidade: body.cidade?.trim() || '',
      uf: body.uf?.trim() || '',
    })

    return NextResponse.json({ id, ok: true }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao salvar servo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
