import { NextRequest, NextResponse } from 'next/server'
import { enviarMensagem, isConfigurado } from '@/lib/evolutionApi'

export async function POST(request: NextRequest) {
  if (!isConfigurado()) {
    return NextResponse.json({ ok: false, erro: 'Evolution API não configurada' }, { status: 503 })
  }
  try {
    const { telefone, mensagem } = await request.json()
    if (!telefone || !mensagem) {
      return NextResponse.json({ ok: false, erro: 'telefone e mensagem são obrigatórios' }, { status: 400 })
    }
    const resultado = await enviarMensagem(telefone, mensagem)
    return NextResponse.json(resultado, { status: resultado.ok ? 200 : 502 })
  } catch (e) {
    return NextResponse.json({ ok: false, erro: String(e) }, { status: 500 })
  }
}
