'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

interface ResumoPasso {
  marcado: boolean
  usuario_nome: string
  data_marcacao: string
}

interface DetalhesChecklistProps {
  cultoData: string
  areaId: string
  onClose: () => void
  onChecklistExcluido?: () => void
}

export default function DetalhesChecklist({ cultoData, areaId, onClose, onChecklistExcluido }: DetalhesChecklistProps) {
  const router = useRouter()
  const [detalhes, setDetalhes] = useState<{
    resumo: Record<string, ResumoPasso>
    finalizacao: any
  } | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [showConfirmExcluir, setShowConfirmExcluir] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [permissaoCoordenador, setPermissaoCoordenador] = useState(false)
  const [erro403, setErro403] = useState(false)

  useEffect(() => {
    const carregarDetalhes = async () => {
      setCarregando(true)
      try {
        // Garantir que cultoData é apenas a parte da data (YYYY-MM-DD)
        const dataFormatada = cultoData.split('T')[0]
        const resp = await fetch(
          `/api/comunicacao/checklist-detalhes?culto_data=${dataFormatada}&area_id=${areaId}`
        )
        if (resp.ok) {
          const dados = await resp.json()
          setDetalhes(dados)
          // Se chegou aqui, tem no mínimo permissão de operador
          // Verificar se é coordenador ou admin
          const userResp = await fetch('/api/auth/me')
          if (userResp.ok) {
            const user = await userResp.json()
            const ehAdmin = user.role === 'admin'
            const permissoes = user.permissoes ? JSON.parse(user.permissoes) : []
            const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${areaId}.coordenador`)
            setPermissaoCoordenador(ehAdmin || ehCoordenador)
          }
        } else if (resp.status === 403) {
          setErro403(true)
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarDetalhes()
  }, [cultoData, areaId])

  const handleEditar = async () => {
    try {
      const resp = await fetch('/api/comunicacao/editar-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: cultoData,
          area_id: areaId,
        }),
      })

      if (resp.ok) {
        const data = await resp.json()
        onClose()
        router.push(data.redirectUrl)
      }
    } catch (err) {
      console.error('Erro ao editar:', err)
    }
  }

  const handleExcluir = async () => {
    setExcluindo(true)
    try {
      const resp = await fetch('/api/comunicacao/excluir-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: cultoData,
          area_id: areaId,
        }),
      })

      if (resp.ok) {
        setShowConfirmExcluir(false)
        onClose()
        onChecklistExcluido?.()
      }
    } catch (err) {
      console.error('Erro ao excluir:', err)
    } finally {
      setExcluindo(false)
    }
  }

  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)
  if (!area) return null

  const todosPassos = [...area.fases.pre, ...area.fases.operacao, ...area.fases.pos]

  // Agrupar por fase
  const passosPorFase = {
    'ANTES': area.fases.pre,
    'DURANTE': area.fases.operacao,
    'DEPOIS': area.fases.pos
  }

  const marcados = detalhes ? Object.values(detalhes.resumo).filter(p => p.marcado).length : 0
  const total = detalhes ? Object.keys(detalhes.resumo).length : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#002347' }}>
              {area.icone} {area.nome}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(cultoData).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            {/* Todos podem editar */}
            {!erro403 && detalhes && (
              <button
                onClick={handleEditar}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                ✏️ Editar
              </button>
            )}

            {/* Apenas coordenadores podem excluir */}
            {permissaoCoordenador && (
              <button
                onClick={() => setShowConfirmExcluir(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-red-100 text-red-700 hover:bg-red-200"
              >
                🗑️ Excluir
              </button>
            )}

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {carregando ? (
            <p className="text-center text-gray-500">Carregando detalhes...</p>
          ) : erro403 ? (
            <p className="text-center text-red-600 py-12">Você não tem permissão para visualizar este checklist.</p>
          ) : !detalhes || Object.keys(detalhes.resumo).length === 0 ? (
            <p className="text-center text-gray-500 py-12">Nenhum dado disponível.</p>
          ) : (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: '#002347' }}>
                    Resumo do Checklist
                  </h3>
                  <span className="text-lg font-bold" style={{ color: area.cor }}>
                    {marcados}/{total} passos
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${total > 0 ? Math.round((marcados / total) * 100) : 0}%`,
                      backgroundColor: area.cor
                    }}
                  />
                </div>
                {detalhes.finalizacao && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="font-semibold">Finalizado por:</span> {detalhes.finalizacao.usuario_nome}
                    <br />
                    <span className="font-semibold">Data:</span> {new Date(detalhes.finalizacao.data_finalizacao).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Detalhes por fase */}
              {Object.entries(passosPorFase).map(([nomeFase, passos]) => {
                const passosMarcados = passos.filter(p => detalhes.resumo[p.id]?.marcado)
                return (
                  <div key={nomeFase}>
                    <h3 className="font-semibold mb-3" style={{ color: '#002347' }}>
                      {nomeFase === 'ANTES' && '✅ ANTES DE INICIAR'}
                      {nomeFase === 'DURANTE' && '▸ DURANTE (GUIA)'}
                      {nomeFase === 'DEPOIS' && '🏁 DEPOIS DE FINALIZAR'}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({passosMarcados.length}/{passos.length})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {passos.map((passo) => {
                        const detPasso = detalhes.resumo[passo.id]
                        const marcado = detPasso?.marcado ?? false

                        return (
                          <div
                            key={passo.id}
                            className="p-3 rounded-lg border-l-4"
                            style={{
                              backgroundColor: marcado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                              borderColor: marcado ? '#10B981' : '#EF4444'
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl mt-0.5">
                                {marcado ? '✓' : '✗'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm" style={{ color: '#002347' }}>
                                  {passo.titulo}
                                </p>
                                {passo.descricao && (
                                  <p className="text-xs text-gray-600 mt-1">{passo.descricao}</p>
                                )}
                                {detPasso && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    <span className="font-semibold">Por:</span> {detPasso.usuario_nome}
                                    <br />
                                    <span className="font-semibold">Quando:</span>{' '}
                                    {new Date(detPasso.data_marcacao).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {showConfirmExcluir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[51] p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold mb-4 text-red-600">
                Excluir Checklist?
              </h3>
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja excluir este checklist? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmExcluir(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300"
                  disabled={excluindo}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExcluir}
                  disabled={excluindo}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {excluindo ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
