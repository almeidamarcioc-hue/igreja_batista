import { NextRequest, NextResponse } from 'next/server'
import {
  getComunicacaoUser,
  areasPermitidas,
  temAcessoTotal,
  podeGerenciarArea,
} from '@/lib/comunicacao/auth'

export const dynamic = 'force-dynamic'

// Fonte única de verdade para o cliente: quais áreas o usuário pode ver.
// Antes cada tela reimplementava a regra, e a página da área tratava a
// permissão genérica `comunicacao.visualizar` como acesso a todas.
export async function GET(req: NextRequest) {
  const user = await getComunicacaoUser(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const areas = areasPermitidas(user)
  // Áreas em que a pessoa pode mexer no template/liderados. Operador tem lista
  // vazia — ele só preenche checklist.
  const areasGerenciaveis = areas.filter(id => podeGerenciarArea(user, id))

  return NextResponse.json({
    areas,
    areasGerenciaveis,
    ehCoordenador: areasGerenciaveis.length > 0,
    acessoTotal: temAcessoTotal(user),
  })
}
