'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const PUBLIC_PATHS = ['/login']

export default function ShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) router.replace('/login') })
      .catch(() => router.replace('/login'))
  }, [pathname, router])

  return <>{children}</>
}
