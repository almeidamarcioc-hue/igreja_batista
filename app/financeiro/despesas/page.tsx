'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', dataInicio: '', dataFim: '' })

  useEffect(() => {
    carregarDespesas()
  }, [filter])

  const carregarDespesas = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter.status) params.append('status', filter.status)
    if (filter.dataInicio) params.append('dataInicio', filter.dataInicio)
    if (filter.dataFim) params.append('dataFim', filter.dataFim)

    const res = await fetch(`/api/financeiro/contas-pagar?${params}`)
    const data = await res.json()
    setDespesas(data)
    setLoading(false)
  }

  const handleStatusChange = async (id: number, novoStatus: string) => {
    const data = novoStatus === 'pago' 
      ? { status: 'pago', data_pagamento: new Date().toISOString().split('T')[0] }
      : { status: novoStatus }

    await fetch(`/api/financeiro/contas-pagar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    carregarDespesas()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">📤 Despesas</h2>
        <Link
          href="/financeiro/despesas/nova"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          + Nova Despesa
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full p-2 border rounded text-sm text-gray-900"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Data Início</label>
            <input
              type="date"
              value={filter.dataInicio}
              onChange={(e) => setFilter({ ...filter, dataInicio: e.target.value })}
              className="w-full p-2 border rounded text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Data Fim</label>
            <input
              type="date"
              value={filter.dataFim}
              onChange={(e) => setFilter({ ...filter, dataFim: e.target.value })}
              className="w-full p-2 border rounded text-sm text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-gray-900">Carregando...</div>
        ) : despesas.length === 0 ? (
          <div className="p-4 text-center text-gray-900">Nenhuma despesa encontrada</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm text-gray-900">Descrição</th>
                <th className="text-left p-4 font-medium text-sm text-gray-900">Tipo</th>
                <th className="text-right p-4 font-medium text-sm text-gray-900">Valor</th>
                <th className="text-left p-4 font-medium text-sm text-gray-900">Data Vencimento</th>
                <th className="text-center p-4 font-medium text-sm text-gray-900">Status</th>
                <th className="text-center p-4 font-medium text-sm text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {despesas.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{d.descricao}</td>
                  <td className="p-4 text-sm text-gray-900">{d.tipo}</td>
                  <td className="p-4 text-right font-bold text-gray-900">R$ {Number(d.valor).toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-900">{new Date(d.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded text-white text-xs font-bold
                      ${d.status === 'pendente' ? 'bg-orange-500' : ''}
                      ${d.status === 'pago' ? 'bg-green-500' : ''}
                      ${d.status === 'cancelado' ? 'bg-gray-500' : ''}
                    `}>
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {d.status === 'pendente' && (
                      <button
                        onClick={() => handleStatusChange(d.id, 'pago')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
