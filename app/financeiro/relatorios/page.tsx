'use client'

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">📈 Relatórios</h2>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-600 mb-4">Relatórios em desenvolvimento</p>
        <div className="space-y-4">
          <div className="p-6 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">📊 Relatório de Receitas</h3>
            <p className="text-sm text-gray-600">Análise detalhada de todas as receitas</p>
          </div>
          <div className="p-6 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">📤 Relatório de Despesas</h3>
            <p className="text-sm text-gray-600">Análise detalhada de todas as despesas</p>
          </div>
          <div className="p-6 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">⛪ Relatório por Ministério</h3>
            <p className="text-sm text-gray-600">Saúde financeira de cada ministério</p>
          </div>
          <div className="p-6 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">💰 Fluxo de Caixa</h3>
            <p className="text-sm text-gray-600">Previsão de caixa para os próximos 90 dias</p>
          </div>
        </div>
      </div>
    </div>
  )
}
