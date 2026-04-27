'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Usuario {
  id: number
  usuario: string
  nome: string
  email: string
  role: string
  modulos: string
  perfil_id: number | null
  ativo: boolean
}

interface Perfil {
  id: number
  nome: string
  descricao: string
  permissoes: string // JSON string
  padrao: boolean
}

// ── Permissions ───────────────────────────────────────────────────────────────

const MODULOS_PERM = [
  { key: 'secretaria', label: 'Secretaria' },
  { key: 'educacional', label: 'Educacional' },
]

const ACOES_PERM = [
  { key: 'visualizar', label: 'Visualizar' },
  { key: 'criar', label: 'Criar' },
  { key: 'editar', label: 'Editar' },
  { key: 'excluir', label: 'Excluir' },
]

function parsePermissoes(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

function permLabel(perm: string): string {
  if (perm === '*') return 'Acesso total'
  const [mod, acao] = perm.split('.')
  const m = MODULOS_PERM.find(x => x.key === mod)?.label ?? mod
  const a = ACOES_PERM.find(x => x.key === acao)?.label ?? acao
  return `${m} · ${a}`
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MODULOS_OPTS = [
  { value: '*', label: 'Todos os módulos' },
  { value: 'secretaria', label: 'Secretaria' },
  { value: 'educacional', label: 'Educacional' },
  { value: 'secretaria,educacional', label: 'Secretaria + Educacional' },
]

const emptyUser = { usuario: '', nome: '', email: '', senha: '', role: 'usuario', modulos: 'secretaria', perfil_id: null as number | null, ativo: true }
const emptyPerfil = { nome: '', descricao: '', permissoes: [] as string[] }

// ── Styles ────────────────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400'
const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [aba, setAba] = useState<'usuarios' | 'perfis'>('usuarios')

  // ── Usuarios state ──
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loadingU, setLoadingU] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [formUser, setFormUser] = useState(emptyUser)
  const [savingUser, setSavingUser] = useState(false)
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<number | null>(null)

  // ── Perfis state ──
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [loadingP, setLoadingP] = useState(true)
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [editingPerfil, setEditingPerfil] = useState<Perfil | null>(null)
  const [formPerfil, setFormPerfil] = useState(emptyPerfil)
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [confirmDeletePerfil, setConfirmDeletePerfil] = useState<number | null>(null)

  // ── Global messages ──
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  function flash(msg: string, tipo: 'ok' | 'err' = 'ok') {
    if (tipo === 'ok') { setSucesso(msg); setTimeout(() => setSucesso(''), 3000) }
    else { setErro(msg); setTimeout(() => setErro(''), 4000) }
  }

  // ── Load data ──────────────────────────────────────────────────────────────

  async function loadUsuarios() {
    setLoadingU(true)
    try {
      const res = await fetch('/api/admin/usuarios')
      if (!res.ok) throw new Error('Erro ao carregar usuários')
      setUsuarios(await res.json())
    } catch (e: any) { flash(e.message, 'err') }
    finally { setLoadingU(false) }
  }

  async function loadPerfis() {
    setLoadingP(true)
    try {
      const res = await fetch('/api/admin/perfis')
      if (!res.ok) throw new Error('Erro ao carregar perfis')
      setPerfis(await res.json())
    } catch (e: any) { flash(e.message, 'err') }
    finally { setLoadingP(false) }
  }

  useEffect(() => { loadUsuarios(); loadPerfis() }, [])

  // ── Usuarios CRUD ──────────────────────────────────────────────────────────

  function openNewUser() { setEditingUser(null); setFormUser(emptyUser); setShowUserModal(true) }

  function openEditUser(u: Usuario) {
    setEditingUser(u)
    setFormUser({ usuario: u.usuario, nome: u.nome, email: u.email ?? '', senha: '', role: u.role, modulos: u.modulos, perfil_id: u.perfil_id, ativo: u.ativo })
    setShowUserModal(true)
  }

  async function handleSaveUser() {
    if (!formUser.usuario.trim() || !formUser.nome.trim()) return
    if (!editingUser && !formUser.senha.trim()) { flash('Senha é obrigatória para novos usuários.', 'err'); return }
    setSavingUser(true)
    try {
      const method = editingUser ? 'PUT' : 'POST'
      const url = editingUser ? `/api/admin/usuarios/${editingUser.id}` : '/api/admin/usuarios'
      const body: Record<string, any> = {
        usuario: formUser.usuario, nome: formUser.nome,
        email: formUser.email.trim() || null,
        role: formUser.role, modulos: formUser.modulos,
        perfil_id: formUser.perfil_id,
        ativo: formUser.ativo,
      }
      if (formUser.senha.trim()) body.senha = formUser.senha
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao salvar')
      setShowUserModal(false)
      flash(editingUser ? 'Usuário atualizado.' : 'Usuário criado com sucesso.')
      await loadUsuarios()
    } catch (e: any) { flash(e.message, 'err') }
    finally { setSavingUser(false) }
  }

  async function handleDeleteUser(id: number) {
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao excluir')
      setConfirmDeleteUser(null)
      await loadUsuarios()
    } catch (e: any) { flash(e.message, 'err') }
  }

  // ── Perfis CRUD ────────────────────────────────────────────────────────────

  function openNewPerfil() { setEditingPerfil(null); setFormPerfil(emptyPerfil); setShowPerfilModal(true) }

  function openEditPerfil(p: Perfil) {
    setEditingPerfil(p)
    setFormPerfil({ nome: p.nome, descricao: p.descricao, permissoes: parsePermissoes(p.permissoes) })
    setShowPerfilModal(true)
  }

  function togglePerm(perm: string) {
    setFormPerfil(f => {
      const has = f.permissoes.includes(perm)
      return { ...f, permissoes: has ? f.permissoes.filter(p => p !== perm) : [...f.permissoes, perm] }
    })
  }

  function toggleAllAdmin() {
    setFormPerfil(f => {
      const isAll = f.permissoes.includes('*')
      return { ...f, permissoes: isAll ? [] : ['*'] }
    })
  }

  async function handleSavePerfil() {
    if (!formPerfil.nome.trim()) { flash('Nome é obrigatório.', 'err'); return }
    setSavingPerfil(true)
    try {
      const method = editingPerfil ? 'PUT' : 'POST'
      const url = editingPerfil ? `/api/admin/perfis/${editingPerfil.id}` : '/api/admin/perfis'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formPerfil) })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao salvar')
      setShowPerfilModal(false)
      flash(editingPerfil ? 'Perfil atualizado.' : 'Perfil criado.')
      await loadPerfis()
    } catch (e: any) { flash(e.message, 'err') }
    finally { setSavingPerfil(false) }
  }

  async function handleDeletePerfil(id: number) {
    try {
      const res = await fetch(`/api/admin/perfis/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao excluir')
      setConfirmDeletePerfil(null)
      await loadPerfis()
    } catch (e: any) { flash(e.message, 'err') }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const roleLabel: Record<string, string> = { admin: 'Admin', usuario: 'Usuário' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1F1F4D 0%, #2E2E66 100%)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-white text-xl font-bold">Configurações</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Gerenciamento de usuários, perfis e acesso</p>
          </div>
          <a href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>← Voltar ao workspace</a>
        </div>

        {/* Global messages */}
        {erro && <div className="bg-red-900 border border-red-600 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">{erro}</div>}
        {sucesso && <div className="bg-green-900 border border-green-600 text-green-200 rounded-lg px-4 py-3 mb-4 text-sm">{sucesso}</div>}

        {/* Slides link */}
        <a href="/configuracoes/carousel"
          className="flex items-center justify-between bg-white bg-opacity-10 rounded-xl px-5 py-4 hover:bg-opacity-20 mb-4"
          style={{ textDecoration: 'none' }}>
          <div>
            <p className="text-white font-semibold text-sm">Slides da Tela Inicial</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Configure os textos e fundos exibidos na página de login</p>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>→</span>
        </a>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['usuarios', 'perfis'] as const).map(t => (
            <button key={t} onClick={() => setAba(t)}
              style={{ backgroundColor: aba === t ? '#4848A8' : 'rgba(255,255,255,0.1)', color: '#fff' }}
              className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors">
              {t === 'usuarios' ? 'Usuários' : 'Perfis de Acesso'}
            </button>
          ))}
        </div>

        {/* ── Tab: Usuários ── */}
        {aba === 'usuarios' && (
          <div className="bg-white bg-opacity-10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Usuários do Sistema</h2>
              <button onClick={openNewUser} style={{ backgroundColor: '#4848A8' }}
                className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                + Novo Usuário
              </button>
            </div>

            {loadingU ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <p className="text-3xl mb-2">👤</p>
                <p className="text-sm">Nenhum usuário cadastrado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {usuarios.map(u => {
                  const perfilNome = perfis.find(p => p.id === u.perfil_id)?.nome
                  return (
                    <div key={u.id} className="bg-white bg-opacity-10 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div style={{ backgroundColor: '#4848A8' }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold text-sm">{u.nome}</p>
                          <span style={{ backgroundColor: u.role === 'admin' ? '#4848A8' : '#374151' }}
                            className="text-xs text-white px-2 py-0.5 rounded-full">
                            {roleLabel[u.role] ?? u.role}
                          </span>
                          {!u.ativo && <span className="text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded-full">Inativo</span>}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                          @{u.usuario}
                          {perfilNome && <> · {perfilNome}</>}
                          {!perfilNome && <> · {MODULOS_OPTS.find(m => m.value === u.modulos)?.label ?? u.modulos}</>}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEditUser(u)} style={{ color: '#a5b4fc' }}
                          className="text-xs font-medium hover:underline">Editar</button>
                        {u.usuario !== 'admin' && (
                          <button onClick={() => setConfirmDeleteUser(u.id)}
                            className="text-xs text-red-400 font-medium hover:underline">Excluir</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Perfis ── */}
        {aba === 'perfis' && (
          <div className="bg-white bg-opacity-10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Perfis de Acesso</h2>
              <button onClick={openNewPerfil} style={{ backgroundColor: '#4848A8' }}
                className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                + Novo Perfil
              </button>
            </div>

            {loadingP ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : perfis.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <p className="text-3xl mb-2">🔐</p>
                <p className="text-sm">Nenhum perfil cadastrado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {perfis.map(p => {
                  const perms = parsePermissoes(p.permissoes)
                  return (
                    <div key={p.id} className="bg-white bg-opacity-10 rounded-xl px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-white font-semibold text-sm">{p.nome}</p>
                            {p.padrao && (
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                                padrão
                              </span>
                            )}
                          </div>
                          {p.descricao && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{p.descricao}</p>}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {perms.map(perm => (
                              <span key={perm} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: 'rgba(72,72,168,0.5)', color: '#c7d2fe' }}>
                                {permLabel(perm)}
                              </span>
                            ))}
                            {perms.length === 0 && (
                              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Sem permissões</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 pt-0.5">
                          <button onClick={() => openEditPerfil(p)} style={{ color: '#a5b4fc' }}
                            className="text-xs font-medium hover:underline">Editar</button>
                          {!p.padrao && (
                            <button onClick={() => setConfirmDeletePerfil(p.id)}
                              className="text-xs text-red-400 font-medium hover:underline">Excluir</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Usuário ── */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div style={{ backgroundColor: '#1F1F4D' }} className="px-5 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-white font-semibold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className={labelCls}>Nome Completo *</label>
                <input className={inputCls} value={formUser.nome}
                  onChange={e => setFormUser(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>E-mail (para recuperação de senha)</label>
                <input type="email" className={inputCls} placeholder="usuario@email.com"
                  value={formUser.email} onChange={e => setFormUser(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Usuário (login) *</label>
                <input className={`${inputCls} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  value={formUser.usuario} disabled={!!editingUser}
                  onChange={e => setFormUser(f => ({ ...f, usuario: e.target.value.toLowerCase().replace(/\s/g, '') }))} />
                {editingUser && <p className="text-xs text-gray-400 mt-0.5">O nome de usuário não pode ser alterado.</p>}
              </div>
              <div>
                <label className={labelCls}>Senha {editingUser ? '(deixe vazio para não alterar)' : '*'}</label>
                <input type="password" className={inputCls}
                  value={formUser.senha} onChange={e => setFormUser(f => ({ ...f, senha: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Perfil de acesso</label>
                <select className={inputCls} value={formUser.perfil_id ?? ''}
                  onChange={e => setFormUser(f => ({ ...f, perfil_id: e.target.value ? Number(e.target.value) : null }))}>
                  <option value="">— Sem perfil —</option>
                  {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nível</label>
                  <select className={inputCls} value={formUser.role}
                    onChange={e => setFormUser(f => ({ ...f, role: e.target.value }))}>
                    <option value="usuario">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Módulos</label>
                  <select className={inputCls} value={formUser.modulos}
                    onChange={e => setFormUser(f => ({ ...f, modulos: e.target.value }))}>
                    {MODULOS_OPTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ativo-user" checked={formUser.ativo}
                  onChange={e => setFormUser(f => ({ ...f, ativo: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="ativo-user" className="text-sm text-gray-700">Usuário ativo</label>
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-3">
              <button onClick={() => setShowUserModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSaveUser}
                disabled={savingUser || !formUser.usuario.trim() || !formUser.nome.trim()}
                style={{ backgroundColor: '#4848A8' }}
                className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {savingUser ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Perfil ── */}
      {showPerfilModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div style={{ backgroundColor: '#1F1F4D' }} className="px-5 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-white font-semibold">{editingPerfil ? 'Editar Perfil' : 'Novo Perfil'}</h2>
              <button onClick={() => setShowPerfilModal(false)} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Nome do perfil *</label>
                <input className={inputCls} placeholder="Ex: Secretaria — Completo"
                  value={formPerfil.nome} onChange={e => setFormPerfil(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Descrição</label>
                <input className={inputCls} placeholder="Breve descrição do perfil"
                  value={formPerfil.descricao} onChange={e => setFormPerfil(f => ({ ...f, descricao: e.target.value }))} />
              </div>

              <div>
                <label className={labelCls}>Permissões</label>
                {/* Admin total */}
                <div className="mb-3 flex items-center gap-2 p-3 rounded-lg border border-indigo-200 bg-indigo-50">
                  <input type="checkbox" id="perm-admin" checked={formPerfil.permissoes.includes('*')}
                    onChange={toggleAllAdmin} className="w-4 h-4 accent-indigo-600" />
                  <label htmlFor="perm-admin" className="text-sm font-semibold text-indigo-700">
                    Acesso total (administrador)
                  </label>
                </div>

                {/* Por módulo */}
                {!formPerfil.permissoes.includes('*') && (
                  <div className="space-y-3">
                    {MODULOS_PERM.map(mod => (
                      <div key={mod.key} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{mod.label}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {ACOES_PERM.map(acao => {
                            const perm = `${mod.key}.${acao.key}`
                            return (
                              <label key={perm} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                  checked={formPerfil.permissoes.includes(perm)}
                                  onChange={() => togglePerm(perm)}
                                  className="w-4 h-4 accent-indigo-600" />
                                <span className="text-sm text-gray-700">{acao.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 pb-5 flex justify-end gap-3">
              <button onClick={() => setShowPerfilModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSavePerfil} disabled={savingPerfil || !formPerfil.nome.trim()}
                style={{ backgroundColor: '#4848A8' }}
                className="px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {savingPerfil ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete: Usuário ── */}
      {confirmDeleteUser !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <p className="font-semibold mb-1">Excluir usuário?</p>
            <p className="text-sm text-gray-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDeleteUser(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancelar</button>
              <button onClick={() => handleDeleteUser(confirmDeleteUser)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete: Perfil ── */}
      {confirmDeletePerfil !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-2xl mb-3">⚠️</p>
            <p className="font-semibold mb-1">Excluir perfil?</p>
            <p className="text-sm text-gray-500 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDeletePerfil(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancelar</button>
              <button onClick={() => handleDeletePerfil(confirmDeletePerfil)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
