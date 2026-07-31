import { NextRequest, NextResponse } from 'next/server'
import { getUsuarioPorLoginIncluindoInativos } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { createSessionToken, COOKIE_NAME } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { usuario, senha } = await req.json()
    if (!usuario || !senha) {
      return NextResponse.json({ error: 'Preencha usuário e senha.' }, { status: 400 })
    }

    const user = await getUsuarioPorLoginIncluindoInativos(String(usuario).trim())
    if (!user) {
      console.log(`Usuário não encontrado: "${usuario}"`)
      return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 })
    }

    if (!verifyPassword(String(senha), user.senha_hash)) {
      console.log(`Senha incorreta para usuário: "${usuario}"`)
      return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 })
    }

    // Só depois de conferir a senha, para não revelar quais logins existem
    if (!user.ativo) {
      return NextResponse.json(
        { error: 'Sua conta está desativada. Procure o líder da sua área ou o administrador.' },
        { status: 403 },
      )
    }

    const token = await createSessionToken(user.id)

    // Verificar se é um pastor (role = 'pastor')
    const isPastor = user.role === 'pastor'

    const res = NextResponse.json({
      ok: true,
      nome: user.nome,
      role: user.role,
      isPastor,
      redirectUrl: isPastor ? '/pastor/agenda' : '/'
    })
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
