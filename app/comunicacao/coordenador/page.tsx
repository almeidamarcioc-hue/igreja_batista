'use client'

import { useState, useEffect } from 'react'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

interface ResumoArea {
  areaId: string
  total: number
  marcados: number
}

export default function CoordenadorPage() {
  const [cultoData, setCultoData] = useState<string>('')
  const [resumo, setResumo] = useState<ResumoArea[]>([])
  const [carregando, setCarregando] = useState(true)
  const [autoAtualizar, setAutoAtualizar] = useState(true)

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0]
    setCultoData(hoje)
  }, [])

  useEffect(() => {
    if (!cultoData) return

    const carregarResumo = async () => {
      setCarregando(true)
      try {
        const resp = await fetch(`/api/comunicacao/resumo?culto_data=${cultoData}`)
        if (resp.ok) {
          const dados = await resp.json()
          setResumo(dados)
        }
      } catch (err) {
        console.error('Erro ao carregar resumo:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarResumo()

    if (!autoAtualizar) return

    const interval = setInterval(carregarResumo, 5000)
    return () => clearInterval(interval)
  }, [cultoData, autoAtualizar])

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCultoData(e.target.value)
  }

  const totalGeral = resumo.reduce((sum, a) => sum + a.total, 0)
  const marcadosGeral = resumo.reduce((sum, a) => sum + a.marcados, 0)
  const percentualGeral = totalGeral > 0 ? Math.round((marcadosGeral / totalGeral) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#002347' }}>👁️ Visão de Coordenador</h1>
        <p className="text-gray-600">Acompanhamento em tempo real do progresso de todas as áreas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block mb-2">
            <span className="text-sm font-semibold" style={{ color: '#002347' }}>Data do culto:</span>
          </label>
          <input
            type="date"
            value={cultoData}
            onChange={handleDataChange}
            className="w-full px-4 py-2 border-2 rounded-lg"
            style={{ borderColor: '#C5A059' }}
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAtualizar}
              onChange={(e) => setAutoAtualizar(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold" style={{ color: '#002347' }}>Atualizar a cada 5s</span>
          </label>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ backgroundColor: '#C5A059', color: '#fff' }}
          >
            🔄 Atualizar agora
          </button>
        </div>
      </div>

      {/* BARRA DE PROGRESSO GERAL */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#002347' }}>Progresso do culto</h2>
          <span className="text-3xl font-bold" style={{ color: '#002347' }}>
            {percentualGeral}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full transition-all"
            style={{
              width: `${percentualGeral}%`,
              backgroundColor: '#C5A059',
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-4">
          <span className="font-semibold">{marcadosGeral}</span> de <span className="font-semibold">{totalGeral}</span> passos concluídos em todas as áreas
        </p>
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROCEDIMENTOS.areas.map((area) => {
            const stats = resumo.find(r => r.areaId === area.id)
            if (!stats) return null

            const percentual = stats.total > 0 ? Math.round((stats.marcados / stats.total) * 100) : 0

            return (
              <div
                key={area.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4"
                style={{ borderColor: area.cor }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-2">{area.icone}</div>
                    <h3 className="text-lg font-bold" style={{ color: '#002347' }}>{area.nome}</h3>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: area.cor }}>
                    {percentual}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${percentual}%`,
                      backgroundColor: area.cor,
                    }}
                  />
                </div>

                <p className="text-xs text-gray-600 mt-3">
                  <span className="font-semibold">{stats.marcados}</span> de <span className="font-semibold">{stats.total}</span> passos
                </p>

                {area.pendente && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
                    <p className="text-xs text-yellow-800">⏳ Pendente</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">ℹ️ Como funciona:</span> Esta visão mostra o progresso <strong>agregado</strong> de cada área. Cada operador pode estar em uma fase diferente, e o coordenador vê o total. Atualiza automaticamente a cada 5 segundos.
        </p>
      </div>
    </div>
  )
}
