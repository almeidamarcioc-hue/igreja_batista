'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const UserIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const LockIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <path d="M1 1l22 22"/>
  </svg>
)

const CheckIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'ibtm-spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.2-8.55"/>
  </svg>
)

export default function PastorLoginPage() {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [pwd, setPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'warn' } | null>(null)

  const flashToast = useCallback((msg: string, kind: 'ok' | 'warn' = 'ok') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2400)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !pwd) {
      flashToast('Preencha usuário e senha', 'warn')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: user, senha: pwd }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao entrar')
      flashToast(`Bem-vindo, ${data.nome}.`, 'ok')
      // Redireciona direto para agenda dos pastores
      router.push('/pastor/agenda')
    } catch (err: any) {
      flashToast(err?.message || 'Falha ao entrar', 'warn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/ibtm-logo.png" alt="IBTM" style={{ width: 80, height: 80, marginBottom: 12 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 8px 0' }}>Agenda</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Igreja Batista Transformação</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Usuário */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Usuário</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <UserIcon />
              </span>
              <input
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="ex. admin"
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: '12px 46px 12px 46px',
                  fontSize: 14,
                  backgroundColor: '#fff',
                  color: '#1f2937',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#002347'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Senha</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <LockIcon />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: '12px 46px',
                  fontSize: 14,
                  backgroundColor: '#fff',
                  color: '#1f2937',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#002347'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  padding: 0,
                }}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#002347',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <SpinnerIcon /> Entrando...
              </>
            ) : (
              <>
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              left: 20,
              right: 20,
              padding: '12px 16px',
              backgroundColor: toast.kind === 'ok' ? '#10b981' : '#ef4444',
              color: '#fff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 9999,
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {toast.kind === 'ok' && <CheckIcon />}
            {toast.msg}
          </div>
        )}

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes ibtm-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
