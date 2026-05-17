'use client'

export default function ApisPage() {
  const apisAbertas = [
    {
      rota: '/api/apelo',
      metodo: 'POST',
      descricao: 'Registrar novo crente durante apelo',
      campos: 'nome_responsavel, data_cadastro, nome, telefone, idade?, endereco?, numero?, complemento?, bairro?, cidade?, uf?',
      autenticacao: false,
    },
    {
      rota: '/api/auth/login',
      metodo: 'POST',
      descricao: 'Fazer login no sistema',
      campos: 'usuario, senha',
      autenticacao: false,
    },
    {
      rota: '/api/auth/logout',
      metodo: 'POST',
      descricao: 'Fazer logout do sistema',
      campos: 'nenhum',
      autenticacao: false,
    },
    {
      rota: '/api/auth/forgot-password',
      metodo: 'POST',
      descricao: 'Solicitar reset de senha',
      campos: 'email',
      autenticacao: false,
    },
    {
      rota: '/api/auth/reset-password',
      metodo: 'POST',
      descricao: 'Resetar senha com token',
      campos: 'token, nova_senha',
      autenticacao: false,
    },
    {
      rota: '/api/admin/criar-pastor',
      metodo: 'POST',
      descricao: 'Criar novo pastor (apenas inicialização)',
      campos: 'nome, telefone',
      autenticacao: false,
    },
    {
      rota: '/api/admin/check-usuario',
      metodo: 'POST',
      descricao: 'Verificar se usuário já existe',
      campos: 'usuario',
      autenticacao: false,
    },
    {
      rota: '/api/init',
      metodo: 'GET',
      descricao: 'Inicializar banco de dados',
      campos: 'nenhum',
      autenticacao: false,
    },
    {
      rota: '/api/configuracoes/slides',
      metodo: 'GET',
      descricao: 'Obter slides do carousel (usado no login)',
      campos: 'nenhum',
      autenticacao: false,
    },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', color: '#1f2937' }}>🔌 APIs Públicas</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Rotas abertas do sistema que não requerem autenticação</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {apisAbertas.map((api, idx) => (
              <div key={idx} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{
                    backgroundColor: api.metodo === 'POST' ? '#ef4444' : '#3b82f6',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {api.metodo}
                  </span>
                  <code style={{
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    padding: '8px 12px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: '#1f2937',
                    overflow: 'auto',
                  }}>
                    {api.rota}
                  </code>
                  <span style={{
                    backgroundColor: api.autenticacao ? '#fee2e2' : '#dcfce7',
                    color: api.autenticacao ? '#991b1b' : '#166534',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    {api.autenticacao ? '🔒 Autenticada' : '🔓 Pública'}
                  </span>
                </div>

                <p style={{ fontSize: 14, color: '#1f2937', margin: '0 0 12px 0', fontWeight: 500 }}>
                  {api.descricao}
                </p>

                <div style={{ backgroundColor: '#f9fafb', borderRadius: 6, padding: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                    Campos
                  </p>
                  <code style={{
                    fontSize: 12,
                    color: '#374151',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {api.campos}
                  </code>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, padding: 20, backgroundColor: '#eff6ff', borderRadius: 8, borderLeft: '4px solid #3b82f6' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', margin: '0 0 8px 0' }}>ℹ️ Informações</h3>
            <ul style={{ fontSize: 13, color: '#1e40af', margin: '0', paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Todas as rotas abertas aceitam requisições CORS</li>
              <li>Rotas de autenticação retornam um cookie com o token de sessão</li>
              <li>O módulo /apelo é um PWA que funciona offline</li>
              <li>O módulo /conversoes tem seu próprio login em /conversoes/login</li>
              <li>Rotas protegidas requerem um cookie de sessão válido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
