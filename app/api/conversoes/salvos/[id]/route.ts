import { NextRequest, NextResponse } from 'next/server'
import { getSalvo, updateSalvo, deleteSalvo } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const salvo = await getSalvo(id)
    if (!salvo) {
      return NextResponse.json({ error: 'Salvo não encontrado' }, { status: 404 })
    }
    return NextResponse.json(salvo)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar salvo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const body = await req.json()

    const updated = await updateSalvo(id, {
      nome: body.nome,
      telefone: body.telefone,
      nome_responsavel: body.nome_responsavel,
      data_cadastro: body.data_cadastro,
      idade: body.idade ? Number(body.idade) : null,
      endereco: body.endereco || '',
      numero: body.numero || '',
      complemento: body.complemento || '',
      bairro: body.bairro || '',
      cidade: body.cidade || '',
      uf: body.uf || '',
      servo_facilitador_id: body.servo_facilitador_id || null,
      data_atribuicao: body.data_atribuicao || null,
      ativo: body.ativo !== undefined ? body.ativo : true,
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar salvo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    await deleteSalvo(id)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao deletar salvo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
