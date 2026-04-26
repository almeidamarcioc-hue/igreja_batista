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
