'use client'

import { useEffect, useState, useCallback } from 'react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Agendamento, Turma, Aluno, Professor } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const DIAS_PT    = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DIAS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_PT   = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const STATUS_CONFIG: Record<string, { bg: string; border: string; label: string; text: string }> = {
  confirmado: { bg: '#f0fdf4', border: '#22c55e', label: 'Confirmado', text: '#166534' },
  cancelado:  { bg: '#fef2f2', border: '#ef4444', label: 'Cancelado',  text: '#991b1b' },
  remarcado:  { bg: '#eff6ff', border: '#3b82f6', label: 'Remarcado',  text: '#1e40af' },
}

type View = 'dia' | 'semana' | 'mes'

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

function addMonths(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setMonth(d.getMonth() + n)
  return toDateStr(d)
}

function getWeekStart(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - d.getDay()) // domingo
  return toDateStr(d)
}

function getMonthStart(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
}

function getMonthEnd(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return toDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

function formatDatePT(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${DIAS_PT[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')} de ${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`
}

function subtitleForView(view: View, dataSel: string) {
  if (view === 'dia') return formatDatePT(dataSel)
  if (view === 'semana') {
    const start = getWeekStart(dataSel)
    const end   = addDays(start, 6)
    const ds = new Date(start + 'T12:00:00')
    const de = new Date(end   + 'T12:00:00')
    const fmtShort = (d: Date) => `${String(d.getDate()).padStart(2,'0')} ${MESES_PT[d.getMonth()].substring(0,3).toLowerCase()}`
    return `${fmtShort(ds)} — ${fmtShort(de)} de ${de.getFullYear()}`
  }
  const d = new Date(dataSel + 'T12:00:00')
  return `${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`
}

// ── Form types ────────────────────────────────────────────────────────────────

type FormState = {
  turma_id: number
  aluno_id: number | null
  professor_id: number | null
  data: string
  hora: string
  duracao_min: number
  assunto: string
  status: 'confirmado' | 'cancelado' | 'remarcado'
  observacoes: string
  recorrente: boolean
  modo_recorrencia: 'semanas' | 'data_fim'
  recorrencia_semanas: number
  recorrencia_data_fim: string
}

function calcSemanas(inicio: string, fim: string): number {
  const a = new Date(inicio + 'T12:00:00')
  const b = new Date(fim    + 'T12:00:00')
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (7 * 86400000)) + 1)
}

const emptyForm: FormState = {
  turma_id: 0, aluno_id: null, professor_id: null,
  data: toDateStr(new Date()), hora: '08:00', duracao_min: 50,
  assunto: '', status: 'confirmado', observacoes: '',
  recorrente: false, modo_recorrencia: 'semanas',
  recorrencia_semanas: 4, recorrencia_data_fim: '',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AgCard({ ag, onEdit, onDelete, onCancelar, onStatus }: {
  ag: Agendamento
  onEdit: () => void
  onDelete: () => void
  onCancelar: () => void
  onStatus: (s: string) => void
}) {
  const cfg = STATUS_CONFIG[ag.status] ?? STATUS_CONFIG.confirmado
  return (
    <div style={{ backgroundColor: cfg.bg, borderLeft: `3px solid ${cfg.border}` }} className="rounded-lg px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-gray-800">{ag.hora.substring(0,5)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: cfg.border + '22', color: cfg.text }}>{cfg.label}</span>
          </div>
          {ag.aluno_nome   && <p className="text-sm font-semibold text-gray-800 truncate">🎒 {ag.aluno_nome}</p>}
          {ag.professor_nome && <p className="text-xs text-gray-500 truncate">👨‍🏫 {ag.professor_nome}</p>}
          {ag.assunto      && <p className="text-xs text-gray-500 truncate mt-0.5">{ag.assunto}</p>}
          {ag.turma_nome   && <p className="text-xs text-gray-400 truncate">🏫 {ag.turma_nome}</p>}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={onEdit} style={{ color: '#E07535' }} className="text-xs font-medium hover:underline">Editar</button>
          <button onClick={onDelete} className="text-xs text-red-500 font-medium hover:underline">Excluir</button>
          {ag.recorrencia_id && (
            <button onClick={onCancelar} className="text-xs text-red-400 font-medium hover:underline whitespace-nowrap">
              Cancelar próximas
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-1.5">
        {(['confirmado','cancelado','remarcado'] as const).map(s => (
          <button key={s} onClick={() => onStatus(s)}
            className="text-xs px-2 py-0.5 rounded border transition-colors"
            style={ag.status === s
              ? { backgroundColor: STATUS_CONFIG[s].border, color: 'white', borderColor: STATUS_CONFIG[s].border }
              : { borderColor: '#e5e7eb', color: '#6b7280' }}>
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [turmaSel, setTurmaSel] = useState<number | 'todas'>('todas')
  const [dataSel, setDataSel] = useState(toDateStr(new Date()))
  const [view, setView] = useState<View>('dia')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Agendamento | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [cancelRecorrencia, setCancelRecorrencia] = useState<{ recorrencia_id: string; data_partir: string; turma_nome: string } | null>(null)
  const [cancelando, setCancelando] = useState(false)

  const hoje = toDateStr(new Date())

  useEffect(() => {
    Promise.all([
      fetch('/api/educacional/turmas').then(r => r.json()),
      fetch('/api/educacional/alunos').then(r => r.json()),
      fetch('/api/educacional/professores').then(r => r.json()),
    ]).then(([t, a, p]) => {
      setTurmas(Array.isArray(t) ? t : [])
      setAlunos(Array.isArray(a) ? a : [])
      setProfessores(Array.isArray(p) ? p : [])
    }).catch(e => setErro(e.message))
  }, [])

  const loadAgendamentos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (turmaSel !== 'todas') params.set('turma_id', String(turmaSel))
      if (view === 'dia') {
        params.set('data', dataSel)
      } else if (view === 'semana') {
        params.set('data_inicio', getWeekStart(dataSel))
        params.set('data_fim', addDays(getWeekStart(dataSel), 6))
      } else {
        params.set('data_inicio', getMonthStart(dataSel))
        params.set('data_fim', getMonthEnd(dataSel))
      }
      const res = await fetch(`/api/educacional/agendamentos?${params}`)
      if (!res.ok) throw new Error('Erro ao carregar agenda')
      setAgendamentos(await res.json())
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [dataSel, turmaSel, view])

  useEffect(() => { loadAgendamentos() }, [loadAgendamentos])

  function navigate(n: number) {
    if (view === 'dia')    setDataSel(d => addDays(d, n))
    else if (view === 'semana') setDataSel(d => addDays(d, n * 7))
    else                   setDataSel(d => addMonths(d, n))
  }

  function openNew(date?: string, turma_id?: number) {
    setEditing(null)
    setForm({ ...emptyForm, data: date ?? dataSel, turma_id: turma_id ?? (turmaSel !== 'todas' ? turmaSel : 0) })
    setShowModal(true)
  }

  function openEdit(ag: Agendamento) {
    setEditing(ag)
    setForm({
      turma_id: ag.turma_id, aluno_id: ag.aluno_id, professor_id: ag.professor_id,
      data: ag.data.substring(0, 10), hora: ag.hora.substring(0, 5),
      duracao_min: ag.duracao_min, assunto: ag.assunto, status: ag.status, observacoes: ag.observacoes,
      recorrente: false, modo_recorrencia: 'semanas', recorrencia_semanas: 4, recorrencia_data_fim: '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.turma_id || !form.data || !form.hora) return
    setSaving(true)
    try {
      const method = editing ? 'PUT' : 'POST'
      const url = editing ? `/api/educacional/agendamentos/${editing.id}` : '/api/educacional/agendamentos'
      const { recorrente, modo_recorrencia, recorrencia_semanas, recorrencia_data_fim, ...rest } = form
      const semanas = !recorrente ? 1
        : modo_recorrencia === 'data_fim' && recorrencia_data_fim
          ? calcSemanas(form.data, recorrencia_data_fim) : recorrencia_semanas
      const body = editing ? rest : { ...rest, recorrencia_semanas: semanas }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao salvar')
      setShowModal(false)
      await loadAgendamentos()
    } catch (e: any) { setErro(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/educacional/agendamentos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir')
      setConfirmDelete(null)
      await loadAgendamentos()
    } catch (e: any) { setErro(e.message) }
  }

  async function handleCancelarRecorrencia() {
    if (!cancelRecorrencia) return
    setCancelando(true)
    try {
      const params = new URLSearchParams({ recorrencia_id: cancelRecorrencia.recorrencia_id, data_partir: cancelRecorrencia.data_partir })
      const res = await fetch(`/api/educacional/agendamentos/recorrencia?${params}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao cancelar')
      setCancelRecorrencia(null)
      await loadAgendamentos()
    } catch (e: any) { setErro(e.message) }
    finally { setCancelando(false) }
  }

  async function handleStatusChange(ag: Agendamento, status: string) {
    try {
      await fetch(`/api/educacional/agendamentos/${ag.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      })
      await loadAgendamentos()
    } catch (e: any) { setErro(e.message) }
  }

  const cardProps = (ag: Agendamento) => ({
    ag,
    onEdit: () => openEdit(ag),
    onDelete: () => setConfirmDelete(ag.id),
    onCancelar: () => setCancelRecorrencia({ recorrencia_id: ag.recorrencia_id!, data_partir: ag.data.substring(0,10), turma_nome: ag.turma_nome ?? '' }),
    onStatus: (s: string) => handleStatusChange(ag, s),
  })

  const alunosDaTurma = form.turma_id ? alunos.filter(a => a.turma_id === form.turma_id) : alunos

  // ── View: Dia ──────────────────────────────────────────────────────────────

  const agrupados = turmas
    .filter(t => turmaSel === 'todas' || t.id === turmaSel)
    .map(t => ({ turma: t, ags: agendamentos.filter(a => a.turma_id === t.id) }))
    .filter(g => turmaSel !== 'todas' || g.ags.length > 0)

  function renderDia() {
    if (loading) return <LoadingSpinner />
    if (agrupados.length === 0) return (
      <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">
        <p className="text-4xl mb-3">📅</p>
        <p className="font-semibold">Nenhum agendamento para esta data.</p>
        <button onClick={() => openNew()} style={{ color: '#E07535' }} className="text-sm mt-2 underline">Criar agendamento</button>
      </div>
    )
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
        {agrupados.map(({ turma, ags }) => (
          <div key={turma.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div style={{ backgroundColor: '#1F2937', borderBottom: '2px solid #E07535' }} className="px-4 py-3 flex items-center gap-3">
              <div style={{ backgroundColor: '#E07535' }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">🏫</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{turma.nome}</p>
                <p style={{ color: '#E07535' }} className="text-xs">{turma.turno} · {ags.length} agendamento{ags.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => openNew(dataSel, turma.id)} style={{ color: '#E07535' }} className="text-xl font-bold hover:opacity-70 flex-shrink-0" title="Adicionar">+</button>
            </div>
            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
              {ags.map(ag => <AgCard key={ag.id} {...cardProps(ag)} />)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── View: Semana ───────────────────────────────────────────────────────────

  function renderSemana() {
    if (loading) return <LoadingSpinner />
    const weekStart = getWeekStart(dataSel)
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const byDay: Record<string, Agendamento[]> = {}
    days.forEach(d => { byDay[d] = [] })
    agendamentos.forEach(ag => {
      const d = ag.data.substring(0, 10)
      if (byDay[d]) byDay[d].push(ag)
    })

    return (
      <div className="space-y-3">
        {days.map(day => {
          const ags = byDay[day] ?? []
          const d = new Date(day + 'T12:00:00')
          const isHoje = day === hoje
          const isSel  = day === dataSel
          return (
            <div key={day} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                style={{
                  backgroundColor: isHoje ? '#E07535' : '#1F2937',
                  borderBottom: `2px solid ${isHoje ? '#c4622a' : '#E07535'}`,
                }}
                className="px-4 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setView('dia'); setDataSel(day) }}
                    className="text-left hover:opacity-80"
                  >
                    <span className="text-white font-semibold text-sm">
                      {DIAS_PT[d.getDay()]}, {String(d.getDate()).padStart(2,'0')} de {MESES_PT[d.getMonth()]}
                    </span>
                    {isHoje && <span className="ml-2 text-xs bg-white text-orange-600 font-bold px-1.5 rounded">hoje</span>}
                  </button>
                  <span style={{ color: isHoje ? 'rgba(255,255,255,0.8)' : '#E07535' }} className="text-xs">
                    {ags.length} aula{ags.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button onClick={() => openNew(day)} style={{ color: isHoje ? 'rgba(255,255,255,0.9)' : '#E07535' }} className="text-xl font-bold hover:opacity-70" title="Adicionar">+</button>
              </div>
              {ags.length > 0 ? (
                <div className="p-3 space-y-2">
                  {ags.map(ag => <AgCard key={ag.id} {...cardProps(ag)} />)}
                </div>
              ) : (
                <p className="px-4 py-3 text-sm text-gray-400">Sem aulas agendadas</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ── View: Mês ──────────────────────────────────────────────────────────────

  function renderMes() {
    if (loading) return <LoadingSpinner />

    const d = new Date(dataSel + 'T12:00:00')
    const ano = d.getFullYear()
    const mes = d.getMonth()

    const firstDay = new Date(ano, mes, 1)
    const lastDay  = new Date(ano, mes + 1, 0)
    const startPad = firstDay.getDay() // 0=Dom
    const totalCells = startPad + lastDay.getDate()
    const weeks = Math.ceil(totalCells / 7)

    const byDay: Record<string, Agendamento[]> = {}
    agendamentos.forEach(ag => {
      const key = ag.data.substring(0, 10)
      if (!byDay[key]) byDay[key] = []
      byDay[key].push(ag)
    })

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header dias da semana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DIAS_SHORT.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${weeks}, minmax(80px, 1fr))` }}>
          {Array.from({ length: weeks * 7 }, (_, i) => {
            const dayNum = i - startPad + 1
            if (dayNum < 1 || dayNum > lastDay.getDate()) {
              return <div key={i} className="border-b border-r border-gray-100 bg-gray-50" />
            }
            const dateStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
            const ags = byDay[dateStr] ?? []
            const isHoje = dateStr === hoje
            const isSel  = dateStr === dataSel

            return (
              <button
                key={i}
                onClick={() => { setView('dia'); setDataSel(dateStr) }}
                className="border-b border-r border-gray-100 p-1.5 text-left hover:bg-orange-50 transition-colors"
                style={{ backgroundColor: isSel && !isHoje ? '#fff7ed' : undefined }}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mb-1"
                  style={{
                    backgroundColor: isHoje ? '#E07535' : 'transparent',
                    color: isHoje ? '#fff' : isSel ? '#E07535' : '#374151',
                  }}
                >
                  {dayNum}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {ags.slice(0, 3).map(ag => (
                    <span
                      key={ag.id}
                      className="block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_CONFIG[ag.status]?.border ?? '#22c55e' }}
                      title={ag.turma_nome ?? ''}
                    />
                  ))}
                  {ags.length > 3 && (
                    <span className="text-xs text-gray-400 leading-none">+{ags.length - 3}</span>
                  )}
                </div>
                {ags.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-tight hidden sm:block truncate">
                    {ags.length} aula{ags.length !== 1 ? 's' : ''}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Legenda status */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.border }} />
              <span className="text-xs text-gray-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader icon="📅" title="Agenda" subtitle={subtitleForView(view, dataSel)} />

      {erro && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {erro} <button className="ml-2 underline" onClick={() => setErro('')}>Fechar</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        {/* Navegação */}
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm px-2 py-1.5 border border-gray-200">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100">‹</button>
          {view === 'dia' && (
            <input type="date" value={dataSel} onChange={e => setDataSel(e.target.value)}
              className="text-sm font-medium text-gray-700 focus:outline-none px-1" />
          )}
          {view === 'semana' && (
            <span className="text-sm font-medium text-gray-700 px-2">{subtitleForView('semana', dataSel)}</span>
          )}
          {view === 'mes' && (
            <span className="text-sm font-medium text-gray-700 px-2">{subtitleForView('mes', dataSel)}</span>
          )}
          <button onClick={() => navigate(1)} className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100">›</button>
          <button onClick={() => setDataSel(hoje)} style={{ color: '#E07535' }} className="text-xs font-semibold ml-1 hover:underline">Hoje</button>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
          {(['dia', 'semana', 'mes'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={view === v ? { backgroundColor: '#E07535', color: '#fff' } : { color: '#6b7280' }}
              className="px-3 py-1.5 text-xs font-medium capitalize transition-colors">
              {v === 'dia' ? 'Dia' : v === 'semana' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>

        {/* Filtro turma */}
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:border-orange-400"
          value={turmaSel} onChange={e => setTurmaSel(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}>
          <option value="todas">Todas as turmas</option>
          {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>

        <button onClick={() => openNew()} style={{ backgroundColor: '#E07535' }}
          className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 whitespace-nowrap ml-auto">
          + Novo Agendamento
        </button>
      </div>

      {view === 'dia'    && renderDia()}
      {view === 'semana' && renderSemana()}
      {view === 'mes'    && renderMes()}

      {/* ── Modal: Agendamento ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div style={{ backgroundColor: '#1F2937', borderBottom: '2px solid #E07535' }} className="px-5 py-4 flex items-center justify-between">
              <h2 className="text-white font-semibold">{editing ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Turma *</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  value={form.turma_id || ''}
                  onChange={e => setForm(f => ({ ...f, turma_id: Number(e.target.value), aluno_id: null }))}>
                  <option value="">Selecione a turma</option>
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Data *</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Hora *</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Aluno</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  value={form.aluno_id ?? ''} onChange={e => setForm(f => ({ ...f, aluno_id: e.target.value ? Number(e.target.value) : null }))}>
                  <option value="">Sem aluno específico</option>
                  {alunosDaTurma.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Professor</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  value={form.professor_id ?? ''} onChange={e => setForm(f => ({ ...f, professor_id: e.target.value ? Number(e.target.value) : null }))}>
                  <option value="">Sem professor específico</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duração (min)</label>
                  <input type="number" min={10} max={480} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    value={form.duracao_min} onChange={e => setForm(f => ({ ...f, duracao_min: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="remarcado">Remarcado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Assunto</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  value={form.assunto} onChange={e => setForm(f => ({ ...f, assunto: e.target.value }))}
                  placeholder="Ex: Aula de reposição, Reunião, Prova..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none" rows={2}
                  value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              </div>

              {!editing && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 14px' }}>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input type="checkbox" checked={form.recorrente}
                      onChange={e => setForm(f => ({ ...f, recorrente: e.target.checked }))}
                      className="w-4 h-4 accent-orange-500" />
                    <span className="text-sm font-medium text-orange-800">Aula recorrente (repetir semanalmente)</span>
                  </label>
                  {form.recorrente && (
                    <>
                      <div className="flex rounded-lg overflow-hidden border border-orange-300 mb-3 w-fit">
                        {(['semanas', 'data_fim'] as const).map(modo => (
                          <button key={modo} type="button"
                            onClick={() => setForm(f => ({ ...f, modo_recorrencia: modo }))}
                            style={form.modo_recorrencia === modo
                              ? { backgroundColor: '#E07535', color: '#fff' }
                              : { backgroundColor: '#fff', color: '#92400e' }}
                            className="px-3 py-1.5 text-xs font-medium transition-colors">
                            {modo === 'semanas' ? 'Nº de semanas' : 'Data fim'}
                          </button>
                        ))}
                      </div>
                      {form.modo_recorrencia === 'semanas' ? (
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-orange-700 whitespace-nowrap">Repetir por</label>
                          <input type="number" min={2} max={52}
                            className="w-20 border border-orange-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500 text-center"
                            value={form.recorrencia_semanas}
                            onChange={e => setForm(f => ({ ...f, recorrencia_semanas: Math.min(52, Math.max(2, Number(e.target.value))) }))} />
                          <span className="text-sm text-orange-700">semanas</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-orange-700 whitespace-nowrap">Última aula em</label>
                          <input type="date" min={addDays(form.data, 7)}
                            className="border border-orange-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
                            value={form.recorrencia_data_fim}
                            onChange={e => setForm(f => ({ ...f, recorrencia_data_fim: e.target.value }))} />
                        </div>
                      )}
                      {(() => {
                        const semanas = form.modo_recorrencia === 'data_fim' && form.recorrencia_data_fim
                          ? calcSemanas(form.data, form.recorrencia_data_fim) : form.recorrencia_semanas
                        const dataFim = addDays(form.data, (semanas - 1) * 7)
                        return semanas >= 2 ? (
                          <p className="text-xs text-orange-600 mt-2">
                            {semanas} aulas — de {new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')} até {new Date(dataFim + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        ) : null
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="px-5 pb-5 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.turma_id || !form.data || !form.hora}
                style={{ backgroundColor: '#E07535' }}
                className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {saving ? 'Salvando...' : editing ? 'Salvar' : (() => {
                  if (!form.recorrente) return 'Salvar'
                  const semanas = form.modo_recorrencia === 'data_fim' && form.recorrencia_data_fim
                    ? calcSemanas(form.data, form.recorrencia_data_fim) : form.recorrencia_semanas
                  return `Criar ${semanas} aulas`
                })()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <p className="font-semibold mb-1">Excluir agendamento?</p>
            <p className="text-sm text-gray-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm cancelar série ── */}
      {cancelRecorrencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-2xl mb-3">🗑️</p>
            <p className="font-semibold mb-1">Cancelar aulas futuras?</p>
            <p className="text-sm text-gray-500 mb-2">
              Todos os agendamentos desta série a partir de{' '}
              <strong>{new Date(cancelRecorrencia.data_partir + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>{' '}
              serão removidos permanentemente.
            </p>
            {cancelRecorrencia.turma_nome && <p className="text-xs text-gray-400 mb-5">Turma: {cancelRecorrencia.turma_nome}</p>}
            <div className="flex gap-3 justify-center">
              <button onClick={() => setCancelRecorrencia(null)} disabled={cancelando} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Voltar</button>
              <button onClick={handleCancelarRecorrencia} disabled={cancelando}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50">
                {cancelando ? 'Removendo...' : 'Confirmar remoção'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
