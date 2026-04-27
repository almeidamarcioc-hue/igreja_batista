import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario, getPerfil } from '@/lib/db'

export type AuthUser = {
  id: number
  usuario: string
  nome: string
  role: string
  modulos: string
  ativo: boolean
}

const METHOD_ACAO: Record<string, string> = {
  GET: 'visualizar',
  POST: 'criar',
  PUT: 'editar',
  PATCH: 'editar',
  DELETE: 'excluir',
}

function hasModule(modulos: string, mod: string): boolean {
  return modulos === '*' || modulos.split(',').map(m => m.trim()).includes(mod)
}

export async function requireAuth(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const userId = await verifySessionToken(token)
  if (!userId) return null
  const user = await getUsuario(userId)
  if (!user || !(user as any).ativo) return null
  return user as AuthUser
}

export async function requireModule(req: NextRequest, mod: string): Promise<AuthUser | null> {
  const user = await requireAuth(req)
  if (!user) return null
  if (!hasModule(user.modulos, mod)) return null
  return user
}

// Verifica permissão do perfil + módulo. Usa o HTTP method para inferir a ação.
// Se o usuário não tiver perfil atribuído, cai no comportamento anterior (módulo apenas).
export async function requirePermission(req: NextRequest, mod: string): Promise<AuthUser | null> {
  const user = await requireAuth(req)
  if (!user) return null

  // Admin sempre tem acesso total
  if (user.role === 'admin') return user

  // Verifica acesso ao módulo
  if (!hasModule(user.modulos, mod)) return null

  const perfilId = (user as any).perfil_id
  if (!perfilId) return user // sem perfil: módulo é suficiente (retrocompatível)

  const perfil = await getPerfil(perfilId)
  if (!perfil) return user // perfil não encontrado: mantém acesso

  const perms: string[] = JSON.parse((perfil as any).permissoes || '[]')
  if (perms.includes('*')) return user

  const acao = METHOD_ACAO[req.method] ?? 'visualizar'
  if (perms.includes(`${mod}.${acao}`)) return user

  return null
}

export function unauthorized() {
  return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
}
