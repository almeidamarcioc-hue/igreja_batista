'use client'

import { useEffect, useState } from 'react'

export default function FinanceiroDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/financeiro/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-10">Carregando...</div>
  if (!data) return <div className="text-center py-10 text-red-600">Erro ao carregar</div>

  const { saldo_por_conta, cobertura_30dias, saude_ministerios } = data

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Saldo Total"
          value={saldo_por_conta.reduce((acc: number, c: any) => acc + c.saldo_atual, 0)}
          subtitle="Todas as contas"
        />
        <KPICard
          title="Entrada 30d"
          value={cobertura_30dias.entrada_esperada_30d}
          subtitle="Esperada"
        />
        <KPICard
          title="Saída 30d"
          value={cobertura_30dias.saida_esperada_30d}
          subtitle="Esperada"
        />
        <KPICard
          title="Status"
          value={cobertura_30dias.cobertura_ok ? '✅ OK' : '⚠️ ALERTA'}
          subtitle={`${cobertura_30dias.dias_de_caixa} dias`}
        />
      </div>

      {/* Cobertura */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Cobertura 30 Dias</h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-gray-900 text-sm">Diferença</div>
            <div className={`text-3xl font-bold ${cobertura_30dias.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Math.abs(Number(cobertura_30dias.diferenca)).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-900 text-sm">Dias de Caixa</div>
            <div className="text-3xl font-bold text-blue-600">
              {cobertura_30dias.dias_de_caixa}d
            </div>
          </div>
          <div>
            <div className="text-gray-900 text-sm">Alertas</div>
            <div className="text-lg text-gray-900">
              {cobertura_30dias.alertas.length === 0 ? '✅ Sem alertas' : `⚠️ ${cobertura_30dias.alertas.length}`}
            </div>
          </div>
        </div>
      </div>

      {/* Ministérios */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Saúde dos Ministérios</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-gray-900">Ministério</th>
              <th className="text-right p-3 text-gray-900">Saldo</th>
              <th className="text-right p-3 text-gray-900">% Orçamento</th>
              <th className="text-center p-3 text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {saude_ministerios.map((m: any) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{m.nome}</td>
                <td className="text-right p-3 text-gray-900">R$ {Number(m.saldo_atual).toFixed(2)}</td>
                <td className="text-right p-3 text-gray-900">{Number(m.percentual_utilizado).toFixed(1)}%</td>
                <td className="text-center p-3">
                  <span className={`px-3 py-1 rounded text-white text-xs font-bold
                    ${m.status === 'verde' ? 'bg-green-500' : ''}
                    ${m.status === 'amarelo' ? 'bg-yellow-500' : ''}
                    ${m.status === 'vermelho' ? 'bg-red-500' : ''}
                  `}>
                    {m.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Saldo por Conta</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-gray-900">Conta</th>
              <th className="text-left p-3 text-gray-900">Tipo</th>
              <th className="text-right p-3 text-gray-900">Saldo</th>
              <th className="text-right p-3 text-gray-900">Rec. Mês</th>
              <th className="text-right p-3 text-gray-900">Pago Mês</th>
            </tr>
          </thead>
          <tbody>
            {saldo_por_conta.map((c: any) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{c.nome}</td>
                <td className="p-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {c.tipo}
                  </span>
                </td>
                <td className="text-right p-3 font-bold text-gray-900">R$ {Number(c.saldo_atual).toFixed(2)}</td>
                <td className="text-right p-3 text-green-600">R$ {Number(c.recebido_este_mes).toFixed(2)}</td>
                <td className="text-right p-3 text-red-600">R$ {Number(c.pago_este_mes).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KPICard({ title, value, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
      <div className="text-gray-900 text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold mt-2 text-gray-900">
        {typeof value === 'number' ? `R$ ${Number(value).toFixed(2)}` : value}
      </div>
      <div className="text-gray-700 text-xs mt-1">{subtitle}</div>
    </div>
  )
}
