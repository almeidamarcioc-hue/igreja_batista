'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ContasPage() {
  const [contas, setContas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarContas()
  }, [])

  const carregarContas = async () => {
    setLoading(true)
    const res = await fetch('/api/financeiro/contas')
    const data = await res.json()
    setContas(data)
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta conta?')) return

    await fetch(`/api/financeiro/contas/${id}`, {
      method: 'DELETE',
    })

    carregarContas()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">🏦 Contas</h2>
        <Link
          href="/financeiro/contas/nova"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nova Conta
        </Link>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : contas.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Nenhuma conta encontrada</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Nome</th>
                <th className="text-left p-4 font-medium text-sm">Tipo</th>
                <th className="text-left p-4 font-medium text-sm">Ministério</th>
                <th className="text-right p-4 font-medium text-sm">Saldo</th>
                <th className="text-right p-4 font-medium text-sm">Saldo Inicial</th>
                <th className="text-center p-4 font-medium text-sm">Status</th>
                <th className="text-center p-4 font-medium text-sm">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contas.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{c.nome}</td>
                  <td className="p-4 text-sm">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {c.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{c.ministerio_nome}</td>
                  <td className="p-4 text-right font-bold">R$ {c.saldo_atual.toFixed(2)}</td>
                  <td className="p-4 text-right">R$ {c.saldo_inicial.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded text-white text-xs font-bold
                      ${c.ativa ? 'bg-green-500' : 'bg-gray-500'}
                    `}>
                      {c.ativa ? 'ATIVA' : 'INATIVA'}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <Link
                      href={`/financeiro/contas/${c.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    {c.ativa && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Deletar
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
