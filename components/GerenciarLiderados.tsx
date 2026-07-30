'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Liderado {
  id: number
  usuario: string
  nome: string
  email: string
  ativo: boolean
  data_criacao: string
}

export default function GerenciarLiderados() {
  const router = useRouter()
  const [liderados, setLiderados] = useState<Liderado[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Modal de edição
  const [editingId, setEditingId] = useState<number | null>(null)
  const [senha, setSenha] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [savingEdit, setSavingEdit] = useState(false)

  // Modal de confirmação
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  function flash(msg: string, tipo: 'ok' | 'err' = 'ok') {
    if (tipo === 'ok') {
      setSucesso(msg)
      setTimeout(() => setSucesso(''), 3000)
    } else {
      setErro(msg)
      setTimeout(() => setErro(''), 4000)
    }
  }

  async function carregarLiderados() {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/admin/usuarios/meus-liderados')
      if (!res.ok) throw new Error('Erro ao carregar liderados')
      const data = await res.json()
      setLiderados(data)
    } catch (e: any) {
      flash(e.message, 'err')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarLiderados()
  }, [])

  function abrirEditar(liderado: Liderado) {
    setEditingId(liderado.id)
    setSenha('')
    setAtivo(liderado.ativo)
  }

  function fecharEditar() {
    setEditingId(null)
    setSenha('')
    setAtivo(true)
  }

  async function salvarEdicao() {
    if (!senha.trim()) {
      flash('Senha é obrigatória', 'err')
      return
    }

    if (senha.length < 6) {
      flash('Senha deve ter pelo menos 6 caracteres', 'err')
      return
    }

    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha, ativo }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao atualizar usuário')
      }
      fecharEditar()
      flash('Usuário atualizado com sucesso')
      await carregarLiderados()
    } catch (e: any) {
      flash(e.message, 'err')
    } finally {
      setSavingEdit(false)
    }
  }

  async function confirmarDesativar() {
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${confirmDeleteId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao desativar usuário')
      }
      setConfirmDeleteId(null)
      flash('Liderado desativado com sucesso')
      await carregarLiderados()
    } catch (e: any) {
      flash(e.message, 'err')
    } finally {
      setSavingEdit(false)
    }
  }

  const lideradoEmEdicao = liderados.find(l => l.id === editingId)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1F1F4D 0%, #2E2E66 100%)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-white text-xl font-bold">Gerenciar Liderados</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              Edite senhas e status dos operadores que você cadastrou
            </p>
          </div>
          <a href="/configuracoes" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            ← Voltar
          </a>
        </div>

        {/* Global messages */}
        {erro && (
          <div className="bg-red-900 border border-red-600 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-green-900 border border-green-600 text-green-200 rounded-lg px-4 py-3 mb-4 text-sm">
            {sucesso}
          </div>
        )}

        {/* Lista */}
        <div className="bg-white bg-opacity-10 rounded-xl p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : liderados.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <p className="text-3xl mb-3">👥</p>
              <p className="text-sm mb-6">Você ainda não cadastrou nenhum liderado.</p>
              <a
                href="/configuracoes"
                style={{ backgroundColor: '#4848A8' }}
                className="inline-block text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                ➕ Criar primeiro operador
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {liderados.map(liderado => (
                <div
                  key={liderado.id}
                  className="bg-white bg-opacity-10 rounded-xl px-4 py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-white font-semibold">{liderado.nome}</p>
                      {liderado.ativo ? (
                        <span className="text-xs bg-green-700 text-green-100 px-2 py-1 rounded">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-xs bg-red-700 text-red-100 px-2 py-1 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      @{liderado.usuario}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {liderado.email}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: '4px' }}>
                      Criado em{' '}
                      {new Date(liderado.data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => abrirEditar(liderado)}
                      style={{ color: '#a5b4fc' }}
                      className="text-xs font-medium hover:underline"
                    >
                      🔐 Alterar Senha
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(liderado.id)}
                      style={{ color: '#fca5a5' }}
                      className="text-xs font-medium hover:underline"
                    >
                      ⚪ Desativar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Editar */}
      {editingId !== null && lideradoEmEdicao && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div style={{ backgroundColor: '#1F1F4D' }} className="px-5 py-4 rounded-t-xl">
              <h2 className="text-white font-semibold">
                Editar Liderado: {lideradoEmEdicao.nome}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                />
                {senha && senha.length < 6 && (
                  <p className="text-xs text-red-500 mt-1">
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAtivo(!ativo)}
                    style={{
                      backgroundColor: ativo ? '#16a34a' : '#6b7280',
                    }}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    {ativo ? '✅ Ativo' : '⚪ Inativo'}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 flex justify-end gap-3">
              <button
                onClick={fecharEditar}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={savingEdit || !senha.trim() || senha.length < 6}
                style={{ backgroundColor: '#4848A8' }}
                className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {savingEdit ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação de Desativação */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <p className="font-semibold mb-2">Desativar liderado?</p>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja desativar '{' '}
              {liderados.find(l => l.id === confirmDeleteId)?.nome}'?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDesativar}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {savingEdit ? 'Desativando...' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
