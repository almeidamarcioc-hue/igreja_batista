'use client'

import './globals.css'
import Sidebar from '@/components/Sidebar'
import InitDb from './InitDb'
import { useState } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="pt-BR">
      <head>
        <title>Secretaria IBTM</title>
        <meta name="description" content="Sistema de Agenda Eclesiástica" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ backgroundColor: '#f0f2f5' }}>
        <InitDb />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile top bar */}
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
          <span style={{ color: '#C5A059' }} className="text-base font-bold tracking-wide">
            Secretaria IBTM
          </span>
        </div>

        <main className="md:pl-64 min-h-screen">
          <div className="pt-14 md:pt-0 p-4 md:p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
