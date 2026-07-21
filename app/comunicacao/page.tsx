'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

export default function ComunicacaoDashboard() {
  const [cultoData, setCultoData] = useState<string>('')
  const [progresso, setProgresso] = useState<Record<string, { total: number; marcados: number }>>({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0]
    setCultoData(hoje)
  }, [])

  useEffect(() => {
    if (!cultoData) return

    const carregarProgresso = async () => {
      setCarregando(true)
      try {
        const resp = await fetch(`/api/comunicacao/progresso?culto_data=${cultoData}`)
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
  }, [cultoData])

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
        <label className="block mb-2">
          <span className="text-sm font-semibold" style={{ color: '#002347' }}>Selecione a data do culto:</span>
        </label>
        <input
          type="date"
          value={cultoData}
          onChange={handleDataChange}
          className="w-full md:w-64 px-4 py-2 border-2 rounded-lg"
          style={{ borderColor: '#C5A059' }}
        />
        <p className="text-xs text-gray-500 mt-2">Cada data tem seu próprio checklist. Novo culto = checklist zerado.</p>
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROCEDIMENTOS.areas.map((area) => {
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
    </div>
  )
}
