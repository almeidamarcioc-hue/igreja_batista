'use client'

import { useEffect, useState } from 'react'

export default function InitDb() {
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    fetch('/api/init')
      .then(() => setPronto(true))
      .catch(() => setPronto(true))
  }, [])

  if (pronto) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#1F2937',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Jeito de Viver" style={{ height: 80, objectFit: 'contain' }} />
      <p style={{ color: '#E07535', fontSize: 14, fontWeight: 600 }}>Carregando sistema...</p>
    </div>
  )
}
