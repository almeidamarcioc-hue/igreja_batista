'use client'

import { useState, useEffect } from 'react'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

interface HistoricoItem {
  id: number
  area_id: string
  passo_id: string
  usuario_id: number
  usuario_nome: string
  marcado: boolean
  data_marcacao: string
  culto_data: string
}

interface HistoricoChecklistProps {
  cultoData: string
  areaId: string
  onClose: () => void
}

export default function HistoricoChecklist({ cultoData, areaId, onClose }: HistoricoChecklistProps) {
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarHistorico = async () => {
      setCarregando(true)
      try {
        const resp = await fetch(
          `/api/comunicacao/historico?culto_data=${cultoData}&area_id=${areaId}`
        )
        if (resp.ok) {
          const dados = await resp.json()
          setHistorico(dados)
        }
      } catch (err) {
        console.error('Erro ao carregar histórico:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarHistorico()
  }, [cultoData, areaId])

  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)
  if (!area) return null

  // Agrupar histórico por passo
  const todosPassos = [...area.fases.pre, ...area.fases.operacao, ...area.fases.pos]
  const historicoAgrupado = historico.reduce((acc, item) => {
    const passo = todosPassos.find(p => p.id === item.passo_id)
    if (!passo) return acc

    const key = item.passo_id
    if (!acc[key]) {
      acc[key] = {
        passo,
        historico: []
      }
    }
    acc[key].historico.push(item)
    return acc
  }, {} as Record<string, { passo: any; historico: HistoricoItem[] }>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: '#002347' }}>
            📋 Histórico — {area.nome}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {carregando ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : historico.length === 0 ? (
            <p className="text-center text-gray-500">Nenhum checklist efetuado nesta área para esta data.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(historicoAgrupado)
                .sort((a, b) => {
                  const dataA = new Date(a[1].historico[0].data_marcacao).getTime()
                  const dataB = new Date(b[1].historico[0].data_marcacao).getTime()
                  return dataB - dataA
                })
                .map(([passoId, { passo, historico: itens }]) => (
                  <div key={passoId} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-semibold text-sm" style={{ color: '#002347' }}>
                      {passo.titulo}
                    </p>
                    <div className="mt-2 space-y-1">
                      {itens.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs text-gray-600">
                          <span>
                            <span className="font-semibold">{item.usuario_nome}</span>
                            {' '}
                            {item.marcado ? (
                              <span style={{ color: '#10B981' }}>✓ marcou</span>
                            ) : (
                              <span style={{ color: '#EF4444' }}>✗ desmarc ou</span>
                            )}
                          </span>
                          <span>
                            {new Date(item.data_marcacao).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
