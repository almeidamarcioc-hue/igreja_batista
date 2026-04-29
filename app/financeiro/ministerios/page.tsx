'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MinisteriosPage() {
  const [ministerios, setMinisterios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMinisterios()
  }, [])

  const carregarMinisterios = async () => {
    setLoading(true)
    const res = await fetch('/api/financeiro/ministerios')
    const data = await res.json()
    setMinisterios(data)
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este ministério?')) return

    await fetch(`/api/financeiro/ministerios/${id}`, {
      method: 'DELETE',
    })

    carregarMinisterios()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">⛪ Ministérios</h2>
        <Link
          href="/financeiro/ministerios/novo"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          + Novo Ministério
        </Link>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : ministerios.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Nenhum ministério encontrado</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Nome</th>
                <th className="text-left p-4 font-medium text-sm">Descrição</th>
                <th className="text-right p-4 font-medium text-sm">Orçamento Anual</th>
                <th className="text-left p-4 font-medium text-sm">Responsável</th>
                <th className="text-center p-4 font-medium text-sm">Status</th>
                <th className="text-center p-4 font-medium text-sm">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ministerios.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{m.nome}</td>
                  <td className="p-4 text-sm text-gray-600">{m.descricao || '-'}</td>
                  <td className="p-4 text-right font-bold">R$ {m.orcamento_anual.toFixed(2)}</td>
                  <td className="p-4 text-sm">{m.responsavel || '-'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded text-white text-xs font-bold
                      ${m.ativa ? 'bg-green-500' : 'bg-gray-500'}
                    `}>
                      {m.ativa ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <Link
                      href={`/financeiro/ministerios/${m.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    {m.ativa && (
                      <button
                        onClick={() => handleDelete(m.id)}
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
