import { NextRequest, NextResponse } from 'next/server'
import { getAluno, updateAluno, deleteAluno } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const aluno = await getAluno(Number(id))
    if (!aluno) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
    return NextResponse.json(aluno)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const aluno = await updateAluno(Number(id), body)
    return NextResponse.json(aluno)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteAluno(Number(id))
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
