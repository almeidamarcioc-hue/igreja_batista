'use client'

import { useState } from 'react'
import FinanceiroSidebar from '@/components/FinanceiroSidebar'

export default function FinanceiroShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <FinanceiroSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center px-4 h-14"
        style={{ backgroundColor: '#002347', borderBottom: '2px solid #C5A059' }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ color: '#C5A059' }}
          className="text-2xl leading-none mr-3"
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <span style={{ color: '#C5A059' }} className="text-base font-bold tracking-wide">Financeiro IBTM</span>
      </div>

      <main className="md:pl-64 min-h-screen w-full" style={{ backgroundColor: '#f0f2f5' }}>
        <div className="pt-14 md:pt-0 p-6 md:p-8 max-w-full">{children}</div>
      </main>
    </>
  )
}
