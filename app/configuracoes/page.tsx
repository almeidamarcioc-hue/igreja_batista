'use client'

import { useEffect, useState, useCallback } from 'react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Configuracoes, HorarioAtendimento } from '@/types'

type WAStatus = 'nao_configurado' | 'open' | 'close' | 'connecting' | 'error' | 'carregando'

const configVazia: Configuracoes = {
  id: 1,
  horas_lembrete: 24,
  msg_confirmacao: '',
  msg_lembrete: '',
  msg_cancelamento: '',
  msg_remarcacao: '',
  msg_pastor: '',
}

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const horariosDefault: HorarioAtendimento[] = Array.from({ length: 7 }, (_, i) => ({
  dia_semana: i,
  ativo: i >= 1 && i <= 5,
  inicio: '08:00',
  intervalo_inicio: '12:00',
  intervalo_fim: '13:00',
  fim: '18:00',
}))

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Configuracoes>(configVazia)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  // Horários de atendimento
  const [horarios, setHorarios] = useState<HorarioAtendimento[]>(horariosDefault)
  const [salvandoHorarios, setSalvandoHorarios] = useState(false)
  const [sucessoHorarios, setSucessoHorarios] = useState('')

  // WhatsApp connection
  const [waStatus, setWaStatus] = useState<WAStatus>('carregando')
  const [waQR, setWaQR] = useState<string | null>(null)
  const [waCarregandoQR, setWaCarregandoQR] = useState(false)

  const carregar = async () => {
    setLoading(true)
    try {
      const [cfgRes, horRes] = await Promise.all([
        fetch('/api/configuracoes'),
        fetch('/api/horarios'),
      ])
      const cfg = await cfgRes.json()
      const hor = await horRes.json()
      if (cfg && cfg.id) setConfig(cfg)
      if (Array.isArray(hor) && hor.length === 7) setHorarios(hor)
    } catch {
      setErro('Erro ao carregar configurações.')
    } finally {
      setLoading(false)
    }
  }

  const handleSalvarHorarios = async () => {
    setSalvandoHorarios(true)
    setSucessoHorarios('')
    try {
      const res = await fetch('/api/horarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horarios),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setSucessoHorarios('Horários salvos com sucesso!')
      setTimeout(() => setSucessoHorarios(''), 3000)
    } catch {
      setErro('Erro ao salvar horários.')
    } finally {
      setSalvandoHorarios(false)
    }
  }

  const setHorario = (dia: number, campo: keyof HorarioAtendimento, valor: string | boolean | null) => {
    setHorarios(prev => prev.map(h => h.dia_semana === dia ? { ...h, [campo]: valor } : h))
  }

  const verificarStatusWA = useCallback(async () => {
    const res = await fetch('/api/whatsapp/status')
    const data = await res.json()
    setWaStatus(data.status as WAStatus)
    if (data.status === 'open') setWaQR(null)
  }, [])

  const conectarWA = async () => {
    setWaCarregandoQR(true)
    setWaQR(null)
    try {
      const res = await fetch('/api/whatsapp/qrcode')
      const data = await res.json()
      setWaQR(data.qrcode ?? null)
      setWaStatus('connecting')
    } finally {
      setWaCarregandoQR(false)
    }
  }

  // Polling de status quando conectando
  useEffect(() => {
    verificarStatusWA()
  }, [verificarStatusWA])

  useEffect(() => {
    if (waStatus !== 'connecting' && waStatus !== 'carregando') return
    const interval = setInterval(verificarStatusWA, 4000)
    return () => clearInterval(interval)
  }, [waStatus, verificarStatusWA])

  useEffect(() => { carregar() }, [])

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setSucesso('')
    setErro('')
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setSucesso('Configurações salvas com sucesso!')
    } catch {
      setErro('Erro ao salvar configurações.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const inputStyle = { borderColor: '#e5e7eb' }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#C5A059' }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#e5e7eb' }

  return (
    <div>
      <PageHeader icon="⚙️" title="Configurações" subtitle="Lembretes e mensagens do sistema" />

      {erro && <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{erro}</div>}
      {sucesso && <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">{sucesso}</div>}

      {/* Row 1: WhatsApp + Horários de Atendimento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

      {/* Conexão WhatsApp */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 style={{ color: '#002347' }} className="font-bold text-base mb-3">Conexão WhatsApp</h2>

        {waStatus === 'nao_configurado' && (
          <p className="text-sm text-gray-500">Envio automático via WhatsApp não configurado.</p>
        )}

        {waStatus !== 'nao_configurado' && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${waStatus === 'open' ? 'bg-green-500' : waStatus === 'connecting' || waStatus === 'carregando' ? 'bg-yellow-400' : 'bg-red-500'}`} />
              <span className="text-sm font-semibold text-gray-700">
                {waStatus === 'open' ? 'Conectado — mensagens serão enviadas automaticamente' : waStatus === 'connecting' ? 'Conectando... (escaneie o QR Code abaixo)' : waStatus === 'carregando' ? 'Verificando...' : 'Desconectado'}
              </span>
            </div>

            {waStatus !== 'open' && (
              <button
                type="button"
                onClick={conectarWA}
                disabled={waCarregandoQR}
                className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: '#25D366', color: '#fff' }}
              >
                {waCarregandoQR ? 'Gerando QR Code...' : '📱 Conectar WhatsApp'}
              </button>
            )}

            {waStatus === 'open' && (
              <button
                type="button"
                onClick={verificarStatusWA}
                className="text-sm text-gray-500 underline"
              >
                ↻ Verificar
              </button>
            )}
          </div>
        )}

        {waQR && waStatus !== 'open' && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code com o WhatsApp do celular:</p>
            <img src={waQR} alt="QR Code WhatsApp" className="rounded-lg border" style={{ width: 220, height: 220 }} />
            <p className="text-xs text-gray-400 mt-2">Aguardando conexão... O status atualiza automaticamente.</p>
          </div>
        )}
      </div>

      {/* Horários de Atendimento */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ color: '#002347' }} className="font-bold text-base">Horários de Atendimento</h2>
          {sucessoHorarios && <span className="text-green-600 text-xs font-semibold">{sucessoHorarios}</span>}
        </div>

        <div className="space-y-3">
          {horarios.map((h) => (
            <div key={h.dia_semana} className="rounded-xl border p-3" style={{ borderColor: h.ativo ? '#C5A059' : '#e5e7eb', backgroundColor: h.ativo ? '#fffbf0' : '#f9fafb' }}>
              <div className="flex items-center gap-3 mb-2">
                {/* Toggle ativo */}
                <button
                  type="button"
                  onClick={() => setHorario(h.dia_semana, 'ativo', !h.ativo)}
                  className="w-10 h-6 rounded-full transition-colors flex-shrink-0 relative"
                  style={{ backgroundColor: h.ativo ? '#002347' : '#d1d5db' }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: h.ativo ? 'translateX(18px)' : 'translateX(2px)' }}
                  />
                </button>
                <span className="font-bold text-sm w-20 flex-shrink-0" style={{ color: h.ativo ? '#002347' : '#9ca3af' }}>
                  {DIAS_SEMANA[h.dia_semana]}
                </span>
                {!h.ativo && <span className="text-xs text-gray-400">Sem atendimento</span>}
              </div>

              {h.ativo && (
                <div className="space-y-2 pl-13">
                  {/* Turno da manhã / linha principal */}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <label className="text-xs text-gray-500 w-12">Início</label>
                    <input
                      type="time"
                      value={h.inicio}
                      onChange={(e) => setHorario(h.dia_semana, 'inicio', e.target.value)}
                      className="border rounded-lg px-2 py-1 text-sm focus:outline-none"
                      style={{ borderColor: '#e5e7eb', color: '#1a202c' }}
                    />
                    <span className="text-gray-400 text-xs">até</span>
                    <input
                      type="time"
                      value={h.intervalo_inicio ?? h.fim}
                      onChange={(e) => setHorario(h.dia_semana, h.intervalo_inicio !== null ? 'intervalo_inicio' : 'fim', e.target.value)}
                      className="border rounded-lg px-2 py-1 text-sm focus:outline-none"
                      style={{ borderColor: '#e5e7eb', color: '#1a202c' }}
                    />
                  </div>

                  {/* Toggle intervalo */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`intervalo-${h.dia_semana}`}
                      checked={h.intervalo_inicio !== null}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setHorario(h.dia_semana, 'intervalo_inicio', '12:00')
                          setHorario(h.dia_semana, 'intervalo_fim', '13:00')
                        } else {
                          setHorario(h.dia_semana, 'intervalo_inicio', null)
                          setHorario(h.dia_semana, 'intervalo_fim', null)
                        }
                      }}
                      className="rounded"
                      style={{ accentColor: '#002347' }}
                    />
                    <label htmlFor={`intervalo-${h.dia_semana}`} className="text-xs text-gray-600 cursor-pointer">
                      Intervalo / Almoço
                    </label>
                  </div>

                  {/* Turno da tarde */}
                  {h.intervalo_inicio !== null && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <label className="text-xs text-gray-500 w-12">Retorno</label>
                      <input
                        type="time"
                        value={h.intervalo_fim ?? '13:00'}
                        onChange={(e) => setHorario(h.dia_semana, 'intervalo_fim', e.target.value)}
                        className="border rounded-lg px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e5e7eb', color: '#1a202c' }}
                      />
                      <span className="text-gray-400 text-xs">até</span>
                      <input
                        type="time"
                        value={h.fim}
                        onChange={(e) => setHorario(h.dia_semana, 'fim', e.target.value)}
                        className="border rounded-lg px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e5e7eb', color: '#1a202c' }}
                      />
                    </div>
                  )}

                  {/* Sem intervalo: campo fim separado */}
                  {h.intervalo_inicio === null && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <label className="text-xs text-gray-500 w-12">Fim</label>
                      <input
                        type="time"
                        value={h.fim}
                        onChange={(e) => setHorario(h.dia_semana, 'fim', e.target.value)}
                        className="border rounded-lg px-2 py-1 text-sm focus:outline-none"
                        style={{ borderColor: '#e5e7eb', color: '#1a202c' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSalvarHorarios}
          disabled={salvandoHorarios}
          style={{ backgroundColor: '#002347', color: '#fff' }}
          className="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {salvandoHorarios ? 'Salvando...' : '💾 Salvar Horários'}
        </button>
      </div>

      </div>{/* fim grid Row 1 */}

      {/* Row 2: Mensagens — full width, 2 colunas em desktop */}
      <form onSubmit={handleSalvar} className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 style={{ color: '#002347' }} className="font-bold text-base">Configurações de Lembretes</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Horas de antecedência:</label>
            <input
              type="number"
              min={1}
              max={168}
              value={config.horas_lembrete}
              onChange={(e) => setConfig((c) => ({ ...c, horas_lembrete: Number(e.target.value) }))}
              className="w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <span className="text-xs text-gray-400">horas antes</span>
          </div>
        </div>

        <div style={{ borderColor: '#f3f4f6' }} className="border-t pt-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 style={{ color: '#002347' }} className="font-semibold text-sm">Mensagens WhatsApp</h3>
            <p className="text-xs text-gray-400">Variáveis: {'{nome}'}, {'{pastor}'}, {'{data}'}, {'{hora}'}, {'{assunto}'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
            {/* Coluna 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmação de Agendamento</label>
                <textarea value={config.msg_confirmacao} onChange={(e) => setConfig((c) => ({ ...c, msg_confirmacao: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lembrete</label>
                <textarea value={config.msg_lembrete} onChange={(e) => setConfig((c) => ({ ...c, msg_lembrete: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cancelamento</label>
                <textarea value={config.msg_cancelamento} onChange={(e) => setConfig((c) => ({ ...c, msg_cancelamento: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Remarcação</label>
                <textarea value={config.msg_remarcacao} onChange={(e) => setConfig((c) => ({ ...c, msg_remarcacao: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notificação para o Pastor</label>
                <p className="text-xs text-gray-400 mb-1">Variáveis: {'{nome_fiel}'}, {'{telefone}'}, {'{assunto}'}, {'{data}'}, {'{hora}'}</p>
                <textarea value={config.msg_pastor} onChange={(e) => setConfig((c) => ({ ...c, msg_pastor: e.target.value }))} rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={salvando}
          style={{ backgroundColor: '#002347', color: '#fff' }}
          className="w-full mt-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : '💾 Salvar Configurações'}
        </button>
      </form>
    </div>
  )
}

function CopyBox({ text, label }: { text: string; label: string }) {
  const [copiado, setCopiado] = useState(false)
  const copiar = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    })
  }
  return (
    <div className="flex items-center gap-2 mt-1">
      {label && <span className="text-xs text-amber-700 w-14 flex-shrink-0">{label}</span>}
      <div className="flex items-center gap-1 flex-1 bg-amber-50 border border-amber-200 rounded px-2 py-1">
        <code className="text-xs text-amber-900 flex-1 select-all">{text}</code>
        <button
          type="button"
          onClick={copiar}
          className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: copiado ? '#25D366' : '#002347', color: '#fff' }}
        >
          {copiado ? '✓' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
