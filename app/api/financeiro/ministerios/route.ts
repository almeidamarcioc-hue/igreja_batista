import { NextResponse } from 'next/server'
import {
  getMinisterios,
  getMinisterio,
  criarMinisterio,
  updateMinisterio,
  deleteMinisterio,
} from '@/lib/financeiro'

// GET /api/financeiro/ministerios - Listar todos os ministérios
export async function GET() {
  try {
    const ministerios = await getMinisterios()
    return NextResponse.json(ministerios)
  } catch (error) {
    console.error('Erro ao buscar ministérios:', error)
    return NextResponse.json({ error: 'Erro ao buscar ministérios' }, { status: 500 })
  }
}

// POST /api/financeiro/ministerios - Criar ministério
export async function POST(req: Request) {
  try {
    const dados = await req.json()
    const id = await criarMinisterio(dados)
    const ministerio = await getMinisterio(id)
    return NextResponse.json(ministerio, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar ministério:', error)
    return NextResponse.json({ error: 'Erro ao criar ministério' }, { status: 500 })
  }
}
