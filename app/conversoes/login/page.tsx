'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConversoesLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ usuario: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Erro ao fazer login')
      }

      router.push('/conversoes/painel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: '#002347' }}>Conversões</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Acompanhamento de novos crentes</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px 16px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Usuário</label>
            <input
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              required
              autoFocus
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Senha</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#C5A059',
              color: '#002347',
              border: 'none',
              borderRadius: 6,
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
