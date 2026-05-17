import { NextRequest, NextResponse } from 'next/server'
import { getServoFacilitador, updateServoFacilitador, deleteServoFacilitador } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const servo = await getServoFacilitador(id)
    if (!servo) {
      return NextResponse.json({ error: 'Servo não encontrado' }, { status: 404 })
    }
    return NextResponse.json(servo)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar servo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
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

    await updateServoFacilitador(id, {
      nome: body.nome.trim(),
      data_nascimento: body.data_nascimento,
      telefone: body.telefone.trim(),
      genero: body.genero || 'M',
      endereco: body.endereco?.trim() || '',
      numero: body.numero?.trim() || '',
      complemento: body.complemento?.trim() || '',
      bairro: body.bairro?.trim() || '',
      cidade: body.cidade?.trim() || '',
      uf: body.uf?.trim() || '',
    })

    const updated = await getServoFacilitador(id)
    return NextResponse.json(updated)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar servo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    await deleteServoFacilitador(id)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao deletar servo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
