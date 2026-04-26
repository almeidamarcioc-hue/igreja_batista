import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await initDb()
    return NextResponse.json({ ok: true, message: 'Banco de dados inicializado com sucesso.' })
  } catch (error: any) {
    console.error('Erro ao inicializar banco:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
