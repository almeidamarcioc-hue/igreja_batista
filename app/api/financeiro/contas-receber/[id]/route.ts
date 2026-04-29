import { NextResponse } from 'next/server'
import {
  getContaReceber,
  updateContaReceber,
  deleteContaReceber,
} from '@/lib/financeiro'

// GET /api/financeiro/contas-receber/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const conta = await getContaReceber(id)
    
    if (!conta) {
      return NextResponse.json({ error: 'Conta a receber não encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(conta)
  } catch (error) {
    console.error('Erro ao buscar conta a receber:', error)
    return NextResponse.json({ error: 'Erro ao buscar conta a receber' }, { status: 500 })
  }
}

// PUT /api/financeiro/contas-receber/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const dados = await req.json()
    await updateContaReceber(id, dados)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar conta a receber:', error)
    return NextResponse.json({ error: 'Erro ao atualizar conta a receber' }, { status: 500 })
  }
}

// DELETE /api/financeiro/contas-receber/[id]Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr
    const id = parseInt(params.id)
    await deleteContaReceber(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar conta a receber:', error)
    return NextResponse.json({ error: 'Erro ao deletar conta a receber' }, { status: 500 })
  }
}
