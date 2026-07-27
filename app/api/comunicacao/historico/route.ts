import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

interface HistoricoItem {
  id: number
  area_id: string
  passo_id: string
  usuario_id: number
  usuario_nome: string
  marcado: boolean
  data_marcacao: string
  culto_data: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cultoData = searchParams.get('culto_data')
  const areaId = searchParams.get('area_id')

  if (!cultoData || !areaId) {
    return NextResponse.json(
      { error: 'Parâmetros culto_data e area_id são obrigatórios' },
      { status: 400 }
    )
  }

  try {
    const sql = neon(process.env.DATABASE_URL!)
    const query = `
      SELECT
        cp.id,
        cp.area_id,
        cp.passo_id,
        cp.usuario_id,
        u.nome as usuario_nome,
        cp.marcado,
        cp.data_marcacao,
        cp.culto_data
      FROM checklist_progresso cp
      JOIN usuarios u ON cp.usuario_id = u.id
      WHERE cp.culto_data = $1 AND cp.area_id = $2
      ORDER BY cp.data_marcacao DESC
    `

    const resultado = await sql(query, [cultoData, areaId])

    return NextResponse.json(resultado)
  } catch (err: any) {
    console.error('Erro ao buscar histórico:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
