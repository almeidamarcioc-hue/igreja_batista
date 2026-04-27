import { NextRequest, NextResponse } from 'next/server'
import { getResetToken, consumirResetToken } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Token ausente.' }, { status: 400 })
    const row = await getResetToken(token)
    if (!row) return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 400 })
    return NextResponse.json({ nome: (row as any).nome })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, senha } = await req.json()
    if (!token || !senha || senha.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres.' }, { status: 400 })
    }
    const ok = await consumirResetToken(token, senha)
    if (!ok) return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
