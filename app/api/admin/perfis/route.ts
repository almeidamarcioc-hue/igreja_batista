import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario, getPerfis, criarPerfil } from '@/lib/db'

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

export async function GET(req: NextRequest) {
  try {
    const adminId = await requireAdmin(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const perfis = await getPerfis()
    return NextResponse.json(perfis)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdmin(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    const { nome, descricao, permissoes } = await req.json()
    if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
    const id = await criarPerfil({ nome: nome.trim(), descricao: descricao ?? '', permissoes: permissoes ?? [] })
    return NextResponse.json({ id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
