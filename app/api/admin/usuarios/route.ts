import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario, getUsuarios, criarUsuario } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function requireAdminOrCoordenador(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const userId = await verifySessionToken(token)
  if (!userId) return null
  const usuario = await getUsuario(userId)
  if (!usuario || !usuario.ativo) return null

  // Admin sempre tem acesso
  if (usuario.role === 'admin') return userId

  // Coordenadores de comunicação também têm acesso
  if (usuario.perfil_id) {
    try {
      const { getDb } = await import('@/lib/db')
      const sql = getDb()
      const perfil = await sql`SELECT permissoes FROM perfis_acesso WHERE id = ${usuario.perfil_id}`
      if (perfil.length > 0) {
        const permissoes = JSON.parse(perfil[0].permissoes)
        const ehCoordenador = permissoes.some((p: string) => {
          if (typeof p !== 'string') return false
          // Caso 1: permissão explícita de coordenador
          if (p.includes('comunicacao') && p.includes('coordenador')) return true
          // Caso 2: permissões de criar/editar em uma área (implicitamente coordenador)
          if (p.startsWith('comunicacao:') && (p.includes('.criar') || p.includes('.editar'))) return true
          return false
        })
        if (ehCoordenador) return userId
      }
    } catch (e) {
      // Erro ao verificar, nega acesso
      return null
    }
  }

  return null
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAdminOrCoordenador(req)
    if (!userId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const usuarios = await getUsuarios()
    return NextResponse.json(usuarios)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAdminOrCoordenador(req)
    if (!userId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const body = await req.json()
    const { usuario, nome, email, senha, role, modulos, perfil_id } = body
    if (!usuario || !nome || !senha) return NextResponse.json({ error: 'Campos obrigatórios: usuario, nome, senha' }, { status: 400 })
    const id = await criarUsuario({ usuario, nome, email: email || null, senha, role: role ?? 'usuario', modulos: modulos ?? 'secretaria', perfil_id: perfil_id || null })
    return NextResponse.json({ id }, { status: 201 })
  } catch (e: any) {
    const isDup = e.message?.includes('unique') || e.message?.includes('duplicate') || e.message?.includes('usuarios_usuario_key')
    return NextResponse.json({ error: isDup ? 'Nome de usuário já existe.' : e.message }, { status: isDup ? 409 : 500 })
  }
}
