'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

interface ChecklistItem {
  culto_data: string
  area_id: string
  total: number
  marcados: number
}

export default function AreaHistoricoPage() {
  const router = useRouter()
  const params = useParams()
  const areaId = (params?.id as string) || ''
  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)

  const [checklists, setChecklists] = useState<ChecklistItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [showNovoModal, setShowNovoModal] = useState(false)
  const [novaData, setNovaData] = useState<string>(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const carregarChecklists = async () => {
      setCarregando(true)
      try {
        // Buscar últimos 90 dias
        const dataFim = new Date()
        const dataInicio = new Date()
        dataInicio.setDate(dataInicio.getDate() - 90)

        const dataInicioStr = dataInicio.toISOString().split('T')[0]
        const dataFimStr = dataFim.toISOString().split('T')[0]

        const resp = await fetch(
          `/api/comunicacao/periodo?data_inicio=${dataInicioStr}&data_fim=${dataFimStr}&area_id=${areaId}`
        )
        if (resp.ok) {
          const dados = await resp.json()
          setChecklists(dados)
        }
      } catch (err) {
        console.error('Erro ao carregar checklists:', err)
      } finally {
        setCarregando(false)
      }
    }

    if (areaId) carregarChecklists()
  }, [areaId])

  if (!area) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-red-600 font-semibold">Área não encontrada</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#002347' }}>
            {area.icone} {area.nome}
          </h1>
          <p className="text-gray-600 mt-1">Histórico de checklists realizados</p>
        </div>
        <button
          onClick={() => setShowNovoModal(true)}
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          style={{ backgroundColor: area.cor, color: '#fff' }}
        >
          ➕ Novo Checklist
        </button>
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando histórico...</p>
        </div>
      ) : checklists.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 mb-4">Nenhum checklist realizado para esta área.</p>
          <button
            onClick={() => setShowNovoModal(true)}
            className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ backgroundColor: area.cor, color: '#fff' }}
          >
            ➕ Criar primeiro checklist
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((checklist) => {
            const percentual = checklist.total > 0 ? Math.round((checklist.marcados / checklist.total) * 100) : 0
            const dataString = checklist.culto_data.split('T')[0]
            const [ano, mes, dia] = dataString.split('-')
            const data = new Date(Number(ano), Number(mes) - 1, Number(dia))
            const dataFormatada = data.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })

            return (
              <button
                key={checklist.culto_data}
                onClick={() => {
                  router.push(`/comunicacao/area/${areaId}?culto_data=${dataString}&mode=view`)
                }}
                className="w-full text-left bg-white rounded-lg shadow-md p-4 border-l-4 hover:shadow-lg transition-shadow"
                style={{ borderColor: area.cor }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: '#002347' }}>
                      {dataFormatada}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: '#002347' }}>
                          Progresso
                        </span>
                        <span className="text-xs font-bold" style={{ color: area.cor }}>
                          {percentual}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentual}%`,
                            backgroundColor: area.cor
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {checklist.marcados} de {checklist.total} passos
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 text-gray-400 text-lg">👁️</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal: Novo Checklist */}
      {showNovoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#002347' }}>
              Novo Checklist — {area.nome}
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data da realização:
              </label>
              <input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-lg"
                style={{ borderColor: '#C5A059' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNovoModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  router.push(`/comunicacao/area/${areaId}?culto_data=${novaData}`)
                }}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors text-white"
                style={{ backgroundColor: area.cor }}
              >
                Começar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
