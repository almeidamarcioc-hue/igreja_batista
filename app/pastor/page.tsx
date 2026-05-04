'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PastorPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          router.push('/pastor/agenda')
        } else {
          router.push('/pastor/login')
        }
      } catch {
        router.push('/pastor/login')
      }
    }
    checkAuth()
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ color: '#999', fontSize: 14 }}>Carregando...</p>
    </div>
  )
}
