'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface NavItem { href: string; icon: string; label: string }
interface NavGroup { icon: string; label: string; children: NavItem[] }
type NavEntry = NavItem | NavGroup

const navEntries: NavEntry[] = [
  { href: '/financeiro', icon: '📊', label: 'Dashboard' },
  {
    icon: '📋',
    label: 'Lançamentos',
    children: [
      { href: '/financeiro/receitas', icon: '⬆️', label: 'Receitas' },
      { href: '/financeiro/despesas', icon: '⬇️', label: 'Despesas' },
    ],
  },
  {
    icon: '📁',
    label: 'Cadastros',
    children: [
      { href: '/financeiro/contas', icon: '🏦', label: 'Contas' },
      { href: '/financeiro/ministerios', icon: '⛪', label: 'Ministérios' },
    ],
  },
  { href: '/financeiro/relatorios', icon: '📈', label: 'Relatórios' },
]

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

export default function FinanceiroSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const [now, setNow] = useState<Date | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [groupsOpen, setGroupsOpen] = useState<{ [key: string]: boolean }>({
    Lançamentos: pathname.startsWith('/financeiro/receitas') || pathname.startsWith('/financeiro/despesas'),
    Cadastros: pathname.startsWith('/financeiro/contas') || pathname.startsWith('/financeiro/ministerios'),
  })

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setGroupsOpen({
      Lançamentos: pathname.startsWith('/financeiro/receitas') || pathname.startsWith('/financeiro/despesas'),
      Cadastros: pathname.startsWith('/financeiro/contas') || pathname.startsWith('/financeiro/ministerios'),
    })
  }, [pathname])

  const toggleGroup = (label: string) => {
    setGroupsOpen(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const dd = now ? String(now.getDate()).padStart(2, '0') : '--'
  const mm = now ? String(now.getMonth() + 1).padStart(2, '0') : '--'
  const yyyy = now ? now.getFullYear() : '----'
  const hh = now ? String(now.getHours()).padStart(2, '0') : '--'
  const min = now ? String(now.getMinutes()).padStart(2, '0') : '--'

  const sidebar = (
    <aside style={{ backgroundColor: '#002347', borderRight: '2px solid #C5A059' }} className="flex flex-col h-full w-64">
      <div className="flex items-center justify-center py-6 px-4">
        {!logoError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/ibtm-logo.png" alt="IBTM" width={120} style={{ maxHeight: 64, objectFit: 'contain' }} onError={() => setLogoError(true)} />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl">💰</span>
            <span style={{ color: '#C5A059' }} className="text-xl font-bold tracking-widest">IBTM</span>
          </div>
        )}
      </div>

      <div style={{ borderColor: '#C5A059' }} className="border-t mx-4 opacity-40" />

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navEntries.map((entry) => {
          if (isGroup(entry)) {
            const childActive = entry.children.some((c) => pathname.startsWith(c.href))
            const isOpen = groupsOpen[entry.label]
            return (
              <div key={entry.label} className="mb-4">
                <button
                  onClick={() => toggleGroup(entry.label)}
                  style={childActive ? { color: '#C5A059' } : { color: '#e8e8e8' }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-150 hover:text-yellow-400"
                >
                  <span className="text-base leading-none">{entry.icon}</span>
                  <span className="flex-1 text-left">{entry.label}</span>
                  <span className="text-xs opacity-60">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="pl-4 mb-1">
                    {entry.children.map((child) => {
                      const active = pathname.startsWith(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          style={active ? { color: '#C5A059', backgroundColor: 'rgba(197,160,89,0.15)' } : { color: '#e8e8e8' }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 hover:text-yellow-400"
                        >
                          <span className="text-sm leading-none">{child.icon}</span>
                          <span>{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const active = pathname === entry.href
          return (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={onClose}
              style={active ? { color: '#C5A059', backgroundColor: 'rgba(197,160,89,0.15)' } : { color: '#e8e8e8' }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-150 hover:text-yellow-400"
            >
              <span className="text-base leading-none">{entry.icon}</span>
              <span>{entry.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ borderColor: '#C5A059' }} className="border-t mx-4 opacity-40" />

      <div className="px-4 py-4 text-center">
        <p style={{ color: '#C5A059' }} className="text-xs font-semibold">{dd}/{mm}/{yyyy}</p>
        <p style={{ color: '#d0d0d0' }} className="text-xs mt-1">{hh}:{min}</p>
        <div className="flex gap-3 justify-center mt-3">
          <Link href="/" style={{ color: '#C5A059' }} className="text-xs hover:underline">← Voltar</Link>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-50">{sidebar}</div>
      {open && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />
          <div className="fixed top-0 left-0 h-full w-64 z-50 md:hidden">{sidebar}</div>
        </>
      )}
    </>
  )
}
