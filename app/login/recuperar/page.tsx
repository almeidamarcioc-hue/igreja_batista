'use client'

import { useState } from 'react'
import '../login.css'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setErro('Informe o e-mail cadastrado.'); return }
    setLoading(true); setErro('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao enviar.')
      setEnviado(true)
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #1F1F4D 0%, #2E2E66 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#FAFAF7', borderRadius: 16, padding: '40px 36px',
        width: '100%', maxWidth: 420, boxShadow: '0 24px 48px rgba(0,0,0,.18)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ibtm-logo.png" alt="IBTM" style={{ height: 56, objectFit: 'contain' }} />
          <p style={{ margin: '8px 0 0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6E6E8C' }}>
            Igreja Batista Transformação
          </p>
        </div>

        {!enviado ? (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 26, margin: '0 0 8px', color: '#1F1F4D' }}>
              Recuperar <em style={{ fontStyle: 'italic', color: '#4848A8' }}>senha</em>
            </h1>
            <p style={{ fontSize: 13, color: '#6E6E8C', margin: '0 0 24px', lineHeight: 1.5 }}>
              Informe o e-mail cadastrado na sua conta. Enviaremos um link para criar uma nova senha.
            </p>

            {erro && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {erro}
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="ibtm-field-label">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="ibtm-field"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="ibtm-btn-primary"
                style={{ marginTop: 4 }}
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 22, color: '#1F1F4D', margin: '0 0 12px' }}>
              E-mail enviado
            </h2>
            <p style={{ fontSize: 13, color: '#6E6E8C', lineHeight: 1.6, margin: '0 0 24px' }}>
              Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá um e-mail com o link para redefinir a senha em instantes.
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              Verifique também a caixa de spam.
            </p>
          </div>
        )}

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <a href="/login" style={{ fontSize: 13, color: '#4848A8', textDecoration: 'none' }}>
            ← Voltar ao login
          </a>
        </div>
      </div>
    </div>
  )
}
