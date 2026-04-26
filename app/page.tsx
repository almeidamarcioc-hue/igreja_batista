'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Aluno, Turma, Professor } from '@/types'

export default function DashboardPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [resA, resT, resP] = await Promise.all([
          fetch('/api/alunos'),
          fetch('/api/turmas'),
          fetch('/api/professores'),
        ])
        if (!resA.ok || !resT.ok || !resP.ok) throw new Error('Erro ao carregar dados')
        setAlunos(await resA.json())
        setTurmas(await resT.json())
        setProfessores(await resP.json())
      } catch (e: any) {
        setErro(e.message || 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const alunosAtivos = alunos.filter(a => a.ativo).length
  const turmasAtivas = turmas.filter(t => t.ativo).length

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        logo
        title="Jeito de Viver"
        subtitle="Centro Educacional"
      />

      {erro && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-6">
          {erro}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total de Alunos" value={alunos.length} icon="🎒" color="#E07535" bg="#fff7f2" />
        <MetricCard label="Alunos Ativos" value={alunosAtivos} icon="✅" color="#166534" bg="#f0fdf4" />
        <MetricCard label="Turmas Ativas" value={turmasAtivas} icon="🏫" color="#1d4ed8" bg="#eff6ff" />
        <MetricCard label="Professores" value={professores.length} icon="👨‍🏫" color="#6d28d9" bg="#f5f3ff" />
      </div>

      {/* Turmas grid */}
      <h2 className="text-base font-semibold text-gray-700 mb-4">Turmas</h2>
      {turmas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400">
          <img src="/logo.png" alt="Jeito de Viver" className="mx-auto mb-3" style={{ height: 64, opacity: 0.4 }} />
          <p className="font-semibold">Nenhuma turma cadastrada.</p>
          <p className="text-sm mt-1">
            Acesse{' '}
            <a href="/cadastros/turmas" style={{ color: '#E07535' }} className="underline">
              Cadastros → Turmas
            </a>{' '}
            para adicionar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {turmas.map((turma) => {
            const alunosDaTurma = alunos.filter(a => a.turma_id === turma.id)
            const professor = professores.find(p => p.id === turma.professor_id)
            return (
              <div key={turma.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  style={{ backgroundColor: '#1F2937', borderBottom: '2px solid #E07535' }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div
                    style={{ backgroundColor: '#E07535', color: 'white' }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  >
                    🏫
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight truncate">{turma.nome}</p>
                    <p style={{ color: '#E07535' }} className="text-xs">
                      {turma.turno} · {alunosDaTurma.length} aluno{alunosDaTurma.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {!turma.ativo && (
                    <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full flex-shrink-0">Inativa</span>
                  )}
                </div>

                <div className="px-4 py-3">
                  {professor && (
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">Prof:</span> {professor.nome}
                    </p>
                  )}
                  {alunosDaTurma.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-2">Nenhum aluno nesta turma</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {alunosDaTurma.slice(0, 6).map(a => (
                        <div key={a.id} className="flex items-center gap-2 text-sm">
                          <div style={{ backgroundColor: '#E07535' }} className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {a.nome.charAt(0)}
                          </div>
                          <span className="text-gray-700 truncate">{a.nome}</span>
                          {!a.ativo && <span className="text-xs text-gray-400">(inativo)</span>}
                        </div>
                      ))}
                      {alunosDaTurma.length > 6 && (
                        <p className="text-xs text-gray-400 text-center pt-1">+{alunosDaTurma.length - 6} mais</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, color, bg }: {
  label: string; value: number; icon: string; color: string; bg: string
}) {
  return (
    <div style={{ backgroundColor: bg, borderTop: `4px solid ${color}` }} className="rounded-xl shadow-sm px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      </div>
      <p className="text-sm text-gray-600 mt-1 font-medium">{label}</p>
    </div>
  )
}
