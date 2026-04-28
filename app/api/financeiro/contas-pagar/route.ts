import { NextResponse } from 'next/server'
import {
  getContasPagar,
  getContaPagar,
  criarContaPagar,
  updateContaPagar,
  deleteContaPagar,
} from '@/lib/financeiro'

// GET /api/financeiro/contas-pagar - Listar todas as contas a pagar
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const ministerioId = searchParams.get('ministerioId')
      ? parseInt(searchParams.get('ministerioId')!)
      : undefined
    const dataInicio = searchParams.get('dataInicio') || undefined
    const dataFim = searchParams.get('dataFim') || undefined

    const contas = await getContasPagar({
      status,
      ministerioId,
      dataInicio,
      dataFim,
    })

    return NextResponse.json(contas)
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error)
    return NextResponse.json({ error: 'Erro ao buscar contas a pagar' }, { status: 500 })
  }
}

// POST /api/financeiro/contas-pagar - Criar conta a pagar
export async function POST(req: Request) {
  try {
    const dados = await req.json()
    const id = await criarContaPagar(dados)
    const conta = await getContaPagar(id)
    return NextResponse.json(conta, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error)
    return NextResponse.json({ error: 'Erro ao criar conta a pagar' }, { status: 500 })
  }
}
