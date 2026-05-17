import { NextRequest, NextResponse } from 'next/server'
import { updateSalvo, deleteSalvo, getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const sql = getDb()

    const rows = await sql`
      SELECT s.id, s.nome_responsavel, s.data_cadastro, s.nome, s.telefone, s.idade, s.data_nascimento, s.endereco, s.numero, s.complemento, s.bairro, s.cidade, s.uf, s.servo_facilitador_id, s.data_atribuicao, s.ativo, s.data_criacao,
             sf.id AS servo_id, sf.nome AS servo_nome, sf.telefone AS servo_telefone, sf.data_nascimento AS servo_data_nascimento, sf.genero AS servo_genero
      FROM salvos s
      LEFT JOIN servos_facilitadores sf ON s.servo_facilitador_id = sf.id
      WHERE s.id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Salvo não encontrado' }, { status: 404 })
    }

    const r = rows[0] as any
    const result = {
      id: r.id,
      nome_responsavel: r.nome_responsavel,
      data_cadastro: r.data_cadastro,
      nome: r.nome,
      telefone: r.telefone,
      idade: r.idade,
      data_nascimento: r.data_nascimento,
      endereco: r.endereco,
      numero: r.numero,
      complemento: r.complemento,
      bairro: r.bairro,
      cidade: r.cidade,
      uf: r.uf,
      servo_facilitador_id: r.servo_facilitador_id,
      data_atribuicao: r.data_atribuicao,
      ativo: r.ativo,
      data_criacao: r.data_criacao,
      servo: r.servo_id ? {
        id: r.servo_id,
        nome: r.servo_nome || '',
        telefone: r.servo_telefone || '',
        data_nascimento: r.servo_data_nascimento || '',
        genero: r.servo_genero || 'M',
      } : undefined,
    }

    return NextResponse.json(result)
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

    // If only updating servo assignment
    if (body.servo_facilitador_id !== undefined && Object.keys(body).length <= 2) {
      const sql = getDb()
      const servoId = body.servo_facilitador_id ? Number(body.servo_facilitador_id) : null

      console.log('[SERVO] Starting servo assignment:', { id, servoId })

      try {
        // Step 1: Check if salvo exists
        const checkRows = await sql`SELECT id FROM salvos WHERE id = ${id}`
        if (checkRows.length === 0) {
          console.log('[SERVO] Salvo not found')
          return NextResponse.json({ error: 'Salvo não encontrado' }, { status: 404 })
        }
        console.log('[SERVO] Salvo exists')

        // Step 2: Update servo_facilitador_id
        await sql`UPDATE salvos SET servo_facilitador_id = ${servoId} WHERE id = ${id}`
        console.log('[SERVO] Updated servo_facilitador_id')

        // Step 3: If servo is being assigned, update data_atribuicao
        if (servoId !== null) {
          await sql`UPDATE salvos SET data_atribuicao = NOW() WHERE id = ${id}`
          console.log('[SERVO] Updated data_atribuicao')
        }

        // Step 4: Fetch and return updated salvo
        const rows = await sql`
          SELECT s.id, s.nome_responsavel, s.data_cadastro, s.nome, s.telefone, s.idade, s.data_nascimento, s.endereco, s.numero, s.complemento, s.bairro, s.cidade, s.uf, s.servo_facilitador_id, s.data_atribuicao, s.ativo, s.data_criacao,
                 sf.id AS servo_id, sf.nome AS servo_nome, sf.telefone AS servo_telefone, sf.data_nascimento AS servo_data_nascimento, sf.genero AS servo_genero
          FROM salvos s
          LEFT JOIN servos_facilitadores sf ON s.servo_facilitador_id = sf.id
          WHERE s.id = ${id}
        `

        if (rows.length === 0) {
          console.log('[SERVO] Salvo not found after update')
          return NextResponse.json({ error: 'Salvo não encontrado' }, { status: 404 })
        }

        const r = rows[0] as any
        const result = {
          id: r.id,
          nome_responsavel: r.nome_responsavel,
          data_cadastro: r.data_cadastro,
          nome: r.nome,
          telefone: r.telefone,
          idade: r.idade,
          data_nascimento: r.data_nascimento,
          endereco: r.endereco,
          numero: r.numero,
          complemento: r.complemento,
          bairro: r.bairro,
          cidade: r.cidade,
          uf: r.uf,
          servo_facilitador_id: r.servo_facilitador_id,
          data_atribuicao: r.data_atribuicao,
          ativo: r.ativo,
          data_criacao: r.data_criacao,
          servo: r.servo_id ? {
            id: r.servo_id,
            nome: r.servo_nome || '',
            telefone: r.servo_telefone || '',
            data_nascimento: r.servo_data_nascimento || '',
            genero: r.servo_genero || 'M',
          } : undefined,
        }

        console.log('[SERVO] Success, returning updated salvo')
        return NextResponse.json(result)
      } catch (err) {
        console.error('[SERVO] Error during update:', err)
        throw err
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
      data_nascimento: body.data_nascimento || '',
      endereco: body.endereco?.trim() || '',
      numero: body.numero?.trim() || '',
      complemento: body.complemento?.trim() || '',
      bairro: body.bairro?.trim() || '',
      cidade: body.cidade?.trim() || '',
      uf: body.uf?.trim() || '',
    })

    const sql = getDb()
    const rows = await sql`
      SELECT s.id, s.nome_responsavel, s.data_cadastro, s.nome, s.telefone, s.idade, s.data_nascimento, s.endereco, s.numero, s.complemento, s.bairro, s.cidade, s.uf, s.servo_facilitador_id, s.data_atribuicao, s.ativo, s.data_criacao,
             sf.id AS servo_id, sf.nome AS servo_nome, sf.telefone AS servo_telefone, sf.data_nascimento AS servo_data_nascimento, sf.genero AS servo_genero
      FROM salvos s
      LEFT JOIN servos_facilitadores sf ON s.servo_facilitador_id = sf.id
      WHERE s.id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Salvo não encontrado' }, { status: 404 })
    }

    const r = rows[0] as any
    const result = {
      id: r.id,
      nome_responsavel: r.nome_responsavel,
      data_cadastro: r.data_cadastro,
      nome: r.nome,
      telefone: r.telefone,
      idade: r.idade,
      data_nascimento: r.data_nascimento,
      endereco: r.endereco,
      numero: r.numero,
      complemento: r.complemento,
      bairro: r.bairro,
      cidade: r.cidade,
      uf: r.uf,
      servo_facilitador_id: r.servo_facilitador_id,
      data_atribuicao: r.data_atribuicao,
      ativo: r.ativo,
      data_criacao: r.data_criacao,
      servo: r.servo_id ? {
        id: r.servo_id,
        nome: r.servo_nome || '',
        telefone: r.servo_telefone || '',
        data_nascimento: r.servo_data_nascimento || '',
        genero: r.servo_genero || 'M',
      } : undefined,
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar salvo'
    console.error('[ERROR] Erro ao atualizar salvo:', msg, error)
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
    const msg = error instanceof Error ? error.message : 'Erro ao deletar servo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
