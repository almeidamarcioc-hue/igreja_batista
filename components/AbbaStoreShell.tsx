'use client'

import { useState } from 'react'

export default function AbbaStoreShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center px-4 h-14"
        style={{ backgroundColor: '#1F3A93', borderBottom: '2px solid #3B82F6' }}
      >
        <span style={{ color: '#3B82F6' }} className="text-base font-bold tracking-wide">Abba Store</span>
      </div>

      <main className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
        <div className="pt-14 md:pt-0 p-4 md:p-6">{children}</div>
      </main>
    </>
  )
}
