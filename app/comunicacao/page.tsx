'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import { formatarDataBR } from '@/lib/datas'

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
  responsaveis?: string[]
}

interface Operador {
  id: number
  nome: string
}

export default function ComunicacaoDashboard() {
  const router = useRouter()
  const [cultoData, setCultoData] = useState<string>('')
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [filtroAtivo, setFiltroAtivo] = useState(false)
  const [progresso, setProgresso] = useState<Record<string, { total: number; marcados: number }>>({})
  const [relatorioPeriodo, setRelatorioPeriodo] = useState<RelatorioData[]>([])
  // Filtro por operador — só o coordenador recebe operadores para escolher
  const [operadores, setOperadores] = useState<Operador[]>([])
  const [operadorFiltro, setOperadorFiltro] = useState<string>('')
  const [carregando, setCarregando] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [areasPermitidas, setAreasPermitidas] = useState<string[]>([])

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0]
    // Definir período padrão: últimos 30 dias
    const dataInicio30diasAtras = new Date()
    dataInicio30diasAtras.setDate(dataInicio30diasAtras.getDate() - 30)
    const dataInicioStr = dataInicio30diasAtras.toISOString().split('T')[0]

    setDataInicio(dataInicioStr)
    setDataFim(hoje)
    setFiltroAtivo(true)
    setCultoData(hoje)
  }, [])

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const resp = await fetch('/api/auth/me')
        if (resp.ok) {
          const user = await resp.json()
          setUsuario(user)

          // As áreas vêm do servidor (fonte única da regra de acesso)
          const respAreas = await fetch('/api/comunicacao/areas-permitidas')
          if (respAreas.ok) {
            const { areas } = await respAreas.json()
            setAreasPermitidas(Array.isArray(areas) ? areas : [])
          } else {
            setAreasPermitidas([])
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
          if (operadorFiltro) params.set('usuario_id', operadorFiltro)
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
  }, [filtroAtivo, dataInicio, dataFim, operadorFiltro])

  // Lista de operadores do período. Não depende de operadorFiltro, senão as
  // opções sumiriam ao filtrar por uma pessoa.
  useEffect(() => {
    if (!dataInicio || !dataFim) return

    const carregarOperadores = async () => {
      try {
        const params = new URLSearchParams({ data_inicio: dataInicio, data_fim: dataFim })
        const resp = await fetch(`/api/comunicacao/operadores?${params.toString()}`)
        if (resp.ok) {
          const dados = await resp.json()
          setOperadores(Array.isArray(dados) ? dados : [])
        }
      } catch (err) {
        console.error('Erro ao carregar operadores:', err)
      }
    }

    carregarOperadores()
  }, [dataInicio, dataFim])

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
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#002347' }}>📡 Comunicação — Operacional</h1>
          <p className="text-gray-600">Runbook dos voluntários da cabine técnica</p>
        </div>
        {/* Atalho para iniciar um checklist sem sair do dashboard */}
        <div className="flex gap-2 flex-wrap">
          {PROCEDIMENTOS.areas
            .filter(area => areasPermitidas.includes(area.id))
            .map(area => (
              <Link
                key={area.id}
                href={`/comunicacao/area-historico/${area.id}`}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{ backgroundColor: area.cor, color: '#fff' }}
              >
                ➕ Novo Checklist
                {areasPermitidas.length > 1 && ` — ${area.nome}`}
              </Link>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <label className="block mb-4">
          <span className="text-sm font-semibold" style={{ color: '#002347' }}>Período:</span>
        </label>

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
        {/* Só aparece para quem coordena: a lista vem vazia para o operador */}
        {operadores.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs text-gray-600 mb-1">Operador:</label>
            <select
              value={operadorFiltro}
              onChange={(e) => setOperadorFiltro(e.target.value)}
              className="w-full px-4 py-2 border-2 rounded-lg"
              style={{ borderColor: '#C5A059' }}
            >
              <option value="">Todos os operadores</option>
              {operadores.map(op => (
                <option key={op.id} value={String(op.id)}>{op.nome}</option>
              ))}
            </select>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">Visualize o histórico de checklists realizados neste período.</p>
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : relatorioPeriodo.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800">Nenhum checklist realizado neste período.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {relatorioPeriodo.map((item) => {
            const area = PROCEDIMENTOS.areas.find(a => a.id === item.area_id)
            if (!area) return null
            const percentual = item.total > 0 ? Math.round((item.marcados / item.total) * 100) : 0

            return (
              <div
                key={`${item.culto_data}-${item.area_id}`}
                className="w-full bg-white rounded-lg shadow-md p-4 border-l-4"
                style={{ borderColor: area.cor }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{area.icone}</span>
                      <div>
                        <h4 className="font-semibold" style={{ color: '#002347' }}>{area.nome}</h4>
                        <p className="text-xs text-gray-500">{formatarDataBR(item.culto_data)}</p>
                        {(item.responsaveis?.length ?? 0) > 0 && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            👤 {item.responsaveis!.join(', ')}
                          </p>
                        )}
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
                  <button
                    onClick={() => {
                      const dataFormatada = item.culto_data.split('T')[0]
                      router.push(`/comunicacao/area/${item.area_id}?culto_data=${dataFormatada}&mode=view`)
                    }}
                    className="px-3 py-1 rounded-lg font-semibold text-xs transition-colors hover:shadow-md"
                    style={{
                      backgroundColor: 'rgba(197, 160, 89, 0.15)',
                      color: area.cor,
                      borderColor: area.cor,
                      border: '1px solid'
                    }}
                  >
                    Ver
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
