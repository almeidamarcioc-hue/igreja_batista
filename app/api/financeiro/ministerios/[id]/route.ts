import { NextResponse } from 'next/server'
import {
  getMinisterio,
  updateMinisterio,
  deleteMinisterio,
} from '@/lib/financeiro'

// GET /api/financeiro/ministerios/[id] - Obter um ministério
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const ministerio = await getMinisterio(id)
    
    if (!ministerio) {
      return NextResponse.json({ error: 'Ministério não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(ministerio)
  } catch (error) {
    console.error('Erro ao buscar ministério:', error)
    return NextResponse.json({ error: 'Erro ao buscar ministério' }, { status: 500 })
  }
}

// PUT /api/financeiro/ministerios/[id] - Atualizar ministério
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const dados = await req.json()
    await updateMinisterio(id, dados)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar ministério:', error)
    return NextResponse.json({ error: 'Erro ao atualizar ministério' }, { status: 500 })
  }
}

// DELETE /api/financeiro/ministerios/[id] - Deletar ministério
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await deleteMinisterio(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar ministério:', error)
    return NextResponse.json({ error: 'Erro ao deletar ministério' }, { status: 500 })
  }
}
