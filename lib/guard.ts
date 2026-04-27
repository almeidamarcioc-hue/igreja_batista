import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario } from '@/lib/db'

export type AuthUser = {
  id: number
  usuario: string
  nome: string
  role: string
  modulos: string
  ativo: boolean
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

export function unauthorized() {
  return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
}
