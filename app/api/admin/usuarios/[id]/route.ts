import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario, updateUsuario, deleteUsuario, coordenadorPodeGerenciar } from '@/lib/db'
import { requireAdminOuCoordenador } from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminOuCoordenador(req)
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
    const adminId = await requireAdminOuCoordenador(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })

    const { id } = await params
    const usuarioAlvo = await getUsuario(Number(id))
    if (!usuarioAlvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const usuarioAdmin = await getUsuario(adminId)
    if (!usuarioAdmin) return NextResponse.json({ error: 'Usuário autenticado não encontrado' }, { status: 404 })

    const body = await req.json()
    const { nome, senha, email, role, modulos, perfil_id, ativo } = body

    // Validar permissões: se coordenador, só pode editar seus liderados
    if (usuarioAdmin.role !== 'admin') {
      // Liderado = usuário da área que ele lidera, ou que ele mesmo criou
      if (!(await coordenadorPodeGerenciar(adminId, Number(id)))) {
        return NextResponse.json({ error: 'Você não tem permissão para editar este usuário' }, { status: 403 })
      }

      // Coordenador só pode editar senha e ativo
      if (nome !== undefined || email !== undefined || role !== undefined || modulos !== undefined || perfil_id !== undefined) {
        return NextResponse.json({ error: 'Você só pode editar a senha e o status do usuário' }, { status: 400 })
      }

      // Permitir editar apenas senha e ativo
      await updateUsuario(Number(id), { senha: senha || undefined, ativo })
    } else {
      // Admin pode editar qualquer campo
      await updateUsuario(Number(id), { nome, senha: senha || undefined, email: email !== undefined ? (email || null) : undefined, role, modulos, perfil_id: perfil_id !== undefined ? (perfil_id || null) : undefined, ativo })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminOuCoordenador(req)
    if (!adminId) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })

    const { id } = await params
    if (Number(id) === adminId) return NextResponse.json({ error: 'Não é possível excluir o próprio usuário.' }, { status: 400 })

    const usuarioAlvo = await getUsuario(Number(id))
    if (!usuarioAlvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    if ((usuarioAlvo as any).usuario === 'admin') {
      return NextResponse.json({ error: 'O usuário admin padrão não pode ser excluído.' }, { status: 400 })
    }

    const usuarioAdmin = await getUsuario(adminId)
    if (!usuarioAdmin) return NextResponse.json({ error: 'Usuário autenticado não encontrado' }, { status: 404 })

    // Admin exclui de fato; coordenador apenas desativa o próprio liderado
    if (usuarioAdmin.role === 'admin') {
      await deleteUsuario(Number(id))
      return NextResponse.json({ ok: true, excluido: true })
    }

    if (!(await coordenadorPodeGerenciar(adminId, Number(id)))) {
      return NextResponse.json({ error: 'Você não tem permissão para desativar este usuário' }, { status: 403 })
    }

    // Soft delete: marcar como inativo
    await updateUsuario(Number(id), { ativo: false })

    return NextResponse.json({ ok: true, excluido: false })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
