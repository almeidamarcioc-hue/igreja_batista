'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function ConversoesPage() {
  useEffect(() => {
    redirect('/conversoes/painel')
  }, [])

  return null
}
