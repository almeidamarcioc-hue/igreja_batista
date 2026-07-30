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
  perfilNome: string
}

// Perfis antigos (semeados) só têm permissões genéricas `comunicacao.*`, sem a
// área. Para eles a área é deduzida do nome do perfil — sem isso ficariam sem
// acesso a nada, e tratar a permissão genérica como "todas as áreas" era
// justamente o furo que deixava um líder ver as demais áreas.
const AREA_LABELS: Record<string, string[]> = {
  'transmissao-youtube': ['transmissão', 'transmissao'],
  'mix-som': ['mix de som', 'mix'],
  'datashow': ['datashow'],
  'cameras': ['câmeras', 'cameras'],
  'iluminacao': ['iluminação', 'iluminacao'],
}

export async function getComunicacaoUser(req: NextRequest): Promise<ComunicacaoUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const userId = await verifySessionToken(token)
  if (!userId) return null

  const sql = getDb()
  const rows = await sql`
    SELECT u.id, u.role, u.ativo, COALESCE(p.permissoes, '[]') AS permissoes,
           COALESCE(p.nome, '') AS perfil_nome
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

  return {
    id: Number(u.id),
    role: String(u.role ?? ''),
    permissoes,
    perfilNome: String(u.perfil_nome ?? ''),
  }
}

export function temAcessoTotal(user: ComunicacaoUser): boolean {
  if (user.role === 'admin' || user.permissoes.includes('*')) return true
  // "Coordenador Geral" enxerga todas as áreas
  return user.perfilNome.toLowerCase().includes('coordenador geral')
}

/** True se o usuário pode ver/operar a área informada. */
export function podeVerArea(user: ComunicacaoUser, areaId: string): boolean {
  if (temAcessoTotal(user)) return true

  // Regra principal: permissão com a área explícita
  if (user.permissoes.some(p => p.startsWith(`comunicacao:${areaId}`))) return true

  // Perfil antigo: nenhuma permissão traz a área, então usa o nome do perfil.
  // Só vale se ele tiver alguma permissão de comunicação.
  const temAlgumaScoped = user.permissoes.some(p => p.startsWith('comunicacao:'))
  const temGenerica = user.permissoes.some(p => p === 'comunicacao' || p.startsWith('comunicacao.'))
  if (!temAlgumaScoped && temGenerica) {
    const nome = user.perfilNome.toLowerCase()
    const labels = AREA_LABELS[areaId] ?? []
    return labels.some(l => nome.includes(l))
  }

  return false
}

/**
 * True se o usuário pode gerenciar o template da área (incluir/editar/remover
 * passos). A tela de perfis grava `.editar`/`.excluir`, nunca `.coordenador` —
 * exigir só `.coordenador` tornava o gerenciamento exclusivo do admin.
 */
export function podeGerenciarArea(user: ComunicacaoUser, areaId: string): boolean {
  if (temAcessoTotal(user)) return true
  if (!podeVerArea(user, areaId)) return false

  const scoped = user.permissoes.filter(p => p.startsWith(`comunicacao:${areaId}`))
  if (scoped.some(p => p.endsWith('.coordenador') || p.endsWith('.editar') || p.endsWith('.excluir'))) {
    return true
  }

  // Perfil antigo (sem área nas permissões): cai para o nome do perfil
  const temAlgumaScoped = user.permissoes.some(p => p.startsWith('comunicacao:'))
  if (!temAlgumaScoped) {
    const nome = user.perfilNome.toLowerCase()
    const temGenericaEditar = user.permissoes.some(p => p === 'comunicacao.editar' || p === 'comunicacao.excluir')
    return temGenericaEditar && nome.includes('coordenador')
  }

  return false
}

/** Ids das áreas que o usuário pode ver. */
export function areasPermitidas(user: ComunicacaoUser): string[] {
  return PROCEDIMENTOS.areas.map(a => a.id).filter(id => podeVerArea(user, id))
}
