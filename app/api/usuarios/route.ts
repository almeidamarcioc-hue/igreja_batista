import { NextRequest, NextResponse } from 'next/server'
import { getUsuarios, criarUsuario } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await getUsuarios()
    return NextResponse.json(rows)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.usuario || !body.senha || !body.nome) {
      return NextResponse.json({ error: 'Usuário, senha e nome são obrigatórios.' }, { status: 400 })
    }
    const id = await criarUsuario({
      usuario: body.usuario,
      senha: body.senha,
      nome: body.nome,
      role: body.role ?? 'admin',
      modulos: body.modulos ?? '*',
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Este nome de usuário já está em uso.' }, { status: 400 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
