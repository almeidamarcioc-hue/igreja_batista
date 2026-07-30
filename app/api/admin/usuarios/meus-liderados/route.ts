import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import {
  getUsuario,
  getUsuarios,
  getLideradosDoCoordenador,
  getAreasDoCoordenador,
  getPerfilOperadorDaArea,
  criarUsuario,
} from '@/lib/db'

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

    const usuario = await getUsuario(userId)
    if (!usuario) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    let usuarios
    if (usuario.role === 'admin') {
      // Admin vê TODOS os usuários
      usuarios = await getUsuarios()
    } else {
      // Coordenador vê os usuários da(s) área(s) que lidera + os que ele criou
      usuarios = await getLideradosDoCoordenador(userId)
    }

    return NextResponse.json(usuarios)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Cria um operador na área do coordenador. O perfil e a área são resolvidos no
// servidor a partir das permissões de quem está autenticado — o cliente não
// escolhe perfil, então um coordenador não pode criar acesso a outra área.
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAdminOrCoordenador(req)
    if (!userId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })

    const areas = await getAreasDoCoordenador(userId)
    if (areas.length === 0) {
      return NextResponse.json(
        { error: 'Sua conta não está vinculada a uma área de comunicação. Use a tela de Configurações.' },
        { status: 400 },
      )
    }
    if (areas.length > 1) {
      return NextResponse.json(
        { error: 'Sua conta tem permissões em múltiplas áreas. Essa funcionalidade está em desenvolvimento.' },
        { status: 400 },
      )
    }

    const perfilId = await getPerfilOperadorDaArea(areas[0])
    if (!perfilId) {
      return NextResponse.json(
        { error: 'Perfil de operador não disponível para sua área. Contate o administrador.' },
        { status: 400 },
      )
    }

    const { usuario, nome, email, senha } = await req.json()
    if (!usuario?.trim() || !nome?.trim() || !senha?.trim()) {
      return NextResponse.json({ error: 'Nome, usuário e senha são obrigatórios.' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'E-mail é obrigatório para recuperação de senha.' }, { status: 400 })
    }
    if (senha.trim().length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    const id = await criarUsuario({
      usuario: usuario.trim().toLowerCase(),
      nome: nome.trim(),
      email: email.trim(),
      senha,
      role: 'usuario',
      modulos: 'comunicacao',
      perfil_id: perfilId,
      criado_por_usuario_id: userId,
    })

    return NextResponse.json({ id }, { status: 201 })
  } catch (e: any) {
    const isDup =
      e.message?.includes('unique') ||
      e.message?.includes('duplicate') ||
      e.message?.includes('usuarios_usuario_key')
    return NextResponse.json(
      { error: isDup ? 'Nome de usuário já existe.' : e.message },
      { status: isDup ? 409 : 500 },
    )
  }
}
