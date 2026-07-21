'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PROCEDIMENTOS } from '@/lib/comunicacao/procedimentos'

interface PassoComMarcacao {
  id: string
  marcado: boolean
}

interface ProgresoPasso {
  pre: PassoComMarcacao[]
  pos: PassoComMarcacao[]
  total: number
  marcados: number
}

export default function AreaPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const cultoData = searchParams.get('culto_data') || new Date().toISOString().split('T')[0]
  const areaId = params.id

  console.log('AreaPage: areaId=', areaId)
  console.log('PROCEDIMENTOS.areas ids:', PROCEDIMENTOS.areas.map(a => a.id))

  const area = PROCEDIMENTOS.areas.find(a => a.id === areaId)
  const [progresso, setProgresso] = useState<ProgresoPasso>({ pre: [], pos: [], total: 0, marcados: 0 })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const carregarProgresso = async () => {
      setCarregando(true)
      try {
        const resp = await fetch(`/api/comunicacao/progresso?culto_data=${cultoData}&area_id=${areaId}`)
        if (resp.ok) {
          const dados = await resp.json()
          setProgresso(dados)
        }
      } catch (err) {
        console.error('Erro ao carregar progresso:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarProgresso()
  }, [cultoData, areaId])

  if (!area) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-red-600 font-semibold">Área não encontrada</p>
      </div>
    )
  }

  const handleMarcaPasso = async (passoId: string, marcado: boolean) => {
    setSalvando(passoId)
    try {
      await fetch('/api/comunicacao/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: cultoData,
          area_id: areaId,
          passo_id: passoId,
          marcado: !marcado,
        }),
      })

      setProgresso(prev => {
        const novo = { ...prev }
        const passoEmPre = novo.pre.find(p => p.id === passoId)
        const passoEmPos = novo.pos.find(p => p.id === passoId)

        if (passoEmPre) {
          passoEmPre.marcado = !passoEmPre.marcado
        } else if (passoEmPos) {
          passoEmPos.marcado = !passoEmPos.marcado
        }

        novo.marcados = [...novo.pre, ...novo.pos].filter(p => p.marcado).length
        return novo
      })
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setSalvando(null)
    }
  }

  const handleReiniciar = async () => {
    try {
      await fetch('/api/comunicacao/reiniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          culto_data: cultoData,
          area_id: areaId,
        }),
      })

      setProgresso({ pre: [], pos: [], total: 0, marcados: 0 })
      setShowConfirm(false)
    } catch (err) {
      console.error('Erro ao reiniciar:', err)
    }
  }

  const percentualPre = progresso.pre.length > 0 ? Math.round((progresso.pre.filter(p => p.marcado).length / progresso.pre.length) * 100) : 0
  const percentualPos = progresso.pos.length > 0 ? Math.round((progresso.pos.filter(p => p.marcado).length / progresso.pos.length) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{area.icone}</span>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#002347' }}>{area.nome}</h1>
            <p className="text-sm text-gray-600 mt-1">Culto: {cultoData}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold" style={{ color: area.cor }}>Responsável sugerido:</span> {area.responsavelSugerido || '—'}
            {area.chegadaAntecedencia && ` | Chegada: ${area.chegadaAntecedencia} antes`}
          </p>
          {area.dependencias && (
            <p className="text-xs text-gray-600 mt-2">
              <span className="font-semibold">Dependências:</span> {area.dependencias}
            </p>
          )}
        </div>
      </div>

      {area.pendente ? (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-8 text-center">
          <p className="text-4xl mb-4">⏳</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#002347' }}>Área Pendente</h2>
          <p className="text-gray-700 mb-4">{area.pendenteMensagem}</p>
          <p className="text-sm text-gray-600">Entre em contato com o coordenador de comunicação quando o procedimento estiver documentado.</p>
        </div>
      ) : carregando ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#002347' }}>Progresso geral</h2>
              <span className="text-2xl font-bold" style={{ color: area.cor }}>
                {progresso.marcados} / {progresso.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${progresso.total > 0 ? Math.round((progresso.marcados / progresso.total) * 100) : 0}%`,
                  backgroundColor: area.cor,
                }}
              />
            </div>
          </div>

          {/* ANTES DE INICIAR */}
          <div className="mb-8">
            <BlocoFase
              titulo="ANTES DE INICIAR"
              subtitulo="Checklist pré-transmissão (marcável)"
              passos={area.fases.pre}
              progresso={progresso.pre}
              areaId={areaId}
              salvando={salvando}
              onMarcaPasso={handleMarcaPasso}
              area={area}
              cor={area.cor}
            />
          </div>

          {/* DURANTE */}
          <div className="mb-8">
            <BlocoFaseConsulta
              titulo="DURANTE"
              subtitulo="Guia de consulta (não marcável — ao vivo não há o que marcar)"
              passos={area.fases.operacao}
              area={area}
              cor={area.cor}
            />
          </div>

          {/* DEPOIS DE FINALIZAR */}
          <div className="mb-8">
            <BlocoFase
              titulo="DEPOIS DE FINALIZAR"
              subtitulo="Checklist pós-transmissão (marcável)"
              passos={area.fases.pos}
              progresso={progresso.pos}
              areaId={areaId}
              salvando={salvando}
              onMarcaPasso={handleMarcaPasso}
              area={area}
              cor={area.cor}
            />
          </div>

          {/* TROUBLESHOOTING */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#002347' }}>🔧 Troubleshooting</h2>
              {area.troubleshooting && area.troubleshooting.length > 0 ? (
                <div className="space-y-4">
                  {area.troubleshooting.map((item, idx) => (
                    <div key={idx} className="border-l-4 pl-4" style={{ borderColor: area.cor }}>
                      <p className="font-semibold text-sm" style={{ color: area.cor }}>❓ {item.problema}</p>
                      <p className="text-sm text-gray-700 mt-1">{item.solucao}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhum item de troubleshooting cadastrado ainda.</p>
              )}
            </div>
          </div>

          {/* BOTÃO REINICIAR */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
            >
              🔄 Reiniciar checklist desta área
            </button>
            <p className="text-xs text-gray-600 mt-2">Isso apagará toda a marcação desta área para este culto apenas.</p>

            {showConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm">
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#002347' }}>Tem certeza?</h3>
                  <p className="text-gray-700 mb-6">Você está prestes a reiniciar a marcação desta área. Essa ação não pode ser desfeita.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReiniciar}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700"
                    >
                      Reiniciar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

interface BlocoFaseProps {
  titulo: string
  subtitulo: string
  passos: any[]
  progresso: PassoComMarcacao[]
  areaId: string
  salvando: string | null
  onMarcaPasso: (passoId: string, marcado: boolean) => void
  area: any
  cor: string
}

function BlocoFase({ titulo, subtitulo, passos, progresso, salvando, onMarcaPasso, area, cor }: BlocoFaseProps) {
  const marcados = progresso.filter(p => p.marcado).length
  const percentual = passos.length > 0 ? Math.round((marcados / passos.length) * 100) : 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold" style={{ color: '#002347' }}>{titulo}</h2>
        <span className="text-sm font-semibold" style={{ color: cor }}>{marcados}/{passos.length}</span>
      </div>
      <p className="text-xs text-gray-600 mb-4">{subtitulo}</p>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${percentual}%`, backgroundColor: cor }}
        />
      </div>

      <div className="space-y-3">
        {passos.map((passo, idx) => {
          const progPasso = progresso.find(p => p.id === passo.id) || { id: passo.id, marcado: false }
          const esCritico = passo.critico

          return (
            <div
              key={passo.id}
              className="flex items-start gap-3 p-3 rounded-lg border-2 transition-all"
              style={{
                borderColor: progPasso.marcado ? cor : '#e5e7eb',
                backgroundColor: progPasso.marcado ? `${cor}15` : '#fff',
                opacity: progPasso.marcado ? 0.7 : 1,
              }}
            >
              <button
                onClick={() => onMarcaPasso(passo.id, progPasso.marcado)}
                disabled={salvando === passo.id}
                className="flex-shrink-0 mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center font-bold text-sm transition-all"
                style={{
                  borderColor: progPasso.marcado ? cor : '#d1d5db',
                  backgroundColor: progPasso.marcado ? cor : '#fff',
                  color: progPasso.marcado ? '#fff' : '#000',
                  cursor: salvando === passo.id ? 'not-allowed' : 'pointer',
                  opacity: salvando === passo.id ? 0.6 : 1,
                }}
              >
                {salvando === passo.id ? '...' : progPasso.marcado ? '✓' : ''}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <p
                    className="font-semibold text-sm"
                    style={{
                      color: '#002347',
                      textDecoration: progPasso.marcado ? 'line-through' : 'none',
                    }}
                  >
                    {`${idx + 1}.`} {passo.titulo}
                  </p>
                  {esCritico && (
                    <span
                      className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: cor }}
                    >
                      ⚠️ Crítico
                    </span>
                  )}
                </div>

                {passo.descricao && (
                  <p className="text-xs text-gray-600 mt-1">{passo.descricao}</p>
                )}

                {passo.aviso && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-800">{passo.aviso}</p>
                  </div>
                )}

                {passo.imagem && (
                  <div className="mt-2">
                    <ImgPreview src={passo.imagem} alt={passo.titulo} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface BlocoFaseConsultaProps {
  titulo: string
  subtitulo: string
  passos: any[]
  area: any
  cor: string
}

function BlocoFaseConsulta({ titulo, subtitulo, passos, area, cor }: BlocoFaseConsultaProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: `4px solid ${cor}` }}>
      <div className="mb-2">
        <h2 className="text-lg font-bold" style={{ color: '#002347' }}>{titulo}</h2>
        <p className="text-xs text-gray-600 mt-1">{subtitulo}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 my-4">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">💡 Dica:</span> Esta é uma guia de consulta. Os itens aqui NÃO são marcáveis.
        </p>
      </div>

      <div className="space-y-3">
        {passos.map((passo, idx) => (
          <div
            key={passo.id}
            className="flex items-start gap-3 p-3 rounded-lg border-2 border-gray-200 bg-gray-50"
          >
            <span className="flex-shrink-0 mt-1 font-bold text-sm" style={{ color: cor }}>
              ▸
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <p className="font-semibold text-sm" style={{ color: '#002347' }}>
                  {`${idx + 1}.`} {passo.titulo}
                </p>
                {passo.critico && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: cor }}>
                    ATENÇÃO
                  </span>
                )}
              </div>

              {passo.descricao && (
                <p className="text-xs text-gray-600 mt-1">{passo.descricao}</p>
              )}

              {passo.aviso && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                  <p className="text-xs text-yellow-800">{passo.aviso}</p>
                </div>
              )}

              {passo.imagem && (
                <div className="mt-2">
                  <ImgPreview src={passo.imagem} alt={passo.titulo} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImgPreview({ src, alt }: { src: string; alt: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className="inline-block mt-2 max-w-xs rounded-lg border-2 border-gray-300 overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-auto" style={{ maxHeight: '150px', objectFit: 'cover' }} />
      </button>

      {expanded && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-96 overflow-auto" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="w-full h-auto" />
            <button
              onClick={() => setExpanded(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-300 w-full"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
