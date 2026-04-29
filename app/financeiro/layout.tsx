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
