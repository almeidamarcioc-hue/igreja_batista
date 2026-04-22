'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pastor } from '@/types'

export default function PastorAppPage() {
  const router = useRouter()
  const [pastores, setPastores] = useState<Pastor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pastores')
      .then((r) => r.json())
      .then((data) => setPastores(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ backgroundColor: '#002347', borderBottom: '3px solid #C5A059' }}
      >
        <img src="/logo.png" alt="IBTM" className="h-9 w-9 rounded-full object-cover" style={{ border: '2px solid #C5A059' }} />
        <div>
          <p style={{ color: '#C5A059' }} className="font-bold text-base leading-tight">Agenda IBTM</p>
          <p className="text-white text-xs opacity-70">Selecione seu nome</p>
        </div>
      </div>

      {/* Lista de pastores */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#002347', borderTopColor: 'transparent' }} />
          </div>
        ) : pastores.length === 0 ? (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold">Nenhum pastor cadastrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pastores</p>
            {pastores.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/pastor/${p.id}`)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-transform"
                style={{ border: '1px solid #e5e7eb' }}
              >
                {p.imagem ? (
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    style={{ border: '2px solid #C5A059' }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xl font-bold"
                    style={{ backgroundColor: '#002347', border: '2px solid #C5A059' }}
                  >
                    {p.nome.charAt(0)}
                  </div>
                )}
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-800 text-base">{p.nome}</p>
                  {p.telefone && <p className="text-sm text-gray-500 mt-0.5">{p.telefone}</p>}
                </div>
                <span className="text-gray-400 text-xl">›</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8 pt-2">
        <p className="text-xs text-gray-400">Igreja Batista Tchê Missionária</p>
      </div>
    </div>
  )
}
