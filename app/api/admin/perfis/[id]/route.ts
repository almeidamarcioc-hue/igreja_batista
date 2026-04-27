import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario, getPerfil, updatePerfil, deletePerfil } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function requireAdmin(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const userId = await verifySessionToken(token)
  if (!userId) return null
  const usuario = await getUsuario(userId)
  if (!usuario || usuario.role !== 'admin' || !usuario.ativo) return null
  return userId
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const { id } = await params
    const { nome, descricao, permissoes } = await req.json()
    if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
    await updatePerfil(Number(id), { nome: nome.trim(), descricao: descricao ?? '', permissoes })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdmin(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const { id } = await params
    const perfil = await getPerfil(Number(id)) as any
    if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 })
    if (perfil.padrao) return NextResponse.json({ error: 'Perfis padrão não podem ser excluídos.' }, { status: 400 })
    await deletePerfil(Number(id))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
