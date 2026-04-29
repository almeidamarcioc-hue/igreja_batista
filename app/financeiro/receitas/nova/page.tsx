'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NovaReceitaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ministerios, setMinisterios] = useState<any[]>([])
  const [contas, setContas] = useState<any[]>([])
  const [form, setForm] = useState({
    descricao: '',
    tipo: 'dizimo',
    ministerio_id: '',
    conta_id: '',
    valor: 0,
    data_vencimento: new Date().toISOString().split('T')[0],
    forma_pagamento: 'pix',
    observacoes: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    const [minRes, contasRes] = await Promise.all([
      fetch('/api/financeiro/ministerios'),
      fetch('/api/financeiro/contas'),
    ])
    const min = await minRes.json()
    const con = await contasRes.json()
    setMinisterios(min)
    setContas(con)
    if (con.length > 0) setForm(prev => ({ ...prev, conta_id: con[0].id }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/financeiro/contas-receber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ministerio_id: form.ministerio_id ? parseInt(form.ministerio_id) : null,
          conta_id: parseInt(form.conta_id),
          valor: parseFloat(form.valor.toString()),
        }),
      })

      if (res.ok) {
        alert('Receita criada com sucesso!')
        router.push('/financeiro/receitas')
      }
    } catch (err) {
      alert('Erro ao criar receita')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Nova Receita</h2>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Descrição</label>
          <input
            type="text"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="w-full p-3 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="dizimo">Dízimo</option>
              <option value="oferta">Oferta</option>
              <option value="doacao">Doação</option>
              <option value="evento">Evento</option>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Valor</label>
            <input
              type="number"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) })}
              step="0.01"
              className="w-full p-3 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Vencimento</label>
            <input
              type="date"
              value={form.data_vencimento}
              onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
              className="w-full p-3 border rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Conta</label>
            <select
              value={form.conta_id}
              onChange={(e) => setForm({ ...form, conta_id: e.target.value })}
              className="w-full p-3 border rounded"
              required
            >
              {contas.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Forma Pagamento</label>
            <select
              value={form.forma_pagamento}
              onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
              className="w-full p-3 border rounded"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="transferencia">Transferência</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="w-full p-3 border rounded"
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white p-3 rounded font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Receita'}
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
