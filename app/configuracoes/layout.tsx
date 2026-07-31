import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import { getUsuario } from '@/lib/db'

// Mapeamento de nomes de perfis para IDs de áreas
const AREA_MAPPING: Record<string, string> = {
  'Transmissão': 'transmissao-youtube',
  'Mix de Som': 'mix-som',
  'Datashow': 'datashow',
  'Câmeras': 'cameras',
  'Iluminação': 'iluminacao',
}

export default async function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) redirect('/login')

  const userId = await verifySessionToken(token)
  if (!userId) redirect('/login')

  const user = await getUsuario(userId) as any
  if (!user || !user.ativo) redirect('/login')

  // Permitir admin
  if (user.role === 'admin') return <>{children}</>

  // Permitir coordenadores de comunicação
  let temPermissao = false
  let areasCoordenador: Set<string> = new Set()

  if (user.perfil_id) {
    try {
      const { getDb } = await import('@/lib/db')
      const sql = getDb()
      const perfil = await sql`SELECT nome, permissoes FROM perfis_acesso WHERE id = ${user.perfil_id}`

      if (perfil.length > 0) {
        const perfilNome = perfil[0].nome as string
        const permissoes = JSON.parse(perfil[0].permissoes as string) as string[]

        // Detectar se é coordenador.
        // `.criar` NÃO entra aqui: na tela de perfis ela significa "marcar
        // checklist" e é a permissão do operador — aceitá-la dava ao operador
        // acesso à tela de configurações.
        const isCoordenador = permissoes.some((p: string) => {
          if (typeof p !== 'string') return false
          if (p.includes('comunicacao') && p.includes('coordenador')) return true
          if (p.startsWith('comunicacao:') && (p.includes('.editar') || p.includes('.excluir'))) return true
          return false
        })

        if (isCoordenador) {
          temPermissao = true

          // Detectar áreas de coordenação baseado no nome do perfil
          for (const [searchText, areaId] of Object.entries(AREA_MAPPING)) {
            if (perfilNome.includes(searchText)) {
              areasCoordenador.add(areaId)
            }
          }

          // Se "Coordenador Geral", permitir múltiplas áreas (isso será tratado no client)
          if (perfilNome.includes('Coordenador Geral')) {
            areasCoordenador.clear()
            // Adicionar todas as áreas para "Coordenador Geral"
            Object.values(AREA_MAPPING).forEach(id => areasCoordenador.add(id))
          }
        }
      }
    } catch (e) {
      console.error('Erro ao verificar permissões:', e)
      temPermissao = false
    }
  }

  if (!temPermissao) redirect('/')

  // Verificar múltiplas áreas: se coordenador tem múltiplas áreas, bloquear acesso
  // (v3.0 com "Líder de Área" permitirá múltiplas áreas)
  if (user.role !== 'admin' && areasCoordenador.size > 1) {
    // Bloquear coordenador com múltiplas áreas
    // Será redirecionado com mensagem de erro via query param
    redirect('/?error=multiplas_areas&msg=Sua+conta+tem+permiss%C3%B5es+em+m%C3%BAltiplas+%C3%A1reas.+Essa+funcionalidade+est%C3%A1+em+desenvolvimento.')
  }

  return <>{children}</>
}
