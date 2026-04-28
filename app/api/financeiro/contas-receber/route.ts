import { NextResponse } from 'next/server'
import {
  getContasReceber,
  getContaReceber,
  criarContaReceber,
  updateContaReceber,
  deleteContaReceber,
} from '@/lib/financeiro'

// GET /api/financeiro/contas-receber - Listar todas as contas a receber
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const ministerioId = searchParams.get('ministerioId')
      ? parseInt(searchParams.get('ministerioId')!)
      : undefined
    const dataInicio = searchParams.get('dataInicio') || undefined
    const dataFim = searchParams.get('dataFim') || undefined

    const contas = await getContasReceber({
      status,
      ministerioId,
      dataInicio,
      dataFim,
    })

    return NextResponse.json(contas)
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error)
    return NextResponse.json({ error: 'Erro ao buscar contas a receber' }, { status: 500 })
  }
}

// POST /api/financeiro/contas-receber - Criar conta a receber
export async function POST(req: Request) {
  try {
    const dados = await req.json()
    const id = await criarContaReceber(dados)
    const conta = await getContaReceber(id)
    return NextResponse.json(conta, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta a receber:', error)
    return NextResponse.json({ error: 'Erro ao criar conta a receber' }, { status: 500 })
  }
}
