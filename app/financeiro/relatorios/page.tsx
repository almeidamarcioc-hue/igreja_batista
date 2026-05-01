'use client'

import { useState, useEffect } from 'react'

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [receitas, setReceitas] = useState<any[]>([])
  const [despesas, setDespesas] = useState<any[]>([])
  const [ministerios, setMinisterios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'resumo' | 'receitas' | 'despesas' | 'ministerios'>('resumo')

  useEffect(() => {
    const hoje = new Date()
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    setDataInicio(primeiro.toISOString().split('T')[0])
    setDataFim(ultimoDia.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (dataInicio && dataFim) {
      carregarRelatorios()
    }
  }, [dataInicio, dataFim])

  const carregarRelatorios = async () => {
    setLoading(true)
    try {
      const [receRes, despRes, minRes] = await Promise.all([
        fetch(`/api/financeiro/contas-receber?dataInicio=${dataInicio}&dataFim=${dataFim}`),
        fetch(`/api/financeiro/contas-pagar?dataInicio=${dataInicio}&dataFim=${dataFim}`),
        fetch('/api/financeiro/dashboard'),
      ])

      const receData = await receRes.json()
      const despData = await despRes.json()
      const minData = await minRes.json()

      setReceitas(receData)
      setDespesas(despData)
      setMinisterios(minData.saude_ministerios || [])
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0)
  const totalRecebido = receitas.filter(r => r.status === 'recebido').reduce((acc, r) => acc + r.valor, 0)
  const totalAbertoReceita = receitas.filter(r => r.status === 'aberto').reduce((acc, r) => acc + r.valor, 0)

  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0)
  const totalPago = despesas.filter(d => d.status === 'pago').reduce((acc, d) => acc + d.valor, 0)
  const totalPendente = despesas.filter(d => d.status === 'pendente').reduce((acc, d) => acc + d.valor, 0)

  const resultado = totalRecebido - totalPago

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">📈 Relatórios</h2>

      {/* Filtros de data */}
      <div className="bg-white p-6 rounded-lg shadow flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Data Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Data Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('resumo')}
          className={`px-4 py-3 font-medium border-b-2 ${activeTab === 'resumo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'}`}
        >
          📊 Resumo
        </button>
        <button
          onClick={() => setActiveTab('receitas')}
          className={`px-4 py-3 font-medium border-b-2 ${activeTab === 'receitas' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600'}`}
        >
          ⬆️ Receitas
        </button>
        <button
          onClick={() => setActiveTab('despesas')}
          className={`px-4 py-3 font-medium border-b-2 ${activeTab === 'despesas' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600'}`}
        >
          ⬇️ Despesas
        </button>
        <button
          onClick={() => setActiveTab('ministerios')}
          className={`px-4 py-3 font-medium border-b-2 ${activeTab === 'ministerios' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600'}`}
        >
          ⛪ Ministérios
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-600">
          Carregando relatórios...
        </div>
      ) : (
        <>
          {/* ABA: RESUMO */}
          {activeTab === 'resumo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                  <div className="text-gray-600 text-sm">Total Recebido</div>
                  <div className="text-2xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
                  <div className="text-gray-600 text-sm">Aguardando Receber</div>
                  <div className="text-2xl font-bold text-orange-600">R$ {totalAbertoReceita.toFixed(2)}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                  <div className="text-gray-600 text-sm">Total Pago</div>
                  <div className="text-2xl font-bold text-red-600">R$ {totalPago.toFixed(2)}</div>
                </div>
                <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${resultado >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="text-gray-600 text-sm">Resultado</div>
                  <div className={`text-2xl font-bold ${resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {resultado.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Comparativo do Período</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Receitas</span>
                      <span className="font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-3">
                      <div
                        className="bg-green-500 h-3 rounded"
                        style={{ width: `${(totalReceitas / Math.max(totalReceitas, totalDespesas)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Despesas</span>
                      <span className="font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-3">
                      <div
                        className="bg-red-500 h-3 rounded"
                        style={{ width: `${(totalDespesas / Math.max(totalReceitas, totalDespesas)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA: RECEITAS */}
          {activeTab === 'receitas' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold">Detalhamento de Receitas</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total de {receitas.length} registros
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Ministério</th>
                    <th className="text-right p-3">Valor</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receitas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-gray-500">
                        Nenhuma receita no período
                      </td>
                    </tr>
                  ) : (
                    receitas.map((r) => (
                      <tr key={r.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{r.descricao}</td>
                        <td className="p-3">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {r.tipo}
                          </span>
                        </td>
                        <td className="p-3">{r.ministerio_nome || '—'}</td>
                        <td className="text-right p-3 font-medium">R$ {r.valor.toFixed(2)}</td>
                        <td className="text-center p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-bold
                            ${r.status === 'recebido' ? 'bg-green-100 text-green-800' : ''}
                            ${r.status === 'aberto' ? 'bg-orange-100 text-orange-800' : ''}
                            ${r.status === 'cancelado' ? 'bg-gray-100 text-gray-800' : ''}
                          `}
                          >
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ABA: DESPESAS */}
          {activeTab === 'despesas' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold">Detalhamento de Despesas</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total de {despesas.length} registros
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Descrição</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Fornecedor</th>
                    <th className="text-left p-3">Ministério</th>
                    <th className="text-right p-3">Valor</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-gray-500">
                        Nenhuma despesa no período
                      </td>
                    </tr>
                  ) : (
                    despesas.map((d) => (
                      <tr key={d.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{d.descricao}</td>
                        <td className="p-3">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            {d.tipo}
                          </span>
                        </td>
                        <td className="p-3">{d.fornecedor || '—'}</td>
                        <td className="p-3">{d.ministerio_nome || '—'}</td>
                        <td className="text-right p-3 font-medium">R$ {d.valor.toFixed(2)}</td>
                        <td className="text-center p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-bold
                            ${d.status === 'pago' ? 'bg-green-100 text-green-800' : ''}
                            ${d.status === 'pendente' ? 'bg-orange-100 text-orange-800' : ''}
                            ${d.status === 'cancelado' ? 'bg-gray-100 text-gray-800' : ''}
                          `}
                          >
                            {d.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ABA: MINISTÉRIOS */}
          {activeTab === 'ministerios' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold">Saúde Financeira por Ministério</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Visão do gasto vs. orçamento anual
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Ministério</th>
                    <th className="text-right p-3">Saldo</th>
                    <th className="text-right p-3">Orçamento</th>
                    <th className="text-right p-3">Gasto</th>
                    <th className="text-right p-3">% Utilizado</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ministerios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-gray-500">
                        Nenhum ministério cadastrado
                      </td>
                    </tr>
                  ) : (
                    ministerios.map((m) => (
                      <tr key={m.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{m.nome}</td>
                        <td className="text-right p-3">R$ {m.saldo_atual.toFixed(2)}</td>
                        <td className="text-right p-3">R$ {m.orcamento_anual.toFixed(2)}</td>
                        <td className="text-right p-3">R$ {m.gasto_ano.toFixed(2)}</td>
                        <td className="text-right p-3 font-bold">{m.percentual_utilizado.toFixed(1)}%</td>
                        <td className="text-center p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded font-bold text-white
                            ${m.status === 'verde' ? 'bg-green-500' : ''}
                            ${m.status === 'amarelo' ? 'bg-yellow-500' : ''}
                            ${m.status === 'vermelho' ? 'bg-red-500' : ''}
                          `}
                          >
                            {m.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
