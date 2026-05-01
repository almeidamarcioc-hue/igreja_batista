'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditarContaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ministerios, setMinisterios] = useState<any[]>([])
  const [form, setForm] = useState({
    nome: '',
    tipo: 'bancaria' as 'bancaria' | 'caixa',
    ministerio_id: '',
    instituicao: '',
    agencia: '',
    numero_conta: '',
  })

  useEffect(() => {
    Promise.all([carregarConta(), carregarMinisterios()])
  }, [id])

  const carregarConta = async () => {
    try {
      const res = await fetch(`/api/financeiro/contas/${id}`)
      if (!res.ok) throw new Error('Conta não encontrada')
      const conta = await res.json()
      setForm({
        nome: conta.nome || '',
        tipo: conta.tipo || 'bancaria',
        ministerio_id: conta.ministerio_id?.toString() || '',
        instituicao: conta.instituicao || '',
        agencia: conta.agencia || '',
        numero_conta: conta.numero_conta || '',
      })
    } catch (err) {
      alert('Erro ao carregar conta')
      router.push('/financeiro/contas')
    } finally {
      setLoading(false)
    }
  }

  const carregarMinisterios = async () => {
    try {
      const res = await fetch('/api/financeiro/ministerios')
      const data = await res.json()
      setMinisterios(data)
    } catch (err) {
      console.error('Erro ao carregar ministérios:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/financeiro/contas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ministerio_id: form.ministerio_id ? parseInt(form.ministerio_id) : null,
        }),
      })

      if (res.ok) {
        alert('Conta atualizada com sucesso!')
        router.push('/financeiro/contas')
      } else {
        alert('Erro ao atualizar conta')
      }
    } catch (err) {
      alert('Erro ao atualizar conta')
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
      <h2 className="text-3xl font-bold mb-6">Editar Conta</h2>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nome</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full p-3 border rounded"
            placeholder="Ex: Conta Principal"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as 'bancaria' | 'caixa' })}
              className="w-full p-3 border rounded"
            >
              <option value="bancaria">Bancária</option>
              <option value="caixa">Caixa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ministério</label>
            <select
              value={form.ministerio_id}
              onChange={(e) => setForm({ ...form, ministerio_id: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="">Nenhum</option>
              {ministerios.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {form.tipo === 'bancaria' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Instituição Bancária</label>
              <input
                type="text"
                value={form.instituicao}
                onChange={(e) => setForm({ ...form, instituicao: e.target.value })}
                className="w-full p-3 border rounded"
                placeholder="Ex: Banco do Brasil"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agência</label>
                <input
                  type="text"
                  value={form.agencia}
                  onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                  className="w-full p-3 border rounded"
                  placeholder="0001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Número da Conta</label>
                <input
                  type="text"
                  value={form.numero_conta}
                  onChange={(e) => setForm({ ...form, numero_conta: e.target.value })}
                  className="w-full p-3 border rounded"
                  placeholder="123456-7"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Conta'}
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
