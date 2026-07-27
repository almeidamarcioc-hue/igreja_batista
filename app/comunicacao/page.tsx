'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import DetalhesChecklist from '@/components/DetalhesChecklist'

interface Usuario {
  id: number
  nome: string
  permissoes?: string
}

interface RelatorioData {
  culto_data: string
  area_id: string
  total: number
  marcados: number
}

export default function ComunicacaoDashboard() {
  const [cultoData, setCultoData] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [filtroAtivo, setFiltroAtivo] = useState(false)
  const [progresso, setProgresso] = useState<Record<string, { total: number; marcados: number }>>({})
  const [relatorioPeriodo, setRelatorioPeriodo] = useState<RelatorioData[]>([])
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [areasPermitidas, setAreasPermitidas] = useState<string[]>([])
  const [checklistSelecionado, setChecklistSelecionado] = useState<{ cultoData: string; areaId: string } | null>(null)

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0]
    setCultoData(hoje)
  }, [])

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const resp = await fetch('/api/auth/me')
        if (resp.ok) {
          const user = await resp.json()
          setUsuario(user)

          // Determinar quais áreas o usuário pode acessar
          const permissoes = user.permissoes ? JSON.parse(user.permissoes) : []
          const areas: string[] = []

          if (permissoes.includes('*') || permissoes.includes('comunicacao')) {
            // Acesso a todas as áreas
            setAreasPermitidas(PROCEDIMENTOS.areas.map(a => a.id))
          } else {
            // Acesso apenas às áreas específicas
            permissoes.forEach((perm: string) => {
              if (perm.startsWith('comunicacao:')) {
                const area = perm.split(':')[1].split('.')[0]
                if (area && !areas.includes(area)) {
                  areas.push(area)
                }
              }
            })
            setAreasPermitidas(areas)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err)
      }
    }

    carregarUsuario()
  }, [])

  useEffect(() => {
    if (filtroAtivo) {
      if (!dataInicio || !dataFim) return

      const carregarRelatorio = async () => {
        setCarregando(true)
        try {
          const params = new URLSearchParams({ data_inicio: dataInicio, data_fim: dataFim })
          const resp = await fetch(`/api/comunicacao/periodo?${params.toString()}`)
          if (resp.ok) {
            const dados = await resp.json()
            setRelatorioPeriodo(dados)
          }
        } catch (err) {
          console.error('Erro ao carregar relatório:', err)
        } finally {
          setCarregando(false)
        }
      }

      carregarRelatorio()
    }
  }, [filtroAtivo, dataInicio, dataFim])

  useEffect(() => {
    if (!cultoData || filtroAtivo) return

    const carregarProgresso = async () => {
      setCarregando(true)
      try {
        const params = new URLSearchParams({ culto_data: cultoData })
        const resp = await fetch(`/api/comunicacao/progresso?${params.toString()}`)
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
  }, [cultoData, filtroAtivo])

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCultoData(e.target.value)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#002347' }}>📡 Comunicação — Operacional</h1>
        <p className="text-gray-600">Runbook dos voluntários da cabine técnica</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="block">
            <span className="text-sm font-semibold" style={{ color: '#002347' }}>Selecione a data do culto:</span>
          </label>
          <button
            onClick={() => setFiltroAtivo(!filtroAtivo)}
            className="text-xs px-3 py-1 rounded-lg transition-colors"
            style={{
              backgroundColor: filtroAtivo ? '#C5A059' : 'rgba(197, 160, 89, 0.2)',
              color: '#002347',
              fontWeight: 600
            }}
          >
            {filtroAtivo ? '✓ Filtro ativo' : '🔍 Filtrar por período'}
          </button>
        </div>

        {!filtroAtivo ? (
          <>
            <input
              type="date"
              value={cultoData}
              onChange={handleDataChange}
              className="w-full md:w-64 px-4 py-2 border-2 rounded-lg"
              style={{ borderColor: '#C5A059' }}
            />
            <p className="text-xs text-gray-500 mt-2">Cada data tem seu próprio checklist. Novo culto = checklist zerado.</p>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data inicial:</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-lg"
                style={{ borderColor: '#C5A059' }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data final:</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-lg"
                style={{ borderColor: '#C5A059' }}
              />
            </div>
          </div>
        )}
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : filtroAtivo && relatorioPeriodo.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">Nenhum checklist realizado neste período.</p>
        </div>
      ) : filtroAtivo ? (
        <div className="space-y-4">
          {relatorioPeriodo.map((item) => {
            const area = PROCEDIMENTOS.areas.find(a => a.id === item.area_id)
            if (!area) return null
            const percentual = item.total > 0 ? Math.round((item.marcados / item.total) * 100) : 0

            return (
              <button
                key={`${item.culto_data}-${item.area_id}`}
                onClick={() => setChecklistSelecionado({ cultoData: item.culto_data, areaId: item.area_id })}
                className="w-full text-left bg-white rounded-lg shadow-md p-4 border-l-4 hover:shadow-lg transition-shadow"
                style={{ borderColor: area.cor }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{area.icone}</span>
                      <div>
                        <h4 className="font-semibold" style={{ color: '#002347' }}>{area.nome}</h4>
                        <p className="text-xs text-gray-500">{new Date(item.culto_data).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: '#002347' }}>Progresso</span>
                        <span className="text-xs font-bold" style={{ color: area.cor }}>{percentual}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${percentual}%`, backgroundColor: area.cor }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.marcados} de {item.total} passos</p>
                    </div>
                  </div>
                  <div className="ml-4 text-gray-400 text-lg">👁️</div>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROCEDIMENTOS.areas.filter(area => areasPermitidas.includes(area.id)).map((area) => {
            const stats = progresso[area.id] || { total: 0, marcados: 0 }
            const percentual = stats.total > 0 ? Math.round((stats.marcados / stats.total) * 100) : 0

            return (
              <Link
                key={area.id}
                href={`/comunicacao/area/${area.id}?culto_data=${cultoData}`}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full border-l-4" style={{ borderColor: area.cor }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-3xl mb-2">{area.icone}</div>
                      <h3 className="text-lg font-bold" style={{ color: '#002347' }}>{area.nome}</h3>
                    </div>
                  </div>

                  {area.pendente ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">⏳ Pendente:</span> {area.pendenteMensagem}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 mb-3">
                        <span className="font-semibold">Responsável:</span> {area.responsavelSugerido || '—'}
                      </p>

                      {area.chegadaAntecedencia && (
                        <p className="text-xs text-gray-600 mb-3">
                          <span className="font-semibold">Chegada:</span> {area.chegadaAntecedencia} antes
                        </p>
                      )}

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: '#002347' }}>Progresso</span>
                          <span className="text-xs font-bold" style={{ color: area.cor }}>{percentual}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${percentual}%`, backgroundColor: area.cor }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{stats.marcados} de {stats.total} passos</p>
                      </div>
                    </>
                  )}

                  <div className="mt-4 inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform" style={{ color: area.cor }}>
                    Abrir →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {checklistSelecionado && (
        <DetalhesChecklist
          cultoData={checklistSelecionado.cultoData}
          areaId={checklistSelecionado.areaId}
          onClose={() => setChecklistSelecionado(null)}
          onChecklistExcluido={() => {
            setChecklistSelecionado(null)
            // Recarregar dados
            if (filtroAtivo && dataInicio && dataFim) {
              const carregarRelatorio = async () => {
                setCarregando(true)
                try {
                  const params = new URLSearchParams({ data_inicio: dataInicio, data_fim: dataFim })
                  const resp = await fetch(`/api/comunicacao/periodo?${params.toString()}`)
                  if (resp.ok) {
                    const dados = await resp.json()
                    setRelatorioPeriodo(dados)
                  }
                } catch (err) {
                  console.error('Erro ao carregar relatório:', err)
                } finally {
                  setCarregando(false)
                }
              }
              carregarRelatorio()
            }
          }}
        />
      )}
    </div>
  )
}
