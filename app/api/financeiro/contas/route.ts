import { NextResponse } from 'next/server'
import {
  getContas,
  getConta,
  criarConta,
  updateConta,
  deleteConta,
  getContasPorMinisterio,
} from '@/lib/financeiro'

// GET /api/financeiro/contas - Listar todas as contas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ministerioId = searchParams.get('ministerioId')

    let contas
    if (ministerioId) {
      contas = await getContasPorMinisterio(parseInt(ministerioId))
    } else {
      contas = await getContas()
    }

    return NextResponse.json(contas)
  } catch (error) {
    console.error('Erro ao buscar contas:', error)
    return NextResponse.json({ error: 'Erro ao buscar contas' }, { status: 500 })
  }
}

// POST /api/financeiro/contas - Criar conta
export async function POST(req: Request) {
  try {
    const dados = await req.json()
    const id = await criarConta(dados)
    const conta = await getConta(id)
    return NextResponse.json(conta, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta:', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
