'use client'

import { useEffect, useState } from 'react'
import { ServoFacilitador } from '@/types'

const UFSLIST = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

export default function ServosPage() {
  const [servos, setServos] = useState<ServoFacilitador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
  })

  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const fetchServos = async () => {
      try {
        const res = await fetch('/api/secretaria/servos-facilitadores')
        if (!res.ok) throw new Error('Erro ao carregar servos')
        const data = await res.json()
        setServos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchServos()
  }, [])

  const handleOpenModal = (servo?: ServoFacilitador) => {
    if (servo) {
      setEditingId(servo.id)
      setFormData({
        nome: servo.nome,
        data_nascimento: servo.data_nascimento,
        telefone: servo.telefone,
        endereco: servo.endereco,
        numero: servo.numero,
        complemento: servo.complemento,
        bairro: servo.bairro,
        cidade: servo.cidade,
        uf: servo.uf,
      })
    } else {
      setEditingId(null)
      setFormData({
        nome: '',
        data_nascimento: '',
        telefone: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
      })
    }
    setFormError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/secretaria/servos-facilitadores/${editingId}` : '/api/secretaria/servos-facilitadores'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Erro ao salvar')
      }

      const data = await res.json()

      if (editingId) {
        setServos(prev => prev.map(s => s.id === editingId ? data : s))
      } else {
        setServos(prev => [data, ...prev])
      }

      handleCloseModal()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    try {
      const res = await fetch(`/api/secretaria/servos-facilitadores/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      setServos(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const filtrados = servos.filter(s =>
    s.nome.toLowerCase().includes(search.toLowerCase()) ||
    s.telefone.includes(search)
  )

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>👨‍🏫 Servos Facilitadores</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Cadastre pais espirituais para acompanhar novos crentes</p>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px 16px', margin: '16px 20px', borderRadius: 6, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              + Novo
            </button>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Nome</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Idade</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Telefone</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Cidade</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                      Nenhum servo encontrado
                    </td>
                  </tr>
                ) : (
                  filtrados.map(servo => (
                    <tr key={servo.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#1f2937', fontWeight: 500 }}>{servo.nome}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{servo.idade ?? '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{servo.telefone}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{servo.cidade || '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13 }}>
                        <button
                          onClick={() => handleOpenModal(servo)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            marginRight: 8,
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(servo.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
            padding: 24,
            maxWidth: 500,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: '#1f2937' }}>
              {editingId ? 'Editar Servo' : 'Novo Servo Facilitador'}
            </h2>

            {formError && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
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

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Data de Nascimento *</label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={formData.data_nascimento}
                  onChange={handleChange}
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

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 9 0000-0000"
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

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Rua</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
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
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Complemento</label>
                  <input
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
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
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>UF</label>
                  <select
                    name="uf"
                    value={formData.uf}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      padding: '10px 12px',
                      fontSize: 13,
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="">—</option>
                    {UFSLIST.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    flex: 1,
                    backgroundColor: '#C5A059',
                    color: '#002347',
                    border: 'none',
                    borderRadius: 6,
                    padding: '12px 16px',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                    opacity: formLoading ? 0.7 : 1,
                    fontFamily: 'inherit',
                  }}
                >
                  {formLoading ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
