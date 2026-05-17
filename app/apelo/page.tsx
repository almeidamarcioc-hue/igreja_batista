'use client'

import { useState } from 'react'

const UFSLIST = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

export default function ApeloPage() {
  const [formData, setFormData] = useState({
    nome_responsavel: '',
    data_cadastro: new Date().toISOString().split('T')[0],
    nome: '',
    telefone: '',
    idade: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/apelo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Erro ao salvar')
      }

      setSuccess(true)
      setFormData({
        nome_responsavel: '',
        data_cadastro: new Date().toISOString().split('T')[0],
        nome: '',
        telefone: '',
        idade: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>✝️ Apelo de Conversão</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Registro de quem aceita Jesus como Salvador</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {success && (
            <div style={{ backgroundColor: '#dcfce7', border: '1px solid #22c55e', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
              ✓ Dados salvos com sucesso!
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {/* Seção: Responsável */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '0 0 12px 0', textTransform: 'uppercase' }}>Responsável pela Informação</h3>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Nome *</label>
                <input type="text" name="nome_responsavel" value={formData.nome_responsavel} onChange={handleChange} required
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Data do Cadastro *</label>
                <input type="date" name="data_cadastro" value={formData.data_cadastro} onChange={handleChange} required
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {/* Seção: Dados da Pessoa Salva */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '16px 0 12px 0', textTransform: 'uppercase' }}>Dados do Novo Crente</h3>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Nome *</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Telefone/WhatsApp *</label>
                <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 9 0000-0000" required
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Idade (opcional)</label>
                <input type="number" name="idade" value={formData.idade} onChange={handleChange} min="0" max="150"
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {/* Seção: Endereço */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '16px 0 12px 0', textTransform: 'uppercase' }}>Endereço (Opcional)</h3>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Rua</label>
                <input type="text" name="endereco" value={formData.endereco} onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Número</label>
                  <input type="text" name="numero" value={formData.numero} onChange={handleChange}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Complemento</label>
                  <input type="text" name="complemento" value={formData.complemento} onChange={handleChange}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Bairro</label>
                <input type="text" name="bairro" value={formData.bairro} onChange={handleChange}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Cidade</label>
                  <input type="text" name="cidade" value={formData.cidade} onChange={handleChange}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>UF</label>
                  <select name="uf" value={formData.uf} onChange={handleChange}
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}>
                    <option value="">—</option>
                    {UFSLIST.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Botão */}
              <button type="submit" disabled={loading} style={{ backgroundColor: '#C5A059', color: '#002347', border: 'none', borderRadius: 6, padding: '12px 16px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', marginTop: 8 }}>
                {loading ? '⏳ Salvando...' : '💾 Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
