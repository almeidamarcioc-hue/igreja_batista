'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import GerenciarPassosModal from '@/components/GerenciarPassosModal'

interface PassoComMarcacao {
  id: string
  marcado: boolean
}

interface ProgresoPasso {
  pre: PassoComMarcacao[]
  pos: PassoComMarcacao[]
  total: number
  marcados: number
}

export default function AreaPage() {
  const searchParams = useSearchParams()
  const routeParams = useParams()
  const router = useRouter()
  const cultoData = searchParams.get('culto_data') || new Date().toISOString().split('T')[0]
  const modoVisualizacao = searchParams.get('mode') === 'view'
  const areaId = (routeParams?.id as string) || ''

  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)
  const [progresso, setProgresso] = useState<ProgresoPasso>({ pre: [], pos: [], total: 0, marcados: 0 })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showConfirmSalvar, setShowConfirmSalvar] = useState(false)
  const [temPermissao, setTemPermissao] = useState(true)
  const [finalizado, setFinalizado] = useState(false)
  const [salvandoChecklist, setSalvandoChecklist] = useState(false)
  const [mostrarGerenciarPassos, setMostrarGerenciarPassos] = useState(false)
  const [temPermissaoEdicao, setTemPermissaoEdicao] = useState(false)

  useEffect(() => {
    if (!areaId || !cultoData) return

    const verificarPermissao = async () => {
      try {
        const respUser = await fetch('/api/auth/me')
        if (!respUser.ok) {
          router.push('/login')
          return
        }

        const user = await respUser.json()
        const permissoes = user.permissoes ? JSON.parse(user.permissoes) : []

        // Verificar se tem permissão para esta área específica
        const temAcesso = permissoes.includes('*') ||
          permissoes.some((p: string) => p.startsWith(`comunicacao:${areaId}`)) ||
          permissoes.includes('comunicacao.visualizar')

        if (!temAcesso && !permissoes.includes('comunicacao')) {
          setTemPermissao(false)
          return
        }

        // Verificar se tem permissão de edição (admin ou coordenador)
        const ehAdmin = user.role === 'admin'
        const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${areaId}.coordenador`)
        setTemPermissaoEdicao(ehAdmin || ehCoordenador)

        setTemPermissao(true)
      } catch (err) {
        console.error('Erro ao verificar permissão:', err)
      }
    }

    verificarPermissao()
  }, [areaId, router])

  useEffect(() => {
    if (!areaId || !cultoData || !temPermissao) return

    const carregarProgresso = async () => {
      setCarregando(true)
      try {
        const dataFormatada = cultoData.split('T')[0]
        // Sempre usar o mesmo endpoint para consistência
        const endpoint = `/api/comunicacao/progresso?culto_data=${dataFormatada}&area_id=${areaId}`

        const resp = await fetch(endpoint)
        if (resp.ok) {
          const dados = await resp.json()
          setProgresso(dados)
        }
      } catch (err) {
        console.error('Erro ao carregar progresso:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarProgresso()
  }, [cultoData, areaId, temPermissao, modoVisualizacao, area])

  if (!area) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-red-600 font-semibold">Área não encontrada</p>
      </div>
    )
  }

  if (!temPermissao) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-2xl mb-4">🔒</p>
        <p className="text-red-600 font-semibold mb-4">Acesso negado</p>
        <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta área de Comunicação.</p>
        <button
          onClick={() => router.push('/comunicacao')}
          className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
          style={{ backgroundColor: '#002347', color: '#fff' }}
        >
          ← Voltar ao Dashboard
        </button>
      </div>
    )
  }

  const handleMarcaPasso = async (passoId: string, marcado: boolean) => {
    if (modoVisualizacao) return
    setSalvando(passoId)
    try {
      await fetch('/api/comunicacao/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: cultoData,
          area_id: areaId,
          passo_id: passoId,
          marcado: !marcado,
        }),
      })

      setProgresso(prev => {
        const novo = { ...prev }
        const passoEmPre = novo.pre.find(p => p.id === passoId)
        const passoEmPos = novo.pos.find(p => p.id === passoId)

        if (passoEmPre) {
          passoEmPre.marcado = !passoEmPre.marcado
        } else if (passoEmPos) {
          passoEmPos.marcado = !passoEmPos.marcado
        }

        novo.marcados = [...novo.pre, ...novo.pos].filter(p => p.marcado).length
        return novo
      })
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setSalvando(null)
    }
  }

  const handleReiniciar = async () => {
    try {
      await fetch('/api/comunicacao/reiniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: cultoData,
          area_id: areaId,
        }),
      })

      setProgresso({ pre: [], pos: [], total: 0, marcados: 0 })
      setShowConfirm(false)
    } catch (err) {
      console.error('Erro ao reiniciar:', err)
    }
  }

  const handleSalvarChecklist = async () => {
    setSalvandoChecklist(true)
    try {
      const resp = await fetch('/api/comunicacao/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: cultoData,
          area_id: areaId,
        }),
      })

      if (resp.ok) {
        setFinalizado(true)
        setShowConfirmSalvar(false)
        // Redirecionar para dashboard após 2 segundos
        setTimeout(() => {
          router.push('/comunicacao')
        }, 2000)
      }
    } catch (err) {
      console.error('Erro ao salvar checklist:', err)
    } finally {
      setSalvandoChecklist(false)
    }
  }

  const handleExportar = () => {
    const dataFormatada = new Date(cultoData).toLocaleDateString('pt-BR')
    const conteudo = gerarTextoChecklist()
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${area.nome}_${cultoData}.txt`
    link.click()
  }

  const gerarTextoChecklist = () => {
    const dataFormatada = new Date(cultoData).toLocaleDateString('pt-BR')
    let texto = `CHECKLIST — ${area.nome.toUpperCase()}\n`
    texto += `Culto: ${dataFormatada}\n`
    texto += `${'='.repeat(60)}\n\n`

    if (area.responsavelSugerido) {
      texto += `Responsável: ${area.responsavelSugerido}\n`
    }
    if (area.chegadaAntecedencia) {
      texto += `Chegada: ${area.chegadaAntecedencia} antes\n`
    }
    if (area.responsavelSugerido || area.chegadaAntecedencia) {
      texto += '\n'
    }

    // ANTES
    texto += `ANTES DE INICIAR\n${'-'.repeat(60)}\n`
    area.fases.pre.forEach((passo, idx) => {
      const marcado = progresso.pre.find(p => p.id === passo.id)?.marcado
      const simbolo = marcado ? '[✓]' : '[ ]'
      texto += `${simbolo} ${idx + 1}. ${passo.titulo}\n`
      if (passo.descricao) texto += `    ${passo.descricao}\n`
    })
    texto += '\n'

    // DURANTE
    texto += `DURANTE (GUIA DE CONSULTA)\n${'-'.repeat(60)}\n`
    area.fases.operacao.forEach((passo, idx) => {
      const simbolo = passo.critico ? '[ATENÇÃO]' : '▸'
      texto += `${simbolo} ${idx + 1}. ${passo.titulo}\n`
      if (passo.descricao) texto += `    ${passo.descricao}\n`
    })
    texto += '\n'

    // DEPOIS
    texto += `DEPOIS DE FINALIZAR\n${'-'.repeat(60)}\n`
    area.fases.pos.forEach((passo, idx) => {
      const marcado = progresso.pos.find(p => p.id === passo.id)?.marcado
      const simbolo = marcado ? '[✓]' : '[ ]'
      texto += `${simbolo} ${idx + 1}. ${passo.titulo}\n`
      if (passo.descricao) texto += `    ${passo.descricao}\n`
    })

    return texto
  }

  const percentualPre = progresso.pre.length > 0 ? Math.round((progresso.pre.filter(p => p.marcado).length / progresso.pre.length) * 100) : 0
  const percentualPos = progresso.pos.length > 0 ? Math.round((progresso.pos.filter(p => p.marcado).length / progresso.pos.length) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* CABEÇALHO */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{area.icone}</span>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#002347' }}>
              {area.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(cultoData).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {area.responsavelSugerido && (
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">👤 Responsável:</span> {area.responsavelSugerido}
          </p>
        )}
        {area.chegadaAntecedencia && (
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">⏰ Chegada:</span> {area.chegadaAntecedencia} antes
          </p>
        )}
        {area.dependencias && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">🔗 Dependências:</span> {area.dependencias}
          </p>
        )}
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <>
          {/* ANTES DE INICIAR */}
          <BlocoChecklist
            titulo="✅ ANTES DE INICIAR"
            passos={area.fases.pre}
            progresso={progresso.pre}
            percentual={percentualPre}
            salvando={salvando}
            onMarcaPasso={handleMarcaPasso}
            cor={area.cor}
            desabilitado={modoVisualizacao}
          />

          {/* DURANTE */}
          <BlocoGuia
            titulo="▸ DURANTE (GUIA DE CONSULTA)"
            passos={area.fases.operacao}
            cor={area.cor}
          />

          {/* DEPOIS */}
          <BlocoChecklist
            titulo="🏁 DEPOIS DE FINALIZAR"
            passos={area.fases.pos}
            progresso={progresso.pos}
            percentual={percentualPos}
            salvando={salvando}
            onMarcaPasso={handleMarcaPasso}
            cor={area.cor}
            desabilitado={modoVisualizacao}
          />

          {/* TROUBLESHOOTING */}
          {area.troubleshooting && area.troubleshooting.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#002347' }}>
                🔧 Troubleshooting
              </h2>
              <div className="space-y-3">
                {area.troubleshooting.map((item, idx) => (
                  <div key={idx} className="border-l-4 pl-4" style={{ borderColor: area.cor }}>
                    <p className="font-semibold text-sm" style={{ color: area.cor }}>
                      ❓ {item.problema}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{item.solucao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AÇÕES */}
          <div className="bg-white rounded-lg shadow p-6 flex gap-3 flex-wrap">
            {modoVisualizacao && (
              <button
                onClick={() => router.push(`/comunicacao/area/${areaId}?culto_data=${cultoData}`)}
                className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                ✏️ Editar
              </button>
            )}
            {!finalizado && !modoVisualizacao && (
              <button
                onClick={() => setShowConfirmSalvar(true)}
                disabled={salvandoChecklist}
                className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  backgroundColor: finalizado ? '#ccc' : '#10B981',
                  color: '#fff',
                  opacity: salvandoChecklist ? 0.6 : 1
                }}
              >
                {salvandoChecklist ? '⏳ Salvando...' : '💾 Salvar Checklist'}
              </button>
            )}
            {finalizado && (
              <div className="px-6 py-2 rounded-lg font-semibold text-sm bg-green-100 text-green-700 flex items-center gap-2">
                ✓ Checklist finalizado em {new Date(cultoData).toLocaleDateString('pt-BR')}
              </div>
            )}
            <button
              onClick={handleExportar}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
              style={{ backgroundColor: area.cor, color: '#fff' }}
            >
              📥 Exportar checklist
            </button>
            {!finalizado && !modoVisualizacao && temPermissaoEdicao && (
              <button
                onClick={() => setMostrarGerenciarPassos(true)}
                className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                ⚙️ Gerenciar Passos
              </button>
            )}
            {!finalizado && !modoVisualizacao && (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
              >
                🔄 Reiniciar
              </button>
            )}
          </div>

          {showConfirmSalvar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#002347' }}>
                  Salvar Checklist
                </h3>
                <p className="text-gray-700 mb-2">
                  Você está salvando este checklist como finalizado em:
                </p>
                <p className="text-lg font-semibold mb-6" style={{ color: area.cor }}>
                  {new Date(cultoData).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Uma vez salvo, o checklist fica registrado com {progresso.marcados} de {progresso.total} passos concluídos. Você poderá criar um novo checklist para outra data.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmSalvar(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarChecklist}
                    disabled={salvandoChecklist}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700"
                  >
                    {salvandoChecklist ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#002347' }}>
                  Tem certeza?
                </h3>
                <p className="text-gray-700 mb-6">Isso vai reiniciar toda a marcação desta área para este culto.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReiniciar}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </div>
          )}

          {finalizado && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <span className="font-semibold">✓ Checklist Finalizado:</span> Este checklist foi salvo. Você pode:
                <br />
                • <strong>Editar</strong> — desbloquear para fazer alterações
                <br />
                • <strong>Criar novo</strong> — fazer checklist de outra data
                <br />
                Volte ao dashboard para ver o histórico de todos os checklists.
              </p>
            </div>
          )}
        </>
      )}

      {mostrarGerenciarPassos && (
        <GerenciarPassosModal
          cultoData={cultoData}
          areaId={areaId}
          onClose={() => setMostrarGerenciarPassos(false)}
          temPermissao={temPermissaoEdicao}
        />
      )}
    </div>
  )
}

interface BlocoChecklistProps {
  titulo: string
  passos: any[]
  progresso: PassoComMarcacao[]
  percentual: number
  salvando: string | null
  onMarcaPasso: (passoId: string, marcado: boolean) => void
  cor: string
  desabilitado?: boolean
}

function BlocoChecklist({ titulo, passos, progresso, percentual, salvando, onMarcaPasso, cor, desabilitado }: BlocoChecklistProps) {
  const marcados = progresso.filter(p => p.marcado).length

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#002347' }}>
          {titulo}
        </h2>
        <span className="text-sm font-semibold" style={{ color: cor }}>
          {marcados} / {passos.length}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${percentual}%`, backgroundColor: cor }}
        />
      </div>

      <div className="space-y-2">
        {passos.map((passo, idx) => {
          const progPasso = progresso.find(p => p.id === passo.id) || { id: passo.id, marcado: false }

          return (
            <button
              key={passo.id}
              onClick={() => onMarcaPasso(passo.id, progPasso.marcado)}
              disabled={salvando === passo.id || desabilitado}
              className="w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all hover:shadow-md"
              style={{
                borderColor: progPasso.marcado ? cor : '#e5e7eb',
                backgroundColor: progPasso.marcado ? `${cor}15` : '#fff',
                opacity: salvando === passo.id || desabilitado ? 0.6 : 1,
                cursor: desabilitado ? 'not-allowed' : 'pointer',
              }}
            >
              <div
                className="flex-shrink-0 mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center font-bold text-sm flex-center"
                style={{
                  borderColor: progPasso.marcado ? cor : '#d1d5db',
                  backgroundColor: progPasso.marcado ? cor : '#fff',
                  color: progPasso.marcado ? '#fff' : '#000',
                }}
              >
                {progPasso.marcado ? '✓' : ''}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm leading-tight"
                  style={{
                    color: '#002347',
                    textDecoration: progPasso.marcado ? 'line-through' : 'none',
                  }}
                >
                  {idx + 1}. {passo.titulo}
                </p>
                {passo.descricao && (
                  <p className="text-xs text-gray-600 mt-1">{passo.descricao}</p>
                )}
                {passo.aviso && (
                  <p className="text-xs text-yellow-700 mt-1 font-semibold">⚠️ {passo.aviso}</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface BlocoGuiaProps {
  titulo: string
  passos: any[]
  cor: string
}

function BlocoGuia({ titulo, passos, cor }: BlocoGuiaProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6" style={{ borderLeft: `5px solid ${cor}` }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: '#002347' }}>
        {titulo}
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">💡 Dica:</span> Esta é uma guia de consulta rápida. Os itens aqui não são marcáveis.
        </p>
      </div>

      <div className="space-y-2">
        {passos.map((passo, idx) => (
          <div key={passo.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <span className="flex-shrink-0 mt-0.5 font-bold text-sm" style={{ color: cor }}>
              {passo.critico ? '⚠️' : '▸'}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: '#002347' }}>
                {idx + 1}. {passo.titulo}
              </p>
              {passo.descricao && (
                <p className="text-xs text-gray-600 mt-1">{passo.descricao}</p>
              )}
              {passo.aviso && (
                <p className="text-xs text-yellow-700 mt-1 font-semibold">⚠️ {passo.aviso}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
