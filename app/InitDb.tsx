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
        background: 'linear-gradient(135deg, #1F1F4D 0%, #2E2E66 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ibtm-logo.png" alt="IBTM" style={{ height: 80, objectFit: 'contain' }} />
      <p style={{ color: '#C5A059', fontSize: 14, fontWeight: 600, letterSpacing: '0.06em' }}>Carregando Workspace IBTM...</p>
    </div>
  )
}
