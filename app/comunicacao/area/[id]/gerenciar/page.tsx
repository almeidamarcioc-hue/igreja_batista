'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'
import GerenciarPassosModal from '@/components/GerenciarPassosModal'

interface ChecklistItem {
  culto_data: string
  area_id: string
  total: number
  marcados: number
}

export default function GerenciarAreaPage() {
  const router = useRouter()
  const params = useParams()
  const areaId = (params?.id as string) || ''
  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)

  const [checklists, setChecklists] = useState<ChecklistItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [checklistSelecionado, setChecklistSelecionado] = useState<string | null>(null)
  const [temPermissao, setTemPermissao] = useState(false)

  useEffect(() => {
    const verificarPermissao = async () => {
      try {
        const respUser = await fetch('/api/auth/me')
        if (respUser.ok) {
          const user = await respUser.json()
          const permissoes = user.permissoes ? JSON.parse(user.permissoes) : []
          const ehAdmin = user.role === 'admin'
          const ehCoordenador = permissoes.some((p: string) => p === `comunicacao:${areaId}.coordenador`)
          setTemPermissao(ehAdmin || ehCoordenador)
        }
      } catch (err) {
        console.error('Erro ao verificar permissão:', err)
      }
    }

    verificarPermissao()
  }, [areaId])

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

  if (!temPermissao) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-2xl mb-4">🔒</p>
        <p className="text-red-600 font-semibold mb-4">Acesso negado</p>
        <p className="text-gray-600 mb-6">Apenas admin e coordenadores podem gerenciar passos.</p>
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

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 mb-4"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#002347' }}>
            {area.icone} Gerenciar Passos — {area.nome}
          </h1>
          <p className="text-gray-600 mt-1">Selecione um checklist para adicionar ou remover passos customizados</p>
        </div>
      </div>

      {carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando checklists...</p>
        </div>
      ) : checklists.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 mb-4">Nenhum checklist realizado nesta área.</p>
          <p className="text-sm text-gray-600">Crie um checklist primeiro antes de gerenciar passos customizados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((checklist) => {
            const percentual = checklist.total > 0 ? Math.round((checklist.marcados / checklist.total) * 100) : 0
            const data = new Date(checklist.culto_data)
            const [ano, mes, dia] = checklist.culto_data.split('-')
            const dataObj = new Date(Number(ano), Number(mes) - 1, Number(dia))
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })

            return (
              <button
                key={checklist.culto_data}
                onClick={() => setChecklistSelecionado(checklist.culto_data)}
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
                  <div className="ml-4 text-gray-400 text-lg">⚙️</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {checklistSelecionado && (
        <GerenciarPassosModal
          cultoData={checklistSelecionado}
          areaId={areaId}
          onClose={() => setChecklistSelecionado(null)}
          temPermissao={true}
        />
      )}
    </div>
  )
}
