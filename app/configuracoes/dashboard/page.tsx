'use client'

import { useEffect, useState } from 'react'

interface Configuracao {
  imagem_fundo_dashboard: string
}

export default function DashboardConfigPage() {
  const [config, setConfig] = useState<Configuracao>({ imagem_fundo_dashboard: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/configuracoes')
      if (!res.ok) throw new Error('Erro ao carregar configurações')
      const data = await res.json()
      setConfig({ imagem_fundo_dashboard: data.imagem_fundo_dashboard || '' })
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    setErro('')
    setSucesso('')
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao salvar')
      setSucesso('Configuração salva com sucesso!')
      setTimeout(() => setSucesso(''), 3000)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1F1F4D 0%, #2E2E66 100%)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-white text-xl font-bold">Dashboard de Orações</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Configure a aparência do dashboard público</p>
          </div>
          <a href="/configuracoes" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>← Configurações</a>
        </div>

        {/* Messages */}
        {erro && <div className="bg-red-900 border border-red-600 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">{erro}</div>}
        {sucesso && <div className="bg-green-900 border border-green-600 text-green-200 rounded-lg px-4 py-3 mb-4 text-sm">{sucesso}</div>}

        {loading ? (
          <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando...</div>
        ) : (
          <div className="bg-white bg-opacity-10 rounded-xl p-6 space-y-5">

            {/* Imagem de Fundo */}
            <div>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                className="block mb-2">
                Imagem de Fundo do Dashboard
              </label>
              <input
                type="url"
                value={config.imagem_fundo_dashboard}
                onChange={e => setConfig(c => ({ ...c, imagem_fundo_dashboard: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  width: '100%',
                }}
                className="focus:outline-none focus:border-indigo-400"
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
                🙏 Recomendação: Use uma imagem relacionada a oração de joelhos na igreja. A imagem será exibida como fundo do dashboard público.
              </p>
            </div>

            {/* Preview */}
            {config.imagem_fundo_dashboard && (
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  className="block mb-2">
                  Pré-visualização
                </label>
                <div style={{
                  backgroundImage: `url(${config.imagem_fundo_dashboard})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 10,
                  minHeight: 200,
                  border: '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: 20,
                }}>
                  <div style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 8,
                    fontSize: 13,
                    textAlign: 'center',
                  }}>
                    Motivo de Oração
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => load()}
                className="px-4 py-2 rounded-lg border border-gray-400 text-white text-sm font-medium hover:bg-white hover:bg-opacity-10">
                Recarregar
              </button>
              <button onClick={save} disabled={saving || loading}
                style={{ backgroundColor: '#4848A8' }}
                className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
