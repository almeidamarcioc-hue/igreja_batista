'use client'

import PageHeader from '@/components/PageHeader'

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader icon="⚙️" title="Configurações" subtitle="Informações do sistema" />

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-1">Sobre o Sistema</h2>
          <p className="text-sm text-gray-500">
            Sistema de Gestão Educacional do Centro Educacional Jeito de Viver.
          </p>
        </div>

        <div style={{ borderColor: '#f3f4f6' }} className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Módulos Disponíveis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ModuleCard icon="🎒" label="Alunos" desc="Cadastro e gestão de alunos" href="/cadastros/alunos" />
            <ModuleCard icon="🏫" label="Turmas" desc="Organização das turmas" href="/cadastros/turmas" />
            <ModuleCard icon="👨‍🏫" label="Professores" desc="Cadastro de professores" href="/cadastros/professores" />
          </div>
        </div>

        <div style={{ borderColor: '#f3f4f6' }} className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Banco de Dados</h3>
          <p className="text-sm text-gray-500">Neon PostgreSQL — jeito-de-viver</p>
        </div>
      </div>
    </div>
  )
}

function ModuleCard({ icon, label, desc, href }: { icon: string; label: string; desc: string; href: string }) {
  return (
    <a href={href} className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold text-sm text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </a>
  )
}
