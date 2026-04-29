import { NextResponse } from 'next/server'
import {
  getContaPagar,
  updateContaPagar,
  deleteContaPagar,
} from '@/lib/financeiro'

// GET /api/financeiro/contas-pagar/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const conta = await getContaPagar(id)
    
    if (!conta) {
      return NextResponse.json({ error: 'Conta a pagar não encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(conta)
  } catch (error) {
    console.error('Erro ao buscar conta a pagar:', error)
    return NextResponse.json({ error: 'Erro ao buscar conta a pagar' }, { status: 500 })
  }
}

// PUT /api/financeiro/contas-pagar/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const dados = await req.json()
    await updateContaPagar(id, dados)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar conta a pagar:', error)
    return NextResponse.json({ error: 'Erro ao atualizar conta a pagar' }, { status: 500 })
  }
}

// DELETE /api/financeiro/contas-pagar/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    await deleteContaPagar(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar conta a pagar:', error)
    return NextResponse.json({ error: 'Erro ao deletar conta a pagar' }, { status: 500 })
  }
}
