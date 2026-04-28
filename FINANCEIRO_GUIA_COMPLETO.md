# 📚 Guia Completo - Módulo Financeiro Igreja Batista

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO FINANCEIRO                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (React Components)                                      │
│  ├─ Dashboard (KPIs, Gráficos)                                  │
│  ├─ Cadastros (Ministérios, Contas)                             │
│  ├─ Movimentações (Receitas, Despesas)                          │
│  └─ Relatórios (Saúde Financeira)                               │
│                    ↓ (API Calls)                                 │
│  Backend (Next.js API Routes)                                    │
│  ├─ /api/financeiro/ministerios                                 │
│  ├─ /api/financeiro/contas                                      │
│  ├─ /api/financeiro/contas-receber                              │
│  ├─ /api/financeiro/contas-pagar                                │
│  └─ /api/financeiro/dashboard                                   │
│                    ↓                                              │
│  Functions (lib/financeiro.ts)                                   │
│  ├─ CRUD Operations                                             │
│  ├─ Cálculos de Saldo                                           │
│  ├─ Dashboard Queries                                           │
│  └─ Auditoria (Histórico)                                       │
│                    ↓                                              │
│  Database (PostgreSQL)                                           │
│  ├─ ministerios                                                 │
│  ├─ contas                                                      │
│  ├─ contas_receber                                              │
│  ├─ contas_pagar                                                │
│  └─ historico_saldo                                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Arquivos Criada

```
lib/
  └─ financeiro.ts          ← Funções CRUD + Dashboard
app/api/financeiro/
  ├─ ministerios/
  │  ├─ route.ts             ← GET, POST
  │  └─ [id]/route.ts        ← GET, PUT, DELETE
  ├─ contas/
  │  ├─ route.ts             ← GET, POST
  │  └─ [id]/route.ts        ← GET, PUT, DELETE
  ├─ contas-receber/
  │  ├─ route.ts             ← GET, POST
  │  └─ [id]/route.ts        ← GET, PUT, DELETE
  ├─ contas-pagar/
  │  ├─ route.ts             ← GET, POST
  │  └─ [id]/route.ts        ← GET, PUT, DELETE
  └─ dashboard/
     └─ route.ts             ← GET (dados consolidados)
types/
  └─ index.ts               ← Tipos TypeScript (adicionados)
```

---

## 📈 Fluxos de Dados

### Fluxo 1: Registrar Dízimo/Oferta
```
1. Usuário acessa: /financeiro/receitas
2. Clica "Novo Recebimento"
3. Preenche: Descrição, Tipo, Valor, Data Vencimento
4. Clica "Salvar"
   ↓
5. POST /api/financeiro/contas-receber
   ├─ Valida dados
   ├─ Insere em contas_receber (status='aberto')
   └─ Retorna ID da conta
6. Ao receber:
   ├─ Clica "Registrar Recebimento"
   ├─ PUT /api/financeiro/contas-receber/[id]
   ├─ Atualiza: status='recebido', data_recebimento
   ├─ Trigger: Atualiza contas.saldo_atual
   ├─ Trigger: Insere em historico_saldo
   └─ Dashboard reflete mudança em tempo real
```

### Fluxo 2: Registrar Despesa
```
1. Usuário acessa: /financeiro/despesas
2. Clica "Nova Despesa"
3. Preenche: Descrição, Tipo, Fornecedor, Valor, Data Vencimento
4. Clica "Salvar"
   ↓
5. POST /api/financeiro/contas-pagar
   ├─ Valida dados
   ├─ Insere em contas_pagar (status='pendente')
   └─ Retorna ID da conta
6. Ao pagar:
   ├─ Clica "Registrar Pagamento"
   ├─ PUT /api/financeiro/contas-pagar/[id]
   ├─ Atualiza: status='pago', data_pagamento
   ├─ Trigger: Atualiza contas.saldo_atual
   ├─ Trigger: Insere em historico_saldo
   └─ Dashboard reflete mudança
```

### Fluxo 3: Visualizar Dashboard
```
1. Usuário acessa: /financeiro
2. Componente: <FinanceiroDashboard />
   ├─ useEffect(() => { fetch('/api/financeiro/dashboard') })
   ├─ Recebe:
   │  ├─ resumo.saldo_total
   │  ├─ resumo.recebido_este_mes
   │  ├─ cobertura_30dias
   │  └─ saude_ministerios[]
   └─ Renderiza:
      ├─ Caixas de KPI (Saldo, Entrada, Saída)
      ├─ Gráfico de Cobertura
      ├─ Tabela de Ministérios
      └─ Alertas (se houver déficit)
```

---

## 🎨 Componentes Frontend (Exemplo)

### 1️⃣ Dashboard Principal
```tsx
'use client'

import { useEffect, useState } from 'react'
import { Cobertura30Dias, SaudeMinisterio } from '@/types'

export default function FinanceiroDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch_data = async () => {
      const res = await fetch('/api/financeiro/dashboard')
      const data = await res.json()
      setDashboard(data)
      setLoading(false)
    }
    fetch_data()
  }, [])

  if (loading) return <div>Carregando...</div>
  if (!dashboard) return <div>Erro ao carregar</div>

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard
          title="Saldo Total"
          value={dashboard.resumo.saldo_total}
          type="currency"
          trend="up"
        />
        <KPICard
          title="Entrada 30d"
          value={dashboard.cobertura_30dias.entrada_esperada_30d}
          type="currency"
          trend="up"
        />
        <KPICard
          title="Saída 30d"
          value={dashboard.cobertura_30dias.saida_esperada_30d}
          type="currency"
          trend="down"
        />
      </div>

      {/* Cobertura */}
      <CoberturaCard cobertura={dashboard.cobertura_30dias} />

      {/* Saúde por Ministério */}
      <MinisteriosTable ministerios={dashboard.saude_ministerios} />

      {/* Saldo por Conta */}
      <ContasTable contas={dashboard.saldo_por_conta} />
    </div>
  )
}

// Componentes auxiliares
function KPICard({ title, value, type, trend }: any) {
  const formatted = type === 'currency' ? `R$ ${value.toFixed(2)}` : value
  const icon = trend === 'up' ? '📈' : '📉'
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-2">{formatted}</div>
      <div className="text-lg mt-1">{icon}</div>
    </div>
  )
}

function CoberturaCard({ cobertura }: { cobertura: Cobertura30Dias }) {
  const status = cobertura.cobertura_ok ? '✅ OK' : '⚠️ ATENÇÃO'
  const statusColor = cobertura.cobertura_ok ? 'text-green-600' : 'text-red-600'
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
      <h3 className="text-lg font-bold mb-4">Cobertura 30 Dias</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="text-gray-600">Entrada</div>
          <div className="text-xl font-bold">R$ {cobertura.entrada_esperada_30d.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600">Saída</div>
          <div className="text-xl font-bold">R$ {cobertura.saida_esperada_30d.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600">Diferença</div>
          <div className={`text-xl font-bold ${statusColor}`}>
            R$ {cobertura.diferenca.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Status</div>
          <div className={`text-xl font-bold ${statusColor}`}>{status}</div>
        </div>
      </div>
      {cobertura.alertas.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          {cobertura.alertas.map((alerta, i) => (
            <div key={i} className="text-yellow-800">{alerta}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function MinisteriosTable({ ministerios }: { ministerios: SaudeMinisterio[] }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
      <h3 className="text-lg font-bold mb-4">Saúde dos Ministérios</h3>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Ministério</th>
            <th className="text-right p-2">Saldo</th>
            <th className="text-right p-2">Orçamento</th>
            <th className="text-right p-2">Gasto</th>
            <th className="text-right p-2">% Usado</th>
            <th className="text-center p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {ministerios.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2">{m.nome}</td>
              <td className="text-right p-2">R$ {m.saldo_atual.toFixed(2)}</td>
              <td className="text-right p-2">R$ {m.orcamento_anual.toFixed(2)}</td>
              <td className="text-right p-2">R$ {m.gasto_ano.toFixed(2)}</td>
              <td className="text-right p-2">{m.percentual_utilizado.toFixed(1)}%</td>
              <td className="text-center p-2">
                <span className={`px-2 py-1 rounded text-white text-xs font-bold
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
  )
}

function ContasTable({ contas }: { contas: any[] }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow">
      <h3 className="text-lg font-bold mb-4">Saldo por Conta</h3>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Conta</th>
            <th className="text-left p-2">Tipo</th>
            <th className="text-right p-2">Saldo Atual</th>
            <th className="text-right p-2">Rec. Mês</th>
            <th className="text-right p-2">Pago Mês</th>
          </tr>
        </thead>
        <tbody>
          {contas.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2 font-medium">{c.nome}</td>
              <td className="p-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {c.tipo}
                </span>
              </td>
              <td className="text-right p-2 font-bold">R$ {c.saldo_atual.toFixed(2)}</td>
              <td className="text-right p-2 text-green-600">R$ {c.recebido_este_mes.toFixed(2)}</td>
              <td className="text-right p-2 text-red-600">R$ {c.pago_este_mes.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 2️⃣ Formulário de Nova Receita
```tsx
'use client'

import { useState } from 'react'
import { Ministerio, Conta } from '@/types'

interface NovaReceitaProps {
  ministerios: Ministerio[]
  contas: Conta[]
  onSave?: () => void
}

export default function NovaReceita({ ministerios, contas, onSave }: NovaReceitaProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    descricao: '',
    tipo: 'dizimo' as const,
    ministerio_id: undefined as number | undefined,
    conta_id: contas[0]?.id || 0,
    valor: 0,
    data_vencimento: new Date().toISOString().split('T')[0],
    forma_pagamento: 'pix',
    observacoes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/financeiro/contas-receber', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Erro ao criar receita')

      alert('Receita criada com sucesso!')
      setForm({
        descricao: '',
        tipo: 'dizimo',
        ministerio_id: undefined,
        conta_id: contas[0]?.id || 0,
        valor: 0,
        data_vencimento: new Date().toISOString().split('T')[0],
        forma_pagamento: 'pix',
        observacoes: '',
      })

      onSave?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-bold">Nova Receita</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <input
          type="text"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="dizimo">Dízimo</option>
            <option value="oferta">Oferta</option>
            <option value="doacao">Doação</option>
            <option value="evento">Evento</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ministério</label>
          <select
            name="ministerio_id"
            value={form.ministerio_id || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Nenhum</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Valor</label>
          <input
            type="number"
            name="valor"
            value={form.valor}
            onChange={handleChange}
            step="0.01"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data Vencimento</label>
          <input
            type="date"
            name="data_vencimento"
            value={form.data_vencimento}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Conta</label>
          <select
            name="conta_id"
            value={form.conta_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Forma Pagamento</label>
          <select
            name="forma_pagamento"
            value={form.forma_pagamento}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="transferencia">Transferência</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea
          name="observacoes"
          value={form.observacoes}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      {error && <div className="p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar Receita'}
      </button>
    </form>
  )
}
```

---

## 🚀 Próximos Passos para Implementação

### Fase 1 ✅ (Concluída)
- ✅ Tabelas de banco de dados
- ✅ Tipos TypeScript
- ✅ Funções CRUD (lib/financeiro.ts)
- ✅ Endpoints da API

### Fase 2 (Próxima)
- ⬜ Página `app/financeiro/` (layout e sidebar)
- ⬜ Página `app/financeiro/page.tsx` (Dashboard)
- ⬜ Página `app/financeiro/receitas/` (Contas a Receber)
- ⬜ Página `app/financeiro/despesas/` (Contas a Pagar)
- ⬜ Página `app/financeiro/contas/` (Cadastro de Contas)
- ⬜ Página `app/financeiro/ministerios/` (Cadastro de Ministérios)

### Fase 3
- ⬜ Triggers PostgreSQL (atualizar saldo_atual automaticamente)
- ⬜ Relatórios avançados (PDF)
- ⬜ Integração com gráficos (Chart.js ou Recharts)
- ⬜ Notificações de alertas
- ⬜ Exportar dados (CSV, Excel)

### Fase 4
- ⬜ Melhorias de UX/UI
- ⬜ Testes automatizados
- ⬜ Performance tuning
- ⬜ Backup/Archiving

---

## 📞 Suporte

Para dúvidas sobre implementação, consulte:
1. `FINANCEIRO_ESPECIFICACAO.md` - Fórmulas e estrutura
2. `FINANCEIRO_ENDPOINTS.md` - API endpoints
3. `lib/financeiro.ts` - Funções disponíveis
