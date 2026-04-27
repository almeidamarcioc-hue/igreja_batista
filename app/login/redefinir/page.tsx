'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import '../login.css'

export default function RedefinirSenhaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [validando, setValidando] = useState(true)
  const [tokenValido, setTokenValido] = useState(false)
  const [erro, setErro] = useState('')
  const [concluido, setConcluido] = useState(false)

  useEffect(() => {
    if (!token) { setValidando(false); return }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.nome) { setNome(data.nome); setTokenValido(true) }
        else setErro(data.error || 'Link inválido ou expirado.')
      })
      .catch(() => setErro('Erro ao validar o link.'))
      .finally(() => setValidando(false))
  }, [token])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (senha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    setLoading(true); setErro('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, senha }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao redefinir.')
      setConcluido(true)
      setTimeout(() => router.push('/login'), 3000)
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

        {validando ? (
          <p style={{ textAlign: 'center', color: '#6E6E8C', fontSize: 14 }}>Validando link...</p>
        ) : concluido ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 22, color: '#1F1F4D', margin: '0 0 12px' }}>
              Senha redefinida!
            </h2>
            <p style={{ fontSize: 13, color: '#6E6E8C', lineHeight: 1.6, margin: 0 }}>
              Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes.
            </p>
          </div>
        ) : !tokenValido ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 22, color: '#1F1F4D', margin: '0 0 12px' }}>
              Link inválido
            </h2>
            <p style={{ fontSize: 13, color: '#6E6E8C', lineHeight: 1.6, margin: '0 0 24px' }}>
              {erro || 'Este link de redefinição é inválido ou já expirou.'}
            </p>
            <a href="/login/recuperar" style={{ fontSize: 13, color: '#4848A8', textDecoration: 'none' }}>
              Solicitar novo link →
            </a>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 26, margin: '0 0 8px', color: '#1F1F4D' }}>
              Nova <em style={{ fontStyle: 'italic', color: '#4848A8' }}>senha</em>
            </h1>
            <p style={{ fontSize: 13, color: '#6E6E8C', margin: '0 0 24px', lineHeight: 1.5 }}>
              Olá, <strong>{nome}</strong>. Defina sua nova senha abaixo.
            </p>

            {erro && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {erro}
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="ibtm-field-label">Nova senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="ibtm-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="ibtm-field-label">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="ibtm-field"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="ibtm-btn-primary"
                style={{ marginTop: 4 }}
              >
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          </>
        )}

        {!concluido && (
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="/login" style={{ fontSize: 13, color: '#4848A8', textDecoration: 'none' }}>
              ← Voltar ao login
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
