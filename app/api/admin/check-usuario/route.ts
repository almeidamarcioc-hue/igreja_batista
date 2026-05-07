import { NextRequest, NextResponse } from 'next/server'
import { getUsuarioPorLogin } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const usuario = req.nextUrl.searchParams.get('usuario')

    if (!usuario) {
      return NextResponse.json({ error: 'Informe o usuário na query: ?usuario=nome' }, { status: 400 })
    }

    const user = await getUsuarioPorLogin(usuario.trim())

    if (!user) {
      return NextResponse.json({
        encontrado: false,
        usuario,
        mensagem: 'Usuário não encontrado no banco de dados'
      })
    }

    return NextResponse.json({
      encontrado: true,
      id: user.id,
      usuario: user.usuario,
      nome: user.nome,
      role: user.role,
      ativo: user.ativo,
      mensagem: 'Usuário encontrado!'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
