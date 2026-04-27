import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getUsuarioPorEmail, criarResetToken } from '@/lib/db'
import { enviarEmailRecuperacaoSenha } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Informe o e-mail cadastrado.' }, { status: 400 })
    }

    const usuario = await getUsuarioPorEmail(email.trim())

    // Sempre retorna sucesso para não revelar se o e-mail existe ou não
    if (!usuario || !(usuario as any).email) {
      return NextResponse.json({ ok: true })
    }

    const token = randomBytes(32).toString('hex')
    await criarResetToken((usuario as any).id, token)

    const baseUrl = req.nextUrl.origin
    await enviarEmailRecuperacaoSenha({
      para: (usuario as any).email,
      nome: (usuario as any).nome,
      token,
      baseUrl,
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao enviar e-mail'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
