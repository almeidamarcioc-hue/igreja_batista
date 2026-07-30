import { NextRequest } from 'next/server'
import { COOKIE_NAME, verifySessionToken } from '@/lib/session'
import { getDb } from '@/lib/db'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

// Autorização por área da Comunicação.
// Cada área é liberada por permissões no formato `comunicacao:<areaId>` (e
// variantes `.visualizar`, `.criar`, `.editar`, `.excluir`). Admin e perfis com
// `*` acessam todas. Sem este filtro, um líder de uma área veria as demais.

export interface ComunicacaoUser {
  id: number
  role: string
  permissoes: string[]
}

export async function getComunicacaoUser(req: NextRequest): Promise<ComunicacaoUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const userId = await verifySessionToken(token)
  if (!userId) return null

  const sql = getDb()
  const rows = await sql`
    SELECT u.id, u.role, u.ativo, COALESCE(p.permissoes, '[]') AS permissoes
    FROM usuarios u
    LEFT JOIN perfis_acesso p ON p.id = u.perfil_id
    WHERE u.id = ${userId}
  `
  const u = rows[0] as any
  if (!u || !u.ativo) return null

  let permissoes: string[] = []
  try {
    const parsed = JSON.parse(u.permissoes || '[]')
    if (Array.isArray(parsed)) permissoes = parsed.filter((x: unknown): x is string => typeof x === 'string')
  } catch {
    permissoes = []
  }

  return { id: Number(u.id), role: String(u.role ?? ''), permissoes }
}

export function temAcessoTotal(user: ComunicacaoUser): boolean {
  return user.role === 'admin' || user.permissoes.includes('*')
}

/** True se o usuário pode ver/operar a área informada. */
export function podeVerArea(user: ComunicacaoUser, areaId: string): boolean {
  if (temAcessoTotal(user)) return true
  return user.permissoes.some(p => p.startsWith(`comunicacao:${areaId}`))
}

/** Ids das áreas que o usuário pode ver. */
export function areasPermitidas(user: ComunicacaoUser): string[] {
  return PROCEDIMENTOS.areas.map(a => a.id).filter(id => podeVerArea(user, id))
}
