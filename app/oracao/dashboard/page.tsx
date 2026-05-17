'use client'

import { useEffect, useState } from 'react'

interface MotivoOracao {
  id: number
  motivo: string
  data_fim: string
}

export default function OracaoDashboard() {
  const [motivos, setMotivos] = useState<MotivoOracao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const res = await fetch('/api/oracao/motivos')
        if (!res.ok) throw new Error('Erro ao carregar motivos')
        const data = await res.json()
        setMotivos(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMotivos()
    const interval = setInterval(fetchMotivos, 60000) // Atualizar a cada 1 minuto
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1F1F4D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fff', fontSize: '2rem' }}>Carregando motivos de oração...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1F1F4D 0%, #2E2E66 50%, #1a1a4d 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
          }}>
            🙏 Motivos de Oração
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
          }}>
            Igreja Batista Transformação
          </p>
        </div>

        {/* Motivos Grid */}
        {motivos.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '2px solid rgba(255,255,255,0.1)',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            }}>
              Não há motivos de oração ativos no momento.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2rem)',
          }}>
            {motivos.map((motivo) => (
              <div
                key={motivo.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderLeft: '4px solid #6366F1',
                  borderRadius: '12px',
                  padding: 'clamp(1.5rem, 4vw, 2rem)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <p style={{
                  color: '#fff',
                  fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.6,
                  textAlign: 'center',
                }}>
                  {motivo.motivo}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
          }}>
            Atualizado em: {new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}
