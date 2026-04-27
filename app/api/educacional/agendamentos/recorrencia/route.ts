import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, unauthorized } from '@/lib/guard'
import { deleteAgendamentosRecorrenciaFuturos } from '@/lib/db'

export const dynamic = 'force-dynamic'

// DELETE /api/educacional/agendamentos/recorrencia?recorrencia_id=xxx&data_partir=YYYY-MM-DD
export async function DELETE(req: NextRequest) {
  if (!await requirePermission(req, 'educacional')) return unauthorized()
  try {
    const { searchParams } = req.nextUrl
    const recorrencia_id = searchParams.get('recorrencia_id')
    const data_partir = searchParams.get('data_partir')
    if (!recorrencia_id || !data_partir) {
      return NextResponse.json({ error: 'recorrencia_id e data_partir são obrigatórios.' }, { status: 400 })
    }
    const removidos = await deleteAgendamentosRecorrenciaFuturos(recorrencia_id, data_partir)
    return NextResponse.json({ removidos })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
