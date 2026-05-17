import { NextRequest, NextResponse } from 'next/server'
import { getSalvos, criarSalvo } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const salvos = await getSalvos()
    return NextResponse.json(salvos)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar salvos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome_responsavel, data_cadastro, nome, telefone } = body

    if (!nome_responsavel?.trim()) {
      return NextResponse.json({ error: 'Nome do responsável é obrigatório' }, { status: 400 })
    }
    if (!data_cadastro?.trim()) {
      return NextResponse.json({ error: 'Data do cadastro é obrigatória' }, { status: 400 })
    }
    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome do novo crente é obrigatório' }, { status: 400 })
    }
    if (!telefone?.trim()) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    const id = await criarSalvo({
      nome_responsavel: nome_responsavel.trim(),
      data_cadastro,
      nome: nome.trim(),
      telefone: telefone.trim(),
      idade: body.idade ? Number(body.idade) : null,
      endereco: (body.endereco as string)?.trim() || '',
      numero: (body.numero as string)?.trim() || '',
      complemento: (body.complemento as string)?.trim() || '',
      bairro: (body.bairro as string)?.trim() || '',
      cidade: (body.cidade as string)?.trim() || '',
      uf: (body.uf as string)?.trim() || '',
    })

    const salvo = await getSalvos()
    const newSalvo = salvo.find(s => s.id === id)
    return NextResponse.json(newSalvo || { id, ok: true }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao salvar dados'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
