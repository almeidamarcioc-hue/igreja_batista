# 🚀 GUIA RÁPIDO - Implementar Frontend em 30 minutos

Este guia mostra exatamente como criar a estrutura de páginas do módulo financeiro.

---

## Passo 1: Criar Layout (5 min)

**Arquivo:** `app/financeiro/layout.tsx`

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${open ? 'w-64' : 'w-20'} bg-slate-800 text-white transition-all duration-300 flex flex-col`}>
        <button
          onClick={() => setOpen(!open)}
          className="p-4 hover:bg-slate-700"
        >
          {open ? '◀' : '▶'}
        </button>

        <nav className="flex-1 space-y-2 p-4">
          <NavLink href="/financeiro" icon="📊" label="Dashboard" open={open} />
          <NavLink href="/financeiro/receitas" icon="⬆️" label="Receitas" open={open} />
          <NavLink href="/financeiro/despesas" icon="⬇️" label="Despesas" open={open} />
          <NavLink href="/financeiro/contas" icon="🏦" label="Contas" open={open} />
          <NavLink href="/financeiro/ministerios" icon="⛪" label="Ministérios" open={open} />
          <NavLink href="/financeiro/relatorios" icon="📈" label="Relatórios" open={open} />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link href="/" className="text-sm hover:bg-slate-700 p-2 block rounded">
            ← Voltar
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">💰 Módulo Financeiro</h1>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, icon, label, open }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded hover:bg-slate-700 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      {open && <span className="text-sm">{label}</span>}
    </Link>
  )
}
```

---

## Passo 2: Dashboard (8 min)

**Arquivo:** `app/financeiro/page.tsx`

```tsx
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

  const { resumo, cobertura_30dias, saude_ministerios, saldo_por_conta } = data

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Saldo Total"
          value={resumo.saldo_total}
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
        <h3 className="text-lg font-bold mb-4">Cobertura 30 Dias</h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-gray-600 text-sm">Diferença</div>
            <div className={`text-3xl font-bold ${cobertura_30dias.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Math.abs(cobertura_30dias.diferenca).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Dias de Caixa</div>
            <div className="text-3xl font-bold text-blue-600">
              {cobertura_30dias.dias_de_caixa}d
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Alertas</div>
            <div className="text-lg">
              {cobertura_30dias.alertas.length === 0 ? '✅ Sem alertas' : `⚠️ ${cobertura_30dias.alertas.length}`}
            </div>
          </div>
        </div>
      </div>

      {/* Ministérios */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Saúde dos Ministérios</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Ministério</th>
              <th className="text-right p-3">Saldo</th>
              <th className="text-right p-3">% Orçamento</th>
              <th className="text-center p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {saude_ministerios.map(m => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{m.nome}</td>
                <td className="text-right p-3">R$ {m.saldo_atual.toFixed(2)}</td>
                <td className="text-right p-3">{m.percentual_utilizado.toFixed(1)}%</td>
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
        <h3 className="text-lg font-bold mb-4">Saldo por Conta</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Conta</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-right p-3">Saldo</th>
              <th className="text-right p-3">Rec. Mês</th>
              <th className="text-right p-3">Pago Mês</th>
            </tr>
          </thead>
          <tbody>
            {saldo_por_conta.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.nome}</td>
                <td className="p-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {c.tipo}
                  </span>
                </td>
                <td className="text-right p-3 font-bold">R$ {c.saldo_atual.toFixed(2)}</td>
                <td className="text-right p-3 text-green-600">R$ {c.recebido_este_mes.toFixed(2)}</td>
                <td className="text-right p-3 text-red-600">R$ {c.pago_este_mes.toFixed(2)}</td>
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
      <div className="text-gray-600 text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold mt-2">
        {typeof value === 'number' ? `R$ ${value.toFixed(2)}` : value}
      </div>
      <div className="text-gray-500 text-xs mt-1">{subtitle}</div>
    </div>
  )
}
```

---

## Passo 3: Página de Receitas (8 min)

**Arquivo:** `app/financeiro/receitas/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RecebitasPage() {
  const [receitas, setReceitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', dataInicio: '', dataFim: '' })

  useEffect(() => {
    carregarReceitas()
  }, [filter])

  const carregarReceitas = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter.status) params.append('status', filter.status)
    if (filter.dataInicio) params.append('dataInicio', filter.dataInicio)
    if (filter.dataFim) params.append('dataFim', filter.dataFim)

    const res = await fetch(`/api/financeiro/contas-receber?${params}`)
    const data = await res.json()
    setReceitas(data)
    setLoading(false)
  }

  const handleStatusChange = async (id: number, novoStatus: string) => {
    const data = novoStatus === 'recebido' 
      ? { status: 'recebido', data_recebimento: new Date().toISOString().split('T')[0] }
      : { status: novoStatus }

    await fetch(`/api/financeiro/contas-receber/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    carregarReceitas()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">📥 Receitas</h2>
        <Link
          href="/financeiro/receitas/nova"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Nova Receita
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">Todos</option>
              <option value="aberto">Aberto</option>
              <option value="recebido">Recebido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <input
              type="date"
              value={filter.dataInicio}
              onChange={(e) => setFilter({ ...filter, dataInicio: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <input
              type="date"
              value={filter.dataFim}
              onChange={(e) => setFilter({ ...filter, dataFim: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : receitas.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Nenhuma receita encontrada</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Descrição</th>
                <th className="text-left p-4 font-medium text-sm">Tipo</th>
                <th className="text-right p-4 font-medium text-sm">Valor</th>
                <th className="text-left p-4 font-medium text-sm">Data Vencimento</th>
                <th className="text-center p-4 font-medium text-sm">Status</th>
                <th className="text-center p-4 font-medium text-sm">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {receitas.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{r.descricao}</td>
                  <td className="p-4 text-sm">{r.tipo}</td>
                  <td className="p-4 text-right font-bold">R$ {r.valor.toFixed(2)}</td>
                  <td className="p-4 text-sm">{new Date(r.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded text-white text-xs font-bold
                      ${r.status === 'aberto' ? 'bg-yellow-500' : ''}
                      ${r.status === 'recebido' ? 'bg-green-500' : ''}
                      ${r.status === 'cancelado' ? 'bg-gray-500' : ''}
                    `}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {r.status === 'aberto' && (
                      <button
                        onClick={() => handleStatusChange(r.id, 'recebido')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Receber
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
```

---

## Passo 4: Página de Nova Receita (5 min)

**Arquivo:** `app/financeiro/receitas/nova/page.tsx`

```tsx
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
          ministério_id: form.ministerio_id ? parseInt(form.ministerio_id) : null,
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
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
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
```

---

## ✨ Padrões de Ícones

```
📊 Dashboard
📥 Receitas  
📤 Despesas
🏦 Contas
⛪ Ministérios
📈 Relatórios
💰 Módulo Financeiro
```

---

## 🔄 Fluxo Implementado

1. **Sidebar** → Layout.tsx
2. **Dashboard** → page.tsx (13 linha)
3. **Receitas** → receitas/page.tsx
4. **Nova Receita** → receitas/nova/page.tsx

Para **Despesas**, **Contas** e **Ministérios** → Copie o padrão de Receitas

---

## ✅ Resultado

Após implementar estes 4 arquivos:
- ✅ Sidebar navegável
- ✅ Dashboard com 4 KPIs
- ✅ Lista de receitas com filtros
- ✅ Formulário funcional
- ✅ Status em tempo real

**Tempo total:** ~30 minutos

---

**Continue com Despesas, Contas e Ministérios usando os mesmos padrões!**

