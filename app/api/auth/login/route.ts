import { NextRequest, NextResponse } from 'next/server'
import { getUsuarioPorLogin } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { createSessionToken, COOKIE_NAME } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { usuario, senha } = await req.json()
    if (!usuario || !senha) {
      return NextResponse.json({ error: 'Preencha usuário e senha.' }, { status: 400 })
    }

    const user = await getUsuarioPorLogin(String(usuario))
    if (!user || !verifyPassword(String(senha), user.senha_hash)) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 })
    }

    const token = await createSessionToken(user.id)
    const res = NextResponse.json({ ok: true, nome: user.nome })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 20 * 60, // 20 minutos
      path: '/',
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
