import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { getPastor, updatePastor, deletePastor, pastorTemAgendamentos, criarUsuario } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper para obter conexão do banco
function getDb() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL não configurado.')
  const { neon } = require('@neondatabase/serverless')
  const url = raw
    .replace(/[?&]channel_binding=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '')
  return neon(url)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id } = await params
    const pastor = await getPastor(Number(id))
    if (!pastor) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(pastor)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id } = await params
    const body = await req.json()
    const pastorId = Number(id)

    // Se informou usuário e senha, criar usuário do sistema com acesso à agenda
    if (body.usuario?.trim() && (body.senha as string)?.trim()) {
      try {
        const usuarioTrim = body.usuario.trim()

        // Criar o usuário
        const usuarioId = await criarUsuario({
          usuario: usuarioTrim,
          senha: body.senha,
          nome: body.nome,
          role: 'pastor',
          modulos: 'pastor',
        })

        // Atualizar pastor com o usuario_id
        const sql = getDb()
        await sql`UPDATE pastores SET usuario_id = ${usuarioId} WHERE id = ${pastorId}`

        // Atualizar demais campos do pastor
        await updatePastor(pastorId, body)

        return NextResponse.json({
          ok: true,
          usuarioId,
          mensagem: 'Pastor e usuário atualizados com sucesso'
        })
      } catch (err: any) {
        console.error('Erro ao criar usuário do pastor:', err)
        // Se o usuário já existe, apenas atualizar o pastor
        if (err.message?.includes('UNIQUE') || err.message?.includes('duplicate')) {
          await updatePastor(pastorId, body)
          return NextResponse.json({
            ok: true,
            aviso: 'Usuário já existe, apenas pastor foi atualizado'
          })
        }
        throw err
      }
    }

    await updatePastor(pastorId, body)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requirePermission(req, 'secretaria')) return unauthorized()
  try {
    const { id } = await params
    const temAgs = await pastorTemAgendamentos(Number(id))
    if (temAgs) return NextResponse.json({ error: 'Este pastor possui agendamentos ativos e não pode ser excluído.' }, { status: 400 })
    await deletePastor(Number(id))
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
