import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { getPastores, criarPastor, criarUsuario } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper para obter conexão do banco
function getDb() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL não configurado.')
  const { neon } = require('@neondatabase/serverless')
  const url = raw
    .replace(/[?&]channel_binding=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '')
  return neon(url)
}

export async function GET(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const rows = await getPastores()
    return NextResponse.json(rows)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const body = await req.json()
    if (!body.nome) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })

    const id = await criarPastor(body)

    // Se informou usuário e senha, criar usuário do sistema com acesso à agenda
    if (body.usuario?.trim() && (body.senha as string)?.trim()) {
      try {
        const usuarioId = await criarUsuario({
          usuario: body.usuario.trim(),
          senha: body.senha,
          nome: body.nome,
          role: 'pastor',
          modulos: 'pastor',
        })

        // Atualizar pastor com o usuario_id
        const sql = getDb()
        await sql`UPDATE pastores SET usuario_id = ${usuarioId} WHERE id = ${id}`
      } catch (err) {
        // Se falhar ao criar usuário, apenas log mas não falha a criação do pastor
        console.error('Erro ao criar usuário do pastor:', err)
      }
    }

    return NextResponse.json({ id }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
