'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NovaContaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ministerios, setMinisterios] = useState<any[]>([])
  const [form, setForm] = useState({
    nome: '',
    tipo: 'bancaria',
    ministerio_id: '',
    saldo_inicial: 0,
    banco: '',
    agencia: '',
    conta: '',
    titular: '',
  })

  useEffect(() => {
    carregarMinisterios()
  }, [])

  const carregarMinisterios = async () => {
    const res = await fetch('/api/financeiro/ministerios')
    const data = await res.json()
    setMinisterios(data)
    if (data.length > 0) setForm(prev => ({ ...prev, ministerio_id: data[0].id }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/financeiro/contas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ministerio_id: parseInt(form.ministerio_id),
          saldo_inicial: parseFloat(form.saldo_inicial.toString()),
        }),
      })

      if (res.ok) {
        alert('Conta criada com sucesso!')
        router.push('/financeiro/contas')
      }
    } catch (err) {
      alert('Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Nova Conta</h2>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Nome</label>
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
            <label className="block text-sm font-medium mb-2 text-gray-900">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="bancaria">Bancária</option>
              <option value="caixa">Caixa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">Ministério</label>
            <select
              value={form.ministerio_id}
              onChange={(e) => setForm({ ...form, ministerio_id: e.target.value })}
              className="w-full p-3 border rounded"
              required
            >
              {ministerios.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Saldo Inicial</label>
          <input
            type="number"
            value={form.saldo_inicial}
            onChange={(e) => setForm({ ...form, saldo_inicial: parseFloat(e.target.value) })}
            step="0.01"
            className="w-full p-3 border rounded"
            required
          />
        </div>

        {form.tipo === 'bancaria' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Banco</label>
              <input
                type="text"
                value={form.banco}
                onChange={(e) => setForm({ ...form, banco: e.target.value })}
                className="w-full p-3 border rounded"
                placeholder="Ex: Banco do Brasil"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Agência</label>
                <input
                  type="text"
                  value={form.agencia}
                  onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                  className="w-full p-3 border rounded"
                  placeholder="0001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Conta</label>
                <input
                  type="text"
                  value={form.conta}
                  onChange={(e) => setForm({ ...form, conta: e.target.value })}
                  className="w-full p-3 border rounded"
                  placeholder="123456-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">Titular</label>
              <input
                type="text"
                value={form.titular}
                onChange={(e) => setForm({ ...form, titular: e.target.value })}
                className="w-full p-3 border rounded"
                placeholder="Nome do titular"
              />
            </div>
          </>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Conta'}
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
