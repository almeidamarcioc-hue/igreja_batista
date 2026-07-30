'use client'

import { useState, useEffect } from 'react'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

interface Passo {
  id: string
  titulo: string
  descricao: string
  tipo: string
  isCustomizado: boolean
  editado?: boolean
}

interface GerenciarPassosModalProps {
  cultoData: string
  areaId: string
  onClose: () => void
  temPermissao: boolean
}

export default function GerenciarPassosModal({
  cultoData,
  areaId,
  onClose,
  temPermissao
}: GerenciarPassosModalProps) {
  const [passosPadrao, setPassosPadrao] = useState<Passo[]>([])
  const [passosCustomizados, setPassosCustomizados] = useState<Passo[]>([])
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [novoTipo, setNovoTipo] = useState('pre')
  const [carregando, setCarregando] = useState(true)
  const [adicionando, setAdicionando] = useState(false)
  const [removendo, setRemovendo] = useState<string | null>(null)

  // Edição de um passo existente
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [erro, setErro] = useState('')

  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)

  const carregarPassos = async () => {
    try {
      const resp = await fetch(`/api/comunicacao/area-passos?area_id=${areaId}`)
      if (resp.ok) {
        const dados = await resp.json()
        setPassosPadrao(dados.padrao || [])
        setPassosCustomizados(dados.customizados || [])
      }
    } catch (err) {
      console.error('Erro ao carregar passos:', err)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarPassos()
  }, [areaId])

  const abrirEdicao = (passo: Passo) => {
    setErro('')
    setEditandoId(passo.id)
    setEditTitulo(passo.titulo)
    setEditDescricao(passo.descricao || '')
  }

  const fecharEdicao = () => {
    setEditandoId(null)
    setEditTitulo('')
    setEditDescricao('')
  }

  const handleSalvarEdicao = async (passo: Passo) => {
    if (!editTitulo.trim()) return
    setSalvandoEdicao(true)
    setErro('')
    try {
      const resp = passo.isCustomizado
        ? await fetch(`/api/comunicacao/passos-customizados/${passo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: editTitulo, descricao: editDescricao }),
          })
        : await fetch('/api/comunicacao/area-passos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              areaId,
              action: 'editar',
              passoId: passo.id,
              titulo: editTitulo,
              descricao: editDescricao,
            }),
          })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao salvar alteração')
      }

      fecharEdicao()
      await carregarPassos()
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setSalvandoEdicao(false)
    }
  }

  const handleRestaurarPadrao = async (passo: Passo) => {
    setSalvandoEdicao(true)
    setErro('')
    try {
      const resp = await fetch('/api/comunicacao/area-passos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaId, action: 'restaurar', passoId: passo.id }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || 'Erro ao restaurar texto original')
      }
      fecharEdicao()
      await carregarPassos()
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setSalvandoEdicao(false)
    }
  }

  const handleAdicionarPasso = async () => {
    if (!novoTitulo.trim()) return

    setAdicionando(true)
    try {
      const dataFormatada = cultoData.split('T')[0]
      const resp = await fetch('/api/comunicacao/passos-customizados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: dataFormatada,
          area_id: areaId,
          titulo: novoTitulo,
          descricao: novaDescricao,
          tipo: novoTipo
        })
      })

      if (resp.ok) {
        const novoPasso = await resp.json()
        setPassosCustomizados([...passosCustomizados, { ...novoPasso, isCustomizado: true }])
        setNovoTitulo('')
        setNovaDescricao('')
        setNovoTipo('pre')
      } else if (resp.status === 403) {
        alert('Você não tem permissão para adicionar passos')
      }
    } catch (err) {
      console.error('Erro ao adicionar passo:', err)
    } finally {
      setAdicionando(false)
    }
  }

  const handleRemoverPasso = async (passoId: string, isCustomizado: boolean) => {
    if (!confirm('Tem certeza que deseja remover este passo?')) return

    setRemovendo(passoId)
    try {
      if (isCustomizado) {
        // Remover passo customizado
        const resp = await fetch(`/api/comunicacao/passos-customizados/${passoId}`, {
          method: 'DELETE'
        })

        if (resp.ok) {
          setPassosCustomizados(passosCustomizados.filter(p => p.id !== passoId))
        } else if (resp.status === 403) {
          alert('Você não tem permissão para remover passos')
        }
      } else {
        // Desabilitar passo padrão
        const resp = await fetch('/api/comunicacao/area-passos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            areaId,
            action: 'desabilitar',
            passoId
          })
        })

        if (resp.ok) {
          setPassosPadrao(passosPadrao.filter(p => p.id !== passoId))
        } else if (resp.status === 403) {
          alert('Você não tem permissão para remover passos')
        }
      }
    } catch (err) {
      console.error('Erro ao remover passo:', err)
    } finally {
      setRemovendo(null)
    }
  }

  const tiposDisponivel = [
    { value: 'pre', label: '✅ Antes' },
    { value: 'operacao', label: '▸ Durante' },
    { value: 'pos', label: '🏁 Depois' }
  ]

  const renderPasso = (passo: Passo, corBorda: string, fundo: string) => {
    const tipoLabel = tiposDisponivel.find(t => t.value === passo.tipo)?.label || passo.tipo
    const emEdicao = editandoId === passo.id

    return (
      <div
        key={passo.id}
        className={`p-3 ${fundo} rounded-lg border-l-4 mb-2`}
        style={{ borderColor: corBorda }}
      >
        {emEdicao ? (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={editTitulo}
                onChange={(e) => setEditTitulo(e.target.value)}
                className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                style={{ borderColor: '#C5A059' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
              <textarea
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                style={{ borderColor: '#C5A059' }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSalvarEdicao(passo)}
                disabled={salvandoEdicao || !editTitulo.trim()}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {salvandoEdicao ? '⏳ Salvando...' : '💾 Salvar'}
              </button>
              <button
                onClick={fecharEdicao}
                disabled={salvandoEdicao}
                className="px-3 py-1 border border-gray-300 text-gray-600 rounded text-xs font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              {!passo.isCustomizado && passo.editado && (
                <button
                  onClick={() => handleRestaurarPadrao(passo)}
                  disabled={salvandoEdicao}
                  className="px-3 py-1 border border-gray-300 text-gray-600 rounded text-xs font-semibold hover:bg-gray-50"
                  title="Voltar ao texto original do template"
                >
                  ↩️ Restaurar original
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: '#002347' }}>
                {passo.titulo}
                {passo.editado && (
                  <span className="ml-2 text-xs font-normal text-gray-500">(editado)</span>
                )}
              </p>
              {passo.descricao && (
                <p className="text-xs text-gray-600 mt-1">{passo.descricao}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">{tipoLabel}</p>
            </div>
            <div className="ml-4 flex gap-1 flex-shrink-0">
              <button
                onClick={() => abrirEdicao(passo)}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold hover:bg-gray-300"
                title="Editar passo"
              >
                ✏️
              </button>
              <button
                onClick={() => handleRemoverPasso(passo.id, passo.isCustomizado)}
                disabled={removendo === passo.id}
                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 disabled:opacity-50"
                title="Remover passo"
              >
                {removendo === passo.id ? '⏳' : '🗑️'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#002347' }}>
              {area?.icone} Gerenciar Checklist
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {area?.nome} — Template do checklist
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6">
          {!temPermissao ? (
            <p className="text-center text-gray-500 py-8">
              Você não tem permissão para gerenciar o checklist desta área.
            </p>
          ) : (
            <>
              {erro && (
                <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                  {erro}
                </div>
              )}

              {/* Adicionar novo passo customizado */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-4" style={{ color: '#002347' }}>
                  ➕ Adicionar Novo Passo Customizado
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={novoTitulo}
                      onChange={(e) => setNovoTitulo(e.target.value)}
                      placeholder="Ex: Verificar áudio"
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: '#C5A059' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={novaDescricao}
                      onChange={(e) => setNovaDescricao(e.target.value)}
                      placeholder="Ex: Verificar se o áudio está funcionando"
                      rows={2}
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: '#C5A059' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Fase
                    </label>
                    <select
                      value={novoTipo}
                      onChange={(e) => setNovoTipo(e.target.value)}
                      className="w-full px-3 py-2 border-2 rounded-lg"
                      style={{ borderColor: '#C5A059' }}
                    >
                      {tiposDisponivel.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAdicionarPasso}
                    disabled={adicionando || !novoTitulo.trim()}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {adicionando ? '⏳ Adicionando...' : '➕ Adicionar Passo'}
                  </button>
                </div>
              </div>

              {/* Passos do template */}
              <div>
                <h3 className="font-semibold mb-4" style={{ color: '#002347' }}>
                  📋 Passos do Checklist
                </h3>

                {carregando ? (
                  <p className="text-center text-gray-500 py-4">Carregando...</p>
                ) : (
                  <div className="space-y-2">
                    {/* Passos padrão */}
                    {passosPadrao.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">PADRÃO (do template original)</p>
                        {passosPadrao.map((passo) =>
                          renderPasso({ ...passo, isCustomizado: false }, area?.cor ?? '#002347', 'bg-gray-50')
                        )}
                      </div>
                    )}

                    {/* Passos customizados */}
                    {passosCustomizados.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">CUSTOMIZADOS (adicionados por você)</p>
                        {passosCustomizados.map((passo) =>
                          renderPasso({ ...passo, isCustomizado: true }, '#3B82F6', 'bg-blue-50')
                        )}
                      </div>
                    )}

                    {passosPadrao.length === 0 && passosCustomizados.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        Nenhum passo disponível.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
