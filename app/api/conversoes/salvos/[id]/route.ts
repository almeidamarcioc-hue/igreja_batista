import { NextRequest, NextResponse } from 'next/server'
import { getSalvo, updateSalvo, deleteSalvo, getDb } from '@/lib/db'

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

    // If only updating servo assignment, do a direct SQL update
    if (body.servo_facilitador_id !== undefined && Object.keys(body).length <= 2) {
      const sql = getDb()
      const servoId = body.servo_facilitador_id ? Number(body.servo_facilitador_id) : null

      console.log('Updating servo assignment:', { id, servoId })

      await sql`
        UPDATE salvos
        SET servo_facilitador_id = ${servoId},
            data_atribuicao = CASE WHEN ${servoId} IS NOT NULL THEN NOW() ELSE data_atribuicao END
        WHERE id = ${id}
      `

      console.log('Update successful, fetching updated record')
      const rows = await sql`
        SELECT s.*, sf.id AS servo_id, sf.nome AS servo_nome, sf.telefone AS servo_telefone, sf.data_nascimento AS servo_data_nascimento, sf.genero AS servo_genero
        FROM salvos s
        LEFT JOIN servos_facilitadores sf ON s.servo_facilitador_id = sf.id
        WHERE s.id = ${id}
      `

      if (rows.length === 0) {
        console.error('Failed to fetch updated salvo after update')
        return NextResponse.json({ error: 'Salvo não encontrado após atualização' }, { status: 404 })
      }

      const r = rows[0] as any
      const updated_salvo = {
        ...r,
        servo: r.servo_id ? {
          id: r.servo_id,
          nome: r.servo_nome,
          telefone: r.servo_telefone,
          data_nascimento: r.servo_data_nascimento,
          genero: r.servo_genero,
        } : undefined,
      }

      console.log('Fetched updated salvo:', updated_salvo)
      return NextResponse.json(updated_salvo)
    }

    // Full update
    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (!body.telefone?.trim()) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    await updateSalvo(id, {
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
