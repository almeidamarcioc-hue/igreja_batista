import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario, getUsuarios, criarUsuario } from '@/lib/db'
import { requireAdminOuCoordenador } from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'


export async function GET(req: NextRequest) {
  try {
    const userId = await requireAdminOuCoordenador(req)
    if (!userId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const usuarios = await getUsuarios()
    return NextResponse.json(usuarios)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAdminOuCoordenador(req)
    if (!userId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })

    const { getDb } = await import('@/lib/db')
    const sql = getDb()
    const user = await sql`SELECT role FROM usuarios WHERE id = ${userId}`
    const userRole = user[0]?.role

    const body = await req.json()
    const { usuario, nome, email, senha, role, modulos, perfil_id } = body
    if (!usuario || !nome || !senha) return NextResponse.json({ error: 'Campos obrigatórios: usuario, nome, senha' }, { status: 400 })

    // Registrar criado_por_usuario_id apenas se coordenador, não admin
    const criado_por_usuario_id = userRole !== 'admin' ? userId : null

    const id = await criarUsuario({ usuario, nome, email: email || null, senha, role: role ?? 'usuario', modulos: modulos ?? 'secretaria', perfil_id: perfil_id || null, criado_por_usuario_id })
    return NextResponse.json({ id }, { status: 201 })
  } catch (e: any) {
    const isDup = e.message?.includes('unique') || e.message?.includes('duplicate') || e.message?.includes('usuarios_usuario_key')
    return NextResponse.json({ error: isDup ? 'Nome de usuário já existe.' : e.message }, { status: isDup ? 409 : 500 })
  }
}
