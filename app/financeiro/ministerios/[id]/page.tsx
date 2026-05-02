'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditarMinisterioPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    orcamento_anual: 0,
    responsavel: '',
    ativa: true,
  })

  useEffect(() => {
    if (!id) return
    carregarMinisterio()
  }, [id])

  const carregarMinisterio = async () => {
    try {
      const res = await fetch(`/api/financeiro/ministerios/${id}`)
      if (!res.ok) throw new Error('Ministério não encontrado')
      const ministerio = await res.json()
      setForm({
        nome: ministerio.nome || '',
        descricao: ministerio.descricao || '',
        orcamento_anual: ministerio.orcamento_anual || 0,
        responsavel: ministerio.responsavel || '',
        ativa: ministerio.ativa !== false,
      })
    } catch (err) {
      alert('Erro ao carregar ministério')
      router.push('/financeiro/ministerios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/financeiro/ministerios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao,
          orcamento_anual: parseFloat(form.orcamento_anual.toString()),
          responsavel: form.responsavel,
          ativa: form.ativa,
        }),
      })

      if (res.ok) {
        alert('Ministério atualizado com sucesso!')
        router.push('/financeiro/ministerios')
      } else {
        alert('Erro ao atualizar ministério')
      }
    } catch (err) {
      alert('Erro ao atualizar ministério')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Editar Ministério</h2>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Nome</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full p-3 border rounded text-gray-900"
            placeholder="Ex: Ministério de Louvor"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="w-full p-3 border rounded text-gray-900"
            rows={3}
            placeholder="Descrição do ministério"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">Orçamento Anual</label>
            <input
              type="number"
              value={form.orcamento_anual}
              onChange={(e) => setForm({ ...form, orcamento_anual: parseFloat(e.target.value) })}
              step="0.01"
              className="w-full p-3 border rounded text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">Responsável</label>
            <input
              type="text"
              value={form.responsavel}
              onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              className="w-full p-3 border rounded text-gray-900"
              placeholder="Nome do responsável"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.ativa}
              onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-900">Ministério Ativo</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-purple-600 text-white p-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Ministério'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-300 text-gray-700 p-3 rounded font-medium hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
