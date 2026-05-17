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
      try {
        const sql = getDb()
        const servoId = body.servo_facilitador_id ? Number(body.servo_facilitador_id) : null

        console.log('[SERVO] Updating servo assignment:', { id, servoId })

        // First, get current salvo data
        const currentSalvo = await getSalvo(id)
        console.log('[SERVO] Current salvo:', currentSalvo ? 'found' : 'not found')

        if (!currentSalvo) {
          console.log('[SERVO] Salvo not found with id:', id)
          return NextResponse.json({ error: 'Salvo não encontrado' }, { status: 404 })
        }

        // Update servo assignment
        console.log('[SERVO] Running UPDATE query')
        await sql`
          UPDATE salvos
          SET servo_facilitador_id = ${servoId},
              data_atribuicao = CASE WHEN ${servoId} IS NOT NULL THEN NOW() ELSE data_atribuicao END
          WHERE id = ${id}
        `
        console.log('[SERVO] UPDATE completed')

        // Fetch updated salvo
        console.log('[SERVO] Fetching updated salvo')
        const updated = await getSalvo(id)
        console.log('[SERVO] Updated salvo found:', updated ? 'yes' : 'no')

        if (!updated) {
          console.log('[SERVO] Failed to fetch updated salvo')
          // Return the current salvo with updated servo info
          return NextResponse.json({
            ...currentSalvo,
            servo_facilitador_id: servoId
          })
        }

        console.log('[SERVO] Success, returning updated salvo')
        return NextResponse.json(updated)
      } catch (servoError: unknown) {
        const msg = servoError instanceof Error ? servoError.message : 'Erro desconhecido ao associar servo'
        const stack = servoError instanceof Error ? servoError.stack : ''
        console.error('[SERVO] Error in servo association:', { msg, stack, servoError })
        return NextResponse.json({ error: `${msg}. Verifique os logs do servidor.` }, { status: 500 })
      }
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
