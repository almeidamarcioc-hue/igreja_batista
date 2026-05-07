'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import Badge from '@/components/Badge'
import { Pastor, Slot, Configuracoes } from '@/types'
import { preencherTemplate, abrirWhatsApp as waOpen } from '@/lib/whatsapp'

const DIAS_SEMANA_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const HORAS_DIA = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth() + 1, 0) }

function formatDateLabel(d: Date, view: string): string {
  if (view === 'mensal') return `${MESES_PT[d.getMonth()]} ${d.getFullYear()}`
  if (view === 'semanal') {
    const ini = startOfMonth(d); const fim = endOfMonth(d)
    return `${String(ini.getDate()).padStart(2,'0')}/${String(ini.getMonth()+1).padStart(2,'0')} – ${String(fim.getDate()).padStart(2,'0')}/${String(fim.getMonth()+1).padStart(2,'0')}/${fim.getFullYear()}`
  }
  return `${DIAS_SEMANA_PT[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

function navigate(current: Date, view: string, dir: number): Date {
  const d = new Date(current)
  if (view === 'mensal') d.setMonth(d.getMonth() + dir)
  else if (view === 'semanal') d.setDate(d.getDate() + dir * 7)
  else d.setDate(d.getDate() + dir)
  return d
}

function slotColor(tipo: string) {
  if (tipo === 'confirmado') return { bg: '#dcfce7', border: '#22c55e', text: '#166534' }
  if (tipo === 'pendente') return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }
  if (tipo === 'bloqueado') return { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' }
  return { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' }
}

export default function PastorAgendaPage() {
  const router = useRouter()
  const [pastores, setPastores] = useState<Pastor[]>([])
  const [pastorId, setPastorId] = useState<number | null>(null)
  const [config, setConfig] = useState<Configuracoes | null>(null)
  const [view, setView] = useState<'mensal' | 'semanal' | 'diaria'>('mensal')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [slots, setSlots] = useState<Record<string, Record<string, Slot>>>({})
  const [loading, setLoading] = useState(false)
  const [painel, setPainel] = useState<{ data: string; hora: string; slot: Slot | null } | null>(null)
  const [motivoBloqueio, setMotivoBloqueio] = useState('')
  const [bloqueando, setBloqueando] = useState(false)
  const [atualizandoStatus, setAtualizandoStatus] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch('/api/pastor/pastores').then(r => r.json()),
      fetch('/api/pastor/configuracoes').then(r => r.json()),
    ]).then(([me, pasts, cfg]) => {
      setPastores(Array.isArray(pasts) ? pasts : [])
      if (cfg?.id) setConfig(cfg)
      if (me?.pastor_id) setPastorId(me.pastor_id)
    })
  }, [])

  const fetchSlots = useCallback(async () => {
    if (!pastorId) return
    setLoading(true)
    try {
      let dataInicio: string, dataFim: string
      if (view === 'mensal') {
        const ini = startOfMonth(currentDate)
        const fim = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        dataInicio = toDateStr(ini); dataFim = toDateStr(fim)
      } else {
        dataInicio = toDateStr(currentDate); dataFim = dataInicio
      }
      const res = await fetch(`/api/pastor/slots?pastorId=${pastorId}&dataInicio=${dataInicio}&dataFim=${dataFim}&_t=${Date.now()}`)
      setSlots(await res.json() || {})
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [pastorId, view, currentDate])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  useEffect(() => {
    const onFocus = () => fetchSlots()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchSlots])

  const getSlot = (data: string, hora: string): Slot | null => slots?.[data]?.[hora] ?? null
  const abrirPainel = (data: string, hora: string) => { setPainel({ data, hora, slot: getSlot(data, hora) }); setMotivoBloqueio('') }

  const handleBloquear = async () => {
    if (!painel || !pastorId) return
    setBloqueando(true)
    try {
      await fetch('/api/pastor/bloqueios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pastorId, data: painel.data, hora: painel.hora, motivo: motivoBloqueio }) })
      await fetchSlots(); setPainel(null)
    } finally { setBloqueando(false) }
  }

  const handleDesbloquear = async () => {
    if (!painel?.slot || painel.slot.tipo !== 'bloqueado') return
    await fetch(`/api/pastor/bloqueios/${painel.slot.dados.id}`, { method: 'DELETE' })
    await fetchSlots(); setPainel(null)
  }

  const handleAlterarStatus = async (novoStatus: string) => {
    if (!painel?.slot) return
    setAtualizandoStatus(true)
    try {
      await fetch(`/api/pastor/agendamentos/${painel.slot.dados.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: novoStatus }) })
      await fetchSlots(); setPainel(null)
    } finally { setAtualizandoStatus(false) }
  }

  const daysInMonth = (): (Date | null)[] => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth()
    const first = new Date(year, month, 1); const last = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []
    for (let i = 0; i < first.getDay(); i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  const pastor = pastores.find(p => p.id === pastorId)
  const hoje = toDateStr(new Date())

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>📅 Agenda dos Pastores</h1>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Visualização mensal, semanal e diária</p>
            </div>
            <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/pastor/login') }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 12px' }}>Sair</button>
          </div>

          {/* Controles */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Pastor(a)</label>
              <select value={pastorId ?? ''} onChange={e => setPastorId(e.target.value ? Number(e.target.value) : null)}
                style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', backgroundColor: '#fff', color: '#1f2937', fontSize: 13, minWidth: 200 }}>
                <option value="">— Selecione —</option>
                {pastores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setView('mensal')} style={{ backgroundColor: view === 'mensal' ? '#002347' : '#fff', color: view === 'mensal' ? '#fff' : '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Mensal</button>
              <button onClick={() => setView('semanal')} style={{ backgroundColor: view === 'semanal' ? '#002347' : '#fff', color: view === 'semanal' ? '#fff' : '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Semanal</button>
              <button onClick={() => setView('diaria')} style={{ backgroundColor: view === 'diaria' ? '#002347' : '#fff', color: view === 'diaria' ? '#fff' : '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Diária</button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {!pastorId && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: 16 }}>Selecione um pastor para visualizar a agenda</div>}
          {loading && pastorId && <LoadingSpinner />}

          {!loading && pastorId && (
            <div>
              {/* Navegação */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16, backgroundColor: '#fff', padding: '16px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <button onClick={() => setCurrentDate(navigate(currentDate, view, -1))} style={{ backgroundColor: '#002347', color: '#fff', border: 'none', borderRadius: 6, width: 40, height: 40, cursor: 'pointer', fontWeight: 700, fontSize: 18 }}>◀</button>
                <span style={{ color: '#002347', fontWeight: 700, fontSize: 18, flex: 1, textAlign: 'center', minWidth: 200 }}>{formatDateLabel(currentDate, view)}</span>
                <button onClick={() => setCurrentDate(navigate(currentDate, view, 1))} style={{ backgroundColor: '#002347', color: '#fff', border: 'none', borderRadius: 6, width: 40, height: 40, cursor: 'pointer', fontWeight: 700, fontSize: 18 }}>▶</button>
                <button onClick={() => setCurrentDate(new Date())} style={{ backgroundColor: '#C5A059', color: '#002347', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Hoje</button>
                <button onClick={() => window.location.reload()} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, width: 40, height: 40, cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>⟲</button>
              </div>

            {/* Mensal */}
            {view === 'mensal' && (
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
                  {DIAS_SEMANA_PT.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#6b7280', padding: '8px 0' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                  {daysInMonth().map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />
                    const ds = toDateStr(day)
                    const daySlots = slots[ds] || {}
                    const confirmados = Object.entries(daySlots).filter(([, s]) => s.tipo === 'confirmado').length
                    const pendentes = Object.entries(daySlots).filter(([, s]) => s.tipo === 'pendente').length
                    const bloqueados = Object.entries(daySlots).filter(([, s]) => s.tipo === 'bloqueado').length
                    const isToday = ds === hoje
                    return (
                      <div key={ds} onClick={() => { setCurrentDate(day); setView('diaria') }}
                        style={{
                          border: isToday ? '2px solid #C5A059' : '1px solid #e5e7eb',
                          backgroundColor: isToday ? '#fffbf0' : '#fff',
                          cursor: 'pointer',
                          minHeight: 80,
                          padding: 12,
                          borderRadius: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          fontSize: 12,
                          transition: 'box-shadow 0.2s'
                        }}
                      >
                        <span style={{ fontWeight: 700, color: isToday ? '#C5A059' : '#1f2937', marginBottom: 8, fontSize: 14 }}>{day.getDate()}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {confirmados > 0 && <span style={{ fontSize: 11, color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}>✓ {confirmados} confirmado{confirmados > 1 ? 's' : ''}</span>}
                          {pendentes > 0 && <span style={{ fontSize: 11, color: '#92400e', display: 'flex', alignItems: 'center', gap: 4 }}>⏱ {pendentes} pendente{pendentes > 1 ? 's' : ''}</span>}
                          {bloqueados > 0 && <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>🔒 {bloqueados} bloqueado{bloqueados > 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Diária */}
            {view === 'diaria' && (
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', margin: '0 0 20px 0' }}>
                  {DIAS_SEMANA_PT[currentDate.getDay()]}, {String(currentDate.getDate()).padStart(2,'0')}/{String(currentDate.getMonth()+1).padStart(2,'0')}/{currentDate.getFullYear()}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {HORAS_DIA.map(hora => {
                    const ds = toDateStr(currentDate)
                    const slot = getSlot(ds, hora)
                    const cor = slot ? slotColor(slot.tipo) : { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' }
                    return (
                      <div key={hora} style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', minWidth: 60, display: 'flex', alignItems: 'center' }}>{hora}</span>
                        <button
                          onClick={() => abrirPainel(ds, hora)}
                          style={{
                            flex: 1,
                            backgroundColor: cor.bg,
                            borderColor: cor.border,
                            color: cor.text,
                            border: `2px solid ${cor.border}`,
                            borderRadius: 8,
                            padding: '12px 14px',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                            transition: 'box-shadow 0.2s'
                          }}
                        >
                          {slot ? (slot.tipo === 'bloqueado' ? `🔒 ${slot.dados.motivo || 'Bloqueado'}` : `${slot.dados.nome_fiel} — ${slot.dados.assunto}`) : 'Livre'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Legenda */}
            <div style={{ display: 'flex', gap: 16, marginTop: 20, padding: '12px 16px', backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: 3 }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Confirmado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, backgroundColor: '#f59e0b', borderRadius: 3 }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Pendente</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, backgroundColor: '#9ca3af', borderRadius: 3 }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Bloqueado</span>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Painel Slot */}
      {painel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }} onClick={e => { if (e.target === e.currentTarget) setPainel(null) }}>
          <div style={{ width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90vh', overflow: 'auto', padding: '16px', boxShadow: '0 -4px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', margin: 0 }}>{painel.hora} — {painel.data.split('-').reverse().join('/')}</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0 0' }}>{pastor?.nome}</p>
              </div>
              <button onClick={() => setPainel(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            {!painel.slot && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: '#10b981', fontWeight: 600, fontSize: 13, margin: 0 }}>✓ Horário Livre</p>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Motivo do bloqueio</label>
                  <input type="text" value={motivoBloqueio} onChange={e => setMotivoBloqueio(e.target.value)} placeholder="Ex: Reunião interna"
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '10px', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <button onClick={handleBloquear} disabled={bloqueando} style={{
                  backgroundColor: '#002347', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 600, fontSize: 13, cursor: bloqueando ? 'not-allowed' : 'pointer', opacity: bloqueando ? 0.7 : 1, fontFamily: 'inherit'
                }}>{bloqueando ? 'Bloqueando...' : '🔒 Bloquear Horário'}</button>
              </div>
            )}

            {painel.slot?.tipo === 'bloqueado' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: '#666', fontWeight: 600, fontSize: 13, margin: 0 }}>🔒 Horário Bloqueado</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Motivo: {String(painel.slot.dados.motivo || '—')}</p>
                <button onClick={handleDesbloquear} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🔓 Desbloquear</button>
              </div>
            )}

            {(painel.slot?.tipo === 'confirmado' || painel.slot?.tipo === 'pendente') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Badge status={painel.slot.tipo} />
                <div style={{ fontSize: 12, color: '#666' }}>
                  <Row label="Fiel" value={String(painel.slot.dados.nome_fiel || '')} />
                  <Row label="Telefone" value={String(painel.slot.dados.telefone || '')} />
                  <Row label="Assunto" value={String(painel.slot.dados.assunto || '')} />
                  <Row label="Duração" value={Number(painel.slot.dados.duracao_min) >= 60 ? `${Math.floor(Number(painel.slot.dados.duracao_min)/60)}h${Number(painel.slot.dados.duracao_min)%60>0?`${Number(painel.slot.dados.duracao_min)%60}min`:''}` : `${painel.slot.dados.duracao_min || 30} min`} />
                  {!!painel.slot.dados.observacoes && <Row label="Obs" value={String(painel.slot.dados.observacoes)} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {painel.slot.tipo === 'pendente' && <button onClick={() => handleAlterarStatus('confirmado')} disabled={atualizandoStatus} style={{ backgroundColor: '#166534', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: atualizandoStatus ? 'not-allowed' : 'pointer', opacity: atualizandoStatus ? 0.7 : 1, fontFamily: 'inherit' }}>{atualizandoStatus ? '...' : '✓ Confirmar'}</button>}
                  {painel.slot.tipo === 'confirmado' && <button onClick={() => handleAlterarStatus('pendente')} disabled={atualizandoStatus} style={{ backgroundColor: '#92400e', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: atualizandoStatus ? 'not-allowed' : 'pointer', opacity: atualizandoStatus ? 0.7 : 1, fontFamily: 'inherit' }}>{atualizandoStatus ? '...' : '↩ Voltar para Pendente'}</button>}
                  <button onClick={() => handleAlterarStatus('cancelado')} disabled={atualizandoStatus} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: atualizandoStatus ? 'not-allowed' : 'pointer', opacity: atualizandoStatus ? 0.7 : 1, fontFamily: 'inherit' }}>🗑 Cancelar</button>
                  <button
                    onClick={() => {
                      const d = painel.slot!.dados
                      const [y, m, dv] = painel.data.split('-')
                      const msg = config?.msg_lembrete ? preencherTemplate(config.msg_lembrete, { nome: String(d.nome_fiel || ''), pastor: pastor?.nome || '', data: `${dv}/${m}/${y}`, hora: painel.hora, assunto: String(d.assunto || ''), telefone: String(d.telefone || '') }) : `Olá ${d.nome_fiel}, lembrete do atendimento com ${pastor?.nome || 'o(a) pastor(a)'} em ${dv}/${m}/${y} às ${painel.hora}.`
                      waOpen(String(d.telefone || ''), msg)
                    }}
                    style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    📱 WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
      <span style={{ fontWeight: 600, color: '#6b7280', minWidth: 80, flexShrink: 0 }}>{label}:</span>
      <span style={{ color: '#1f2937' }}>{value}</span>
    </div>
  )
}
