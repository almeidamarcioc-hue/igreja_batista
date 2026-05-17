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

    // If only updating servo assignment, allow partial update
    if (body.servo_facilitador_id !== undefined && Object.keys(body).length <= 2) {
      const salvo = await getSalvo(id)
      if (!salvo) {
        return NextResponse.json({ error: 'Salvo não encontrado' }, { status: 404 })
      }

      const updated = await updateSalvo(id, {
        nome: salvo.nome,
        telefone: salvo.telefone,
        nome_responsavel: salvo.nome_responsavel,
        data_cadastro: salvo.data_cadastro,
        idade: salvo.idade,
        endereco: salvo.endereco,
        numero: salvo.numero,
        complemento: salvo.complemento,
        bairro: salvo.bairro,
        cidade: salvo.cidade,
        uf: salvo.uf,
        servo_facilitador_id: body.servo_facilitador_id || null,
        data_atribuicao: body.data_atribuicao || null,
        ativo: salvo.ativo,
      })

      const updated_salvo = await getSalvo(id)
      return NextResponse.json(updated_salvo)
    }

    // Full update
    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (!body.telefone?.trim()) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    const updated = await updateSalvo(id, {
      nome: body.nome.trim(),
      telefone: body.telefone.trim(),
      nome_responsavel: body.nome_responsavel?.trim() || '',
      data_cadastro: body.data_cadastro || '',
      idade: body.idade ? Number(body.idade) : null,
      endereco: body.endereco?.trim() || '',
      numero: body.numero?.trim() || '',
      complemento: body.complemento?.trim() || '',
      bairro: body.bairro?.trim() || '',
      cidade: body.cidade?.trim() || '',
      uf: body.uf?.trim() || '',
      servo_facilitador_id: body.servo_facilitador_id || null,
      data_atribuicao: body.data_atribuicao || null,
      ativo: body.ativo !== undefined ? body.ativo : true,
    })

    const updated_salvo = await getSalvo(id)
    return NextResponse.json(updated_salvo)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar salvo'
    console.error('Erro ao atualizar salvo:', msg, error)
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
