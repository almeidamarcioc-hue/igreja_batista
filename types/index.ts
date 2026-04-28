// ─── Secretaria types ──────────────────────────────────────────────────────

export interface Pastor {
  id: number
  nome: string
  telefone: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  imagem: string
}

export interface AgendamentoPastoral {
  id: number
  nome_fiel: string
  telefone: string
  assunto: string
  pastor_id: number
  data: string
  hora: string
  duracao_min: number
  status: string
  recorrencia: string
  observacoes: string
  data_criacao: string
  lembrete_enviado: number
  confirmacao_enviada: number
  pastor_nome?: string
  pastor_tel?: string
}

export interface Bloqueio {
  id: number
  pastor_id: number
  data: string
  hora: string
  motivo: string
  data_criacao: string
  pastor_nome?: string
}

export interface Fiel {
  id: number
  nome: string
  telefone: string
  email: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  observacoes: string
  data_criacao: string
}

export interface Configuracoes {
  id: number
  horas_lembrete: number
  msg_confirmacao: string
  msg_lembrete: string
  msg_cancelamento: string
  msg_remarcacao: string
  msg_pastor: string
}

export interface HorarioAtendimento {
  dia_semana: number
  ativo: boolean
  inicio: string
  intervalo_inicio: string | null
  intervalo_fim: string | null
  fim: string
}

export interface Ferias {
  id: number
  pastor_id: number
  data_inicio: string
  data_fim: string
  motivo: string
  data_criacao: string
}

export interface Slot {
  tipo: 'confirmado' | 'pendente' | 'bloqueado'
  dados: Record<string, unknown>
}

// ─── Educational types ─────────────────────────────────────────────────────

export interface Professor {
  id: number
  nome: string
  email: string
  telefone: string
  disciplina: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  observacoes: string
  data_criacao: string
}

export interface Turma {
  id: number
  nome: string
  descricao: string
  professor_id: number | null
  professor_nome?: string
  turno: string
  ano_letivo: string
  ativo: boolean
  data_criacao: string
}

export interface Aluno {
  id: number
  nome: string
  email: string
  telefone: string
  data_nascimento: string
  turma_id: number | null
  turma_nome?: string
  responsavel: string
  telefone_responsavel: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  observacoes: string
  ativo: boolean
  data_criacao: string
}

export interface AgendamentoEdu {
  id: number
  turma_id: number
  aluno_id: number | null
  professor_id: number | null
  data: string
  hora: string
  duracao_min: number
  assunto: string
  status: 'confirmado' | 'cancelado' | 'remarcado'
  observacoes: string
  recorrencia_id: string | null
  data_criacao: string
  turma_nome?: string
  aluno_nome?: string
  professor_nome?: string
}

// Legacy alias for backward compat with old educational pages
export interface Agendamento extends AgendamentoEdu {}

// ─── Auth types ────────────────────────────────────────────────────────────

export interface Usuario {
  id: number
  usuario: string
  nome: string
  role: string
  modulos: string
  ativo: boolean
  data_criacao: string
}

// ─── Financial types ───────────────────────────────────────────────────────

export interface Ministerio {
  id: number
  nome: string
  descricao: string
  orcamento_anual: number
  responsavel: string
  ativa: boolean
  data_criacao: string
}

export interface Conta {
  id: number
  tipo: 'bancaria' | 'caixa'
  nome: string
  instituicao?: string
  agencia?: string
  numero_conta?: string
  saldo_inicial: number
  saldo_atual: number
  ministerio_id?: number
  ministerio_nome?: string
  ativa: boolean
  data_criacao: string
  data_atualizacao: string
}

export interface ContaReceber {
  id: number
  descricao: string
  tipo: 'dizimo' | 'oferta' | 'doacao' | 'evento' | 'outro'
  ministerio_id?: number
  ministerio_nome?: string
  conta_id: number
  conta_nome?: string
  valor: number
  data_vencimento: string
  data_recebimento?: string
  forma_pagamento: string
  status: 'aberto' | 'recebido' | 'cancelado'
  observacoes: string
  data_criacao: string
  data_atualizacao: string
}

export interface ContaPagar {
  id: number
  descricao: string
  tipo: 'aluguel' | 'energia' | 'salario' | 'compra' | 'outro'
  fornecedor?: string
  ministerio_id?: number
  ministerio_nome?: string
  conta_id: number
  conta_nome?: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  forma_pagamento: string
  status: 'pendente' | 'pago' | 'cancelado'
  observacoes: string
  data_criacao: string
  data_atualizacao: string
}

export interface HistoricoSaldo {
  id: number
  conta_id: number
  saldo_anterior: number
  saldo_novo: number
  tipo_movimento: 'recebimento' | 'pagamento' | 'ajuste'
  referencia_id?: number
  descricao: string
  data_criacao: string
}

// Dashboard types
export interface SaldoConta {
  id: number
  nome: string
  tipo: 'bancaria' | 'caixa'
  saldo_inicial: number
  saldo_atual: number
  recebido_este_mes: number
  pago_este_mes: number
  ministerio?: string
  ultima_atualizacao: string
}

export interface Cobertura30Dias {
  data_consulta: string
  saldo_atual: number
  entrada_esperada_30d: number
  saida_esperada_30d: number
  diferenca: number
  dias_de_caixa: number
  cobertura_ok: boolean
  alertas: string[]
}

export interface SaudeMinisterio {
  id: number
  nome: string
  saldo_atual: number
  orcamento_anual: number
  gasto_ano: number
  percentual_utilizado: number
  status: 'verde' | 'amarelo' | 'vermelho'
  tendencia: 'subindo' | 'descendo' | 'estavel'
}
