import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario, updateUsuario, deleteUsuario } from '@/lib/db'

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
      return null
    }
  }

  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminOrCoordenador(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const { id } = await params
    const usuario = await getUsuario(Number(id))
    if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    return NextResponse.json(usuario)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminOrCoordenador(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const { nome, senha, email, role, modulos, perfil_id, ativo } = body
    await updateUsuario(Number(id), { nome, senha: senha || undefined, email: email !== undefined ? (email || null) : undefined, role, modulos, perfil_id: perfil_id !== undefined ? (perfil_id || null) : undefined, ativo })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminOrCoordenador(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const { id } = await params
    if (Number(id) === adminId) return NextResponse.json({ error: 'Não é possível excluir o próprio usuário.' }, { status: 400 })
    const alvo = await getUsuario(Number(id))
    if (alvo && (alvo as any).usuario === 'admin') {
      return NextResponse.json({ error: 'O usuário admin padrão não pode ser excluído.' }, { status: 400 })
    }
    await deleteUsuario(Number(id))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
