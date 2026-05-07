import { NextRequest, NextResponse } from 'next/server'
import { criarUsuario } from '@/lib/db'
import { neon } from '@neondatabase/serverless'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  try {
    const raw = process.env.DATABASE_URL
    if (!raw) throw new Error('DATABASE_URL não configurado.')
    const url = raw
      .replace(/[?&]channel_binding=[^&]*/g, '')
      .replace(/\?&/, '?')
      .replace(/[?&]$/, '')

    const sql = neon(url)

    // Verificar se usuário já existe
    const usuarioExistente = await sql`SELECT id FROM usuarios WHERE usuario = 'pastor'`

    if ((usuarioExistente as unknown[]).length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Usuário pastor já existe',
        usuario: 'pastor',
        senha: 'pastor123',
      })
    }

    // Criar usuário "pastor"
    const hash = hashPassword('pastor123')
    const result = await sql`
      INSERT INTO usuarios (usuario, senha_hash, nome, role, modulos, ativo)
      VALUES ('pastor', ${hash}, 'Pastor Teste', 'pastor', 'pastor', true)
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: 'Usuário pastor criado com sucesso!',
      usuario: 'pastor',
      senha: 'pastor123',
      id: (result[0] as { id: number }).id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
