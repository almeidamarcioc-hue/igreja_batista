'use client'

import { useEffect, useState } from 'react'

interface Slide {
  id?: number
  ordem: number
  variante: number
  eyebrow: string
  titulo_antes: string
  titulo_italico: string
  titulo_depois: string
  descricao: string
  ativo: boolean
}

const GRADIENTES = [
  { label: 'Roxo / Laranja', cls: 'grad-0' },
  { label: 'Azul / Verde', cls: 'grad-1' },
  { label: 'Roxo escuro / Âmbar', cls: 'grad-2' },
  { label: 'Petróleo / Teal', cls: 'grad-3' },
]

const GRAD_STYLES = [
  'radial-gradient(ellipse at 30% 30%, rgba(72,72,168,.55), transparent 60%), radial-gradient(ellipse at 75% 70%, rgba(240,120,72,.4), transparent 60%), linear-gradient(135deg, #1F1F4D 0%, #2E2E66 50%, #4848A8 100%)',
  'radial-gradient(ellipse at 70% 30%, rgba(48,192,168,.45), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(0,144,216,.5), transparent 60%), linear-gradient(160deg, #1F1F4D 0%, #243A6B 50%, #0F4978 100%)',
  'radial-gradient(ellipse at 50% 20%, rgba(248,216,0,.3), transparent 55%), radial-gradient(ellipse at 30% 80%, rgba(240,120,72,.5), transparent 60%), linear-gradient(135deg, #2E1B3D 0%, #4D2360 40%, #6B2A4A 100%)',
  'radial-gradient(ellipse at 80% 40%, rgba(72,72,168,.5), transparent 60%), radial-gradient(ellipse at 25% 75%, rgba(48,192,168,.45), transparent 60%), linear-gradient(135deg, #0F2B3A 0%, #1F4A5C 50%, #2E6E76 100%)',
]

const emptySlide = (): Slide => ({
  ordem: 0,
  variante: 0,
  eyebrow: '',
  titulo_antes: '',
  titulo_italico: '',
  titulo_depois: '',
  descricao: '',
  ativo: true,
})

export default function CarouselConfigPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/configuracoes/slides')
      if (!res.ok) throw new Error('Erro ao carregar slides')
      setSlides(await res.json())
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function update(idx: number, field: keyof Slide, value: string | number | boolean) {
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function addSlide() {
    setSlides(prev => [...prev, { ...emptySlide(), ordem: prev.length }])
  }

  function removeSlide(idx: number) {
    setSlides(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, ordem: i })))
  }

  function moveUp(idx: number) {
    if (idx === 0) return
    setSlides(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next.map((s, i) => ({ ...s, ordem: i }))
    })
  }

  function moveDown(idx: number) {
    setSlides(prev => {
      if (idx === prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next.map((s, i) => ({ ...s, ordem: i }))
    })
  }

  async function save() {
    setSaving(true); setErro(''); setSucesso('')
    try {
      const res = await fetch('/api/configuracoes/slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slides),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao salvar')
      setSucesso('Slides salvos com sucesso!')
      setTimeout(() => setSucesso(''), 3000)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1F1F4D 0%, #2E2E66 100%)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-white text-xl font-bold">Slides da Tela Inicial</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              Configure os slides exibidos na página de login
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <a href="/configuracoes" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>← Configurações</a>
            <button
              onClick={addSlide}
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
            >
              + Adicionar slide
            </button>
            <button
              onClick={save}
              disabled={saving || loading}
              style={{ backgroundColor: '#4848A8' }}
              className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>

        {sucesso && (
          <div className="bg-green-900 border border-green-600 text-green-200 rounded-lg px-4 py-3 mb-4 text-sm">{sucesso}</div>
        )}
        {erro && (
          <div className="bg-red-900 border border-red-600 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">{erro}</div>
        )}

        {loading ? (
          <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando...</div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, idx) => (
              <SlideCard
                key={idx}
                slide={slide}
                idx={idx}
                total={slides.length}
                onChange={(field, value) => update(idx, field, value)}
                onMoveUp={() => moveUp(idx)}
                onMoveDown={() => moveDown(idx)}
                onRemove={() => removeSlide(idx)}
              />
            ))}

            {slides.length === 0 && (
              <div className="bg-white bg-opacity-10 rounded-xl p-8 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <p className="text-3xl mb-2">🖼</p>
                <p className="text-sm">Nenhum slide. Clique em "+ Adicionar slide" para começar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SlideCard({
  slide, idx, total, onChange, onMoveUp, onMoveDown, onRemove,
}: {
  slide: Slide
  idx: number
  total: number
  onChange: (field: keyof Slide, value: string | number | boolean) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  return (
    <div className="bg-white bg-opacity-10 rounded-xl overflow-hidden">
      {/* Top bar */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>SLIDE {idx + 1}</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={slide.ativo}
              onChange={e => onChange('ativo', e.target.checked)}
              className="w-4 h-4"
            />
            <span style={{ fontSize: 12, color: slide.ativo ? '#86efac' : 'rgba(255,255,255,0.4)' }}>
              {slide.ativo ? 'Ativo' : 'Oculto'}
            </span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onMoveUp} disabled={idx === 0}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}
            className="w-7 h-7 rounded hover:bg-white hover:bg-opacity-10 flex items-center justify-center disabled:opacity-20"
            title="Mover para cima">↑</button>
          <button onClick={onMoveDown} disabled={idx === total - 1}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}
            className="w-7 h-7 rounded hover:bg-white hover:bg-opacity-10 flex items-center justify-center disabled:opacity-20"
            title="Mover para baixo">↓</button>
          <button onClick={onRemove}
            className="text-xs text-red-400 font-medium hover:underline ml-2"
            title="Remover slide">Remover</button>
        </div>
      </div>

      <div className="p-5 grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Left: form fields */}
        <div className="space-y-3">
          <Field label="Legenda (texto pequeno acima do título)" value={slide.eyebrow}
            placeholder="ex: Domingo · Culto da Família"
            onChange={v => onChange('eyebrow', v)} />

          <div>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
              className="block mb-1">Título</label>
            <div className="space-y-2">
              <input
                value={slide.titulo_antes}
                onChange={e => onChange('titulo_antes', e.target.value)}
                placeholder="Texto antes da palavra em itálico (ex: Um lugar onde)"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%' }}
                className="focus:outline-none focus:border-indigo-400 placeholder-gray-500"
              />
              <input
                value={slide.titulo_italico}
                onChange={e => onChange('titulo_italico', e.target.value)}
                placeholder="Palavra em itálico (ex: cabe)"
                style={{ backgroundColor: 'rgba(72,72,168,0.3)', border: '1px solid rgba(165,180,252,0.3)', color: '#c7d2fe', borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%', fontStyle: 'italic' }}
                className="focus:outline-none focus:border-indigo-400 placeholder-gray-500"
              />
              <input
                value={slide.titulo_depois}
                onChange={e => onChange('titulo_depois', e.target.value)}
                placeholder="Texto depois, na 2ª linha (ex: a sua história.)"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%' }}
                className="focus:outline-none focus:border-indigo-400 placeholder-gray-500"
              />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              Campo do meio aparece em <em>itálico</em> no slide
            </p>
          </div>

          <Field label="Descrição" value={slide.descricao}
            placeholder="Texto de apoio abaixo do título"
            onChange={v => onChange('descricao', v)}
            multiline />
        </div>

        {/* Right: gradient picker + preview */}
        <div className="space-y-3">
          <div>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
              className="block mb-2">Fundo (gradiente)</label>
            <div className="grid grid-cols-2 gap-2">
              {GRADIENTES.map((g, gi) => (
                <button key={gi} onClick={() => onChange('variante', gi)}
                  style={{
                    background: GRAD_STYLES[gi],
                    border: slide.variante === gi ? '2px solid white' : '2px solid transparent',
                    borderRadius: 8, height: 52, cursor: 'pointer',
                    boxShadow: slide.variante === gi ? '0 0 0 2px #4848A8' : 'none',
                    position: 'relative',
                  }}
                  title={g.label}>
                  {slide.variante === gi && (
                    <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 14 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              {GRADIENTES[slide.variante]?.label}
            </p>
          </div>

          {/* Mini preview */}
          <div>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
              className="block mb-2">Pré-visualização</label>
            <div style={{
              background: GRAD_STYLES[slide.variante],
              borderRadius: 10, padding: '20px 18px', minHeight: 110,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              {slide.eyebrow && (
                <div style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                  — {slide.eyebrow}
                </div>
              )}
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, lineHeight: 1.1, color: 'white', fontWeight: 400 }}>
                {slide.titulo_antes} <em>{slide.titulo_italico}</em>
                {slide.titulo_depois && <><br />{slide.titulo_depois}</>}
              </div>
              {slide.descricao && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 1.4 }}>
                  {slide.descricao}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, placeholder, onChange, multiline }: {
  label: string
  value: string
  placeholder?: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  const style: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'white',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    width: '100%',
    resize: 'vertical' as const,
  }
  return (
    <div>
      <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
        className="block mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={style}
          className="focus:outline-none focus:border-indigo-400 placeholder-gray-500"
        />
      ) : (
        <input
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={style}
          className="focus:outline-none focus:border-indigo-400 placeholder-gray-500"
        />
      )}
    </div>
  )
}
