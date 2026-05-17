'use client'

import { useEffect, useState } from 'react'
import { Salvo, ServoFacilitador } from '@/types'

export default function ConversoesPage() {
  const [salvos, setSalvos] = useState<Salvo[]>([])
  const [servos, setServos] = useState<ServoFacilitador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showServoModal, setShowServoModal] = useState(false)
  const [selectedSalvo, setSelectedSalvo] = useState<Salvo | null>(null)
  const [searchServo, setSearchServo] = useState('')
  const [loadingServo, setLoadingServo] = useState(false)

  const [showNovoModal, setShowNovoModal] = useState(false)
  const [novoFormData, setNovoFormData] = useState({
    nome_responsavel: '',
    data_cadastro: new Date().toISOString().split('T')[0],
    nome: '',
    telefone: '',
    idade: '',
    data_nascimento: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
  })
  const [novoLoading, setNovoLoading] = useState(false)
  const [novoError, setNovoError] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Salvo>>({})

  useEffect(() => {
    const fetchSalvos = async () => {
      try {
        const res = await fetch('/api/conversoes/salvos')
        if (!res.ok) throw new Error('Erro ao carregar salvos')
        const data = await res.json()
        setSalvos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchSalvos()
  }, [])

  const fetchServos = async (query: string) => {
    if (!query.trim()) {
      setServos([])
      return
    }
    setLoadingServo(true)
    try {
      const res = await fetch(`/api/conversoes/servos?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Erro ao buscar servos')
      const data = await res.json()
      setServos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingServo(false)
    }
  }

  const handleAssociarServo = (salvo: Salvo) => {
    setSelectedSalvo(salvo)
    setShowServoModal(true)
    setSearchServo('')
    setServos([])
  }

  const handleConfirmAssociar = async (servo: ServoFacilitador) => {
    console.log('handleConfirmAssociar called', { selectedSalvo, servo })
    if (!selectedSalvo) {
      console.error('selectedSalvo is null')
      return
    }

    try {
      console.log('Fetching API with:', { salvoId: selectedSalvo.id, servoId: servo.id })
      const res = await fetch(`/api/conversoes/salvos/${selectedSalvo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servo_facilitador_id: servo.id,
          data_atribuicao: new Date().toISOString(),
        }),
      })

      console.log('API response:', { ok: res.ok, status: res.status })
      if (!res.ok) throw new Error('Erro ao associar servo')

      setSalvos(prev =>
        prev.map(s =>
          s.id === selectedSalvo.id
            ? { ...s, servo_facilitador_id: servo.id, servo }
            : s
        )
      )

      setShowServoModal(false)
      setSelectedSalvo(null)
      console.log('Servo associado com sucesso')
    } catch (err) {
      console.error('Erro ao associar:', err)
    }
  }

  const handleEdit = (salvo: Salvo) => {
    setEditingId(salvo.id)
    setEditFormData(salvo)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      const res = await fetch(`/api/conversoes/salvos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      if (!res.ok) throw new Error('Erro ao salvar')

      setSalvos(prev =>
        prev.map(s =>
          s.id === editingId ? { ...s, ...editFormData } : s
        )
      )

      setEditingId(null)
      setEditFormData({})
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    try {
      const res = await fetch(`/api/conversoes/salvos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao excluir')

      setSalvos(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveNovo = async (e: React.FormEvent) => {
    e.preventDefault()
    setNovoError('')
    setNovoLoading(true)

    try {
      const dataToSend = {
        ...novoFormData,
        idade: novoFormData.idade ? Number(novoFormData.idade) : null,
      }
      const res = await fetch('/api/conversoes/salvos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Erro ao salvar')
      }

      const newSalvo = await res.json()
      setSalvos(prev => [newSalvo, ...prev])
      setShowNovoModal(false)
      setNovoFormData({
        nome_responsavel: '',
        data_cadastro: new Date().toISOString().split('T')[0],
        nome: '',
        telefone: '',
        idade: '',
        data_nascimento: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
      })
    } catch (err) {
      setNovoError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setNovoLoading(false)
    }
  }

  const precisoDePai = salvos.filter(s => !s.servo_facilitador_id && s.ativo)
  const tenhoUmPai = salvos.filter(s => s.servo_facilitador_id && s.ativo)

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#fff' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>Acompanhamento de Conversões</h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Distribua mentores espirituais aos novos crentes</p>
          </div>
          <button
            onClick={() => setShowNovoModal(true)}
            style={{
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            + Novo Registro
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px 16px', margin: '16px 20px', borderRadius: 6, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Preciso de um Pai/Mãe */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🙏</span> Preciso de um Pai/Mãe ({precisoDePai.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {precisoDePai.length === 0 ? (
                <div style={{ backgroundColor: '#f3f4f6', borderRadius: 8, padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  Nenhum registro pendente
                </div>
              ) : (
                precisoDePai.map(salvo => (
                  <div key={salvo.id} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {editingId === salvo.id ? (
                      <EditForm
                        data={editFormData}
                        onChange={setEditFormData}
                        onSave={handleSaveEdit}
                        onCancel={() => {
                          setEditingId(null)
                          setEditFormData({})
                        }}
                      />
                    ) : (
                      <>
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>{salvo.nome}</h3>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0', whiteSpace: 'pre-wrap' }}>
                          📱 {salvo.telefone}
                          {salvo.idade && <> • {salvo.idade} anos</>}
                        </p>
                        {salvo.endereco && (
                          <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0' }}>
                            📍 {salvo.endereco}, {salvo.numero} {salvo.complemento && `- ${salvo.complemento}`} • {salvo.bairro} • {salvo.cidade}/{salvo.uf}
                          </p>
                        )}
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '8px 0 0 0' }}>
                          Responsável: {salvo.nome_responsavel} • {new Date(salvo.data_cadastro).toLocaleDateString('pt-BR')}
                        </p>

                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button
                            onClick={() => handleAssociarServo(salvo)}
                            style={{
                              flex: 1,
                              backgroundColor: '#10b981',
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
                            ✓ Associar Pai/Mãe
                          </button>
                          <button
                            onClick={() => handleEdit(salvo)}
                            style={{
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
                            onClick={() => handleDelete(salvo.id)}
                            style={{
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
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tenho um Pai/Mãe */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>❤️</span> Tenho um Pai/Mãe ({tenhoUmPai.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tenhoUmPai.length === 0 ? (
                <div style={{ backgroundColor: '#f3f4f6', borderRadius: 8, padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  Nenhum registro
                </div>
              ) : (
                tenhoUmPai.map(salvo => (
                  <div key={salvo.id} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {editingId === salvo.id ? (
                      <EditForm
                        data={editFormData}
                        onChange={setEditFormData}
                        onSave={handleSaveEdit}
                        onCancel={() => {
                          setEditingId(null)
                          setEditFormData({})
                        }}
                      />
                    ) : (
                      <>
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px 0', color: '#1f2937' }}>{salvo.nome}</h3>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0' }}>
                          📱 {salvo.telefone}
                          {salvo.idade && <> • {salvo.idade} anos</>}
                        </p>
                        {salvo.servo && (
                          <p style={{ fontSize: 12, backgroundColor: '#dcfce7', color: '#166534', padding: '6px 8px', borderRadius: 4, margin: '8px 0 0 0', fontWeight: 600 }}>
                            {salvo.servo.genero === 'F' ? '👩‍🏫 Mãe' : '👨‍🏫 Pai'}: {salvo.servo.nome}
                          </p>
                        )}
                        {salvo.endereco && (
                          <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0' }}>
                            📍 {salvo.endereco}, {salvo.numero} {salvo.complemento && `- ${salvo.complemento}`} • {salvo.bairro} • {salvo.cidade}/{salvo.uf}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button
                            onClick={() => handleEdit(salvo)}
                            style={{
                              flex: 1,
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
                            onClick={() => {
                              if (!confirm('Tem certeza que deseja desvincular o Pai/Mãe Espiritual?')) return
                              const res = fetch(`/api/conversoes/salvos/${salvo.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  servo_facilitador_id: null,
                                }),
                              })
                              res.then(r => {
                                if (r.ok) {
                                  setSalvos(prev => prev.map(s =>
                                    s.id === salvo.id
                                      ? { ...s, servo_facilitador_id: null, servo: undefined }
                                      : s
                                  ))
                                }
                              })
                            }}
                            style={{
                              backgroundColor: '#f59e0b',
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
                            🔗 Desvincular
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Associar Servo */}
      {showServoModal && (
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
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px 0', color: '#1f2937' }}>
              Associar Pai/Mãe Espiritual
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px 0' }}>
              {selectedSalvo?.nome}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Buscar Servo Facilitador
              </label>
              <input
                type="text"
                value={searchServo}
                onChange={(e) => {
                  setSearchServo(e.target.value)
                  fetchServos(e.target.value)
                }}
                placeholder="Digite o nome..."
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

            {loadingServo && <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 12 }}>Buscando...</p>}

            {servos.length > 0 && (
              <div style={{ maxHeight: 200, overflow: 'auto', marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 6 }}>
                {servos.map(servo => (
                  <button
                    key={servo.id}
                    onClick={() => {
                      console.log('Button clicked for servo:', servo)
                      handleConfirmAssociar(servo)
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#f9fafb',
                      border: 'none',
                      borderBottom: '1px solid #e5e7eb',
                      padding: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  >
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{servo.nome}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>📱 {servo.telefone}</div>
                  </button>
                ))}
              </div>
            )}

            {searchServo && servos.length === 0 && !loadingServo && (
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, marginBottom: 16 }}>Nenhum servo encontrado</p>
            )}

            <button
              onClick={() => setShowServoModal(false)}
              style={{
                width: '100%',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal Novo Registro */}
      {showNovoModal && (
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
              Novo Registro de Conversão
            </h2>

            {novoError && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
                {novoError}
              </div>
            )}

            <form onSubmit={handleSaveNovo} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Responsável pelo Cadastro *</label>
                <input type="text" value={novoFormData.nome_responsavel} onChange={(e) => setNovoFormData({...novoFormData, nome_responsavel: e.target.value})} required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Data Cadastro *</label>
                <input type="date" value={novoFormData.data_cadastro} onChange={(e) => setNovoFormData({...novoFormData, data_cadastro: e.target.value})} required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Nome do Novo Crente *</label>
                <input type="text" value={novoFormData.nome} onChange={(e) => setNovoFormData({...novoFormData, nome: e.target.value})} required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Telefone *</label>
                <input type="tel" value={novoFormData.telefone} onChange={(e) => setNovoFormData({...novoFormData, telefone: e.target.value})} placeholder="(00) 9 0000-0000" required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Idade (opcional)</label>
                <input type="number" value={novoFormData.idade} onChange={(e) => setNovoFormData({...novoFormData, idade: e.target.value})} min="0" max="150" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Data de Nascimento (opcional)</label>
                <input type="date" value={novoFormData.data_nascimento} onChange={(e) => setNovoFormData({...novoFormData, data_nascimento: e.target.value})} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Endereço (opcional)</label>
                <input type="text" value={novoFormData.endereco} onChange={(e) => setNovoFormData({...novoFormData, endereco: e.target.value})} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Número (opcional)</label>
                  <input type="text" value={novoFormData.numero} onChange={(e) => setNovoFormData({...novoFormData, numero: e.target.value})} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Complemento (opcional)</label>
                  <input type="text" value={novoFormData.complemento} onChange={(e) => setNovoFormData({...novoFormData, complemento: e.target.value})} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Bairro (opcional)</label>
                <input type="text" value={novoFormData.bairro} onChange={(e) => setNovoFormData({...novoFormData, bairro: e.target.value})} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Cidade (opcional)</label>
                  <input type="text" value={novoFormData.cidade} onChange={(e) => setNovoFormData({...novoFormData, cidade: e.target.value})} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>UF (opcional)</label>
                  <input type="text" value={novoFormData.uf} onChange={(e) => setNovoFormData({...novoFormData, uf: e.target.value})} maxLength={2} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="submit" disabled={novoLoading} style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 16px', fontWeight: 700, fontSize: 14, cursor: novoLoading ? 'not-allowed' : 'pointer', opacity: novoLoading ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {novoLoading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setShowNovoModal(false)} style={{ flex: 1, backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, padding: '12px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
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

function EditForm({
  data,
  onChange,
  onSave,
  onCancel,
}: {
  data: Partial<Salvo>
  onChange: (data: Partial<Salvo>) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="text"
        value={data.nome || ''}
        onChange={(e) => onChange({ ...data, nome: e.target.value })}
        placeholder="Nome"
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          padding: '8px 10px',
          fontSize: 12,
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      <input
        type="tel"
        value={data.telefone || ''}
        onChange={(e) => onChange({ ...data, telefone: e.target.value })}
        placeholder="Telefone"
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          padding: '8px 10px',
          fontSize: 12,
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onSave}
          style={{
            flex: 1,
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '8px 10px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ✓ Salvar
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: 4,
            padding: '8px 10px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ✕ Cancelar
        </button>
      </div>
    </div>
  )
}
