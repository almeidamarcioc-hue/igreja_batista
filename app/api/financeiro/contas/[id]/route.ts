import { NextResponse } from 'next/server'
import {
  getConta,
  updateConta,
  deleteConta,
} from '@/lib/financeiro'

// GET /api/financeiro/contas/[id] - Obter uma conta
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const conta = await getConta(id)
    
    if (!conta) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(conta)
  } catch (error) {
    console.error('Erro ao buscar conta:', error)
    return NextResponse.json({ error: 'Erro ao buscar conta' }, { status: 500 })
  }
}

// PUT /api/financeiro/contas/[id] - Atualizar conta
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const dados = await req.json()
    await updateConta(id, dados)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar conta:', error)
    return NextResponse.json({ error: 'Erro ao atualizar conta' }, { status: 500 })
  }
}

// DELETE /api/financeiro/contas/[id] - Deletar conta
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    await deleteConta(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar conta:', error)
    return NextResponse.json({ error: 'Erro ao deletar conta' }, { status: 500 })
  }
}
