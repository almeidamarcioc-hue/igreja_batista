import { NextRequest, NextResponse } from 'next/server'
import { getComunicacaoUser, areasPermitidas, temAcessoTotal } from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'

// Fonte única de verdade para o cliente: quais áreas o usuário pode ver.
// Antes cada tela reimplementava a regra, e a página da área tratava a
// permissão genérica `comunicacao.visualizar` como acesso a todas.
export async function GET(req: NextRequest) {
  const user = await getComunicacaoUser(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  return NextResponse.json({
    areas: areasPermitidas(user),
    acessoTotal: temAcessoTotal(user),
  })
}
