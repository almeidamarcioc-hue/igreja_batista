'use client'

import { useEffect, useState } from 'react'
import { MotivoOracao } from '@/types'

export default function MotivosoriacaoPage() {
  const [motivos, setMotivos] = useState<MotivoOracao[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ motivo: '', data_fim: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMotivos()
  }, [])

  const fetchMotivos = async () => {
    try {
      const res = await fetch('/api/secretaria/motivos-oracao')
      if (!res.ok) throw new Error('Erro ao carregar')
      const data = await res.json()
      setMotivos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.motivo.trim()) {
      setError('Motivo é obrigatório')
      return
    }
    if (!formData.data_fim) {
      setError('Data fim é obrigatória')
      return
    }
    if (formData.motivo.length > 500) {
      setError('Máximo 500 caracteres')
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/secretaria/motivos-oracao/${editingId}` : '/api/secretaria/motivos-oracao'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error)
      }

      setFormData({ motivo: '', data_fim: '' })
      setEditingId(null)
      setShowModal(false)
      fetchMotivos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  const handleEdit = (motivo: MotivoOracao) => {
    setEditingId(motivo.id)
    setFormData({ motivo: motivo.motivo, data_fim: motivo.data_fim })
    setShowModal(true)
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`/api/secretaria/motivos-oracao/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: true }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      fetchMotivos()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este motivo de oração?')) return

    try {
      const res = await fetch(`/api/secretaria/motivos-oracao/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Erro ao excluir')
      fetchMotivos()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Carregando...</div>

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: 'clamp(12px, 4vw, 20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>
              Motivos de Oração
            </h1>
            <p style={{ fontSize: 'clamp(11px, 3vw, 13px)', color: '#6b7280', margin: 0 }}>
              Cadastre motivos de oração para compartilhar
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({ motivo: '', data_fim: '' })
              setShowModal(true)
            }}
            style={{
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: 'clamp(8px, 3vw, 12px) clamp(12px, 4vw, 16px)',
              fontWeight: 600,
              fontSize: 'clamp(12px, 3vw, 14px)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Novo Motivo
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'clamp(12px, 4vw, 20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {motivos.length === 0 ? (
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: 8, padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Nenhum motivo cadastrado
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {motivos.map((motivo) => (
                <div key={motivo.id} style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px 0' }}>
                      {motivo.data_fim}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {motivo.motivo}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleEdit(motivo)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleToggle(motivo.id)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        backgroundColor: motivo.ativo ? '#10b981' : '#9ca3af',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {motivo.ativo ? '✓ Ativo' : '✗ Inativo'}
                    </button>
                    <button
                      onClick={() => handleDelete(motivo.id)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 'clamp(16px, 5vw, 24px)',
            maxWidth: 500,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: '#1f2937' }}>
              {editingId ? 'Editar Motivo' : 'Novo Motivo de Oração'}
            </h2>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                padding: '12px',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Motivo de Oração (máx 500 caracteres) *
                </label>
                <textarea
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Descreva o motivo de oração"
                  required
                  maxLength={500}
                  style={{
                    width: '100%',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    padding: '10px 12px',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                />
                <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0 0' }}>
                  {formData.motivo.length}/500 caracteres
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  Data Fim (Válido até) *
                </label>
                <input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    padding: '10px 12px',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '12px 16px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: 6,
                    padding: '12px 16px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
