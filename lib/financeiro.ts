import { neon } from '@neondatabase/serverless'
import {
  Ministerio,
  Conta,
  ContaReceber,
  ContaPagar,
  HistoricoSaldo,
  SaldoConta,
  Cobertura30Dias,
  SaudeMinisterio,
} from '@/types'

// ─── Conexão ────────────────────────────────────────────────────────────────

function getDb() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL não configurado.')
  const url = raw
    .replace(/[?&]channel_binding=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '')
  return neon(url)
}

// ─── Ministérios ────────────────────────────────────────────────────────────

export async function getMinisterios(): Promise<Ministerio[]> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM ministerios WHERE ativa = TRUE ORDER BY nome`
  return rows as Ministerio[]
}

export async function getMinisterio(id: number): Promise<Ministerio | null> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM ministerios WHERE id = ${id}`
  return (rows[0] ?? null) as Ministerio | null
}

export async function criarMinisterio(dados: Partial<Ministerio>): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO ministerios (nome, descricao, orcamento_anual, responsavel, ativa)
    VALUES (${dados.nome ?? ''}, ${dados.descricao ?? ''}, ${dados.orcamento_anual ?? 0}, ${dados.responsavel ?? ''}, true)
    RETURNING id
  `
  return (rows[0] as { id: number }).id
}

export async function updateMinisterio(id: number, dados: Partial<Ministerio>): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE ministerios
    SET
      nome = COALESCE(${dados.nome ?? null}, nome),
      descricao = COALESCE(${dados.descricao ?? null}, descricao),
      orcamento_anual = COALESCE(${dados.orcamento_anual ?? null}, orcamento_anual),
      responsavel = COALESCE(${dados.responsavel ?? null}, responsavel),
      ativa = COALESCE(${dados.ativa ?? null}, ativa)
    WHERE id = ${id}
  `
}

export async function deleteMinisterio(id: number): Promise<void> {
  const sql = getDb()
  await sql`UPDATE ministerios SET ativa = FALSE WHERE id = ${id}`
}

// ─── Contas ─────────────────────────────────────────────────────────────────

export async function getContas(): Promise<Conta[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT c.*, m.nome AS ministerio_nome
    FROM contas c
    LEFT JOIN ministerios m ON c.ministerio_id = m.id
    WHERE c.ativa = TRUE
    ORDER BY c.data_criacao DESC
  `
  return rows as Conta[]
}

export async function getConta(id: number): Promise<Conta | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT c.*, m.nome AS ministerio_nome
    FROM contas c
    LEFT JOIN ministerios m ON c.ministerio_id = m.id
    WHERE c.id = ${id}
  `
  return (rows[0] ?? null) as Conta | null
}

export async function getContasPorMinisterio(ministerioId: number): Promise<Conta[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT c.*, m.nome AS ministerio_nome
    FROM contas c
    LEFT JOIN ministerios m ON c.ministerio_id = m.id
    WHERE c.ministerio_id = ${ministerioId} AND c.ativa = TRUE
    ORDER BY c.nome
  `
  return rows as Conta[]
}

export async function criarConta(dados: Partial<Conta>): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO contas (tipo, nome, instituicao, agencia, numero_conta, saldo_inicial, saldo_atual, ministerio_id, ativa)
    VALUES (
      ${dados.tipo ?? 'caixa'},
      ${dados.nome ?? ''},
      ${dados.instituicao ?? ''},
      ${dados.agencia ?? ''},
      ${dados.numero_conta ?? ''},
      ${dados.saldo_inicial ?? 0},
      ${dados.saldo_inicial ?? 0},
      ${dados.ministerio_id ?? null},
      true
    )
    RETURNING id
  `
  return (rows[0] as { id: number }).id
}

export async function updateConta(id: number, dados: Partial<Conta>): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE contas
    SET
      tipo = COALESCE(${dados.tipo ?? null}, tipo),
      nome = COALESCE(${dados.nome ?? null}, nome),
      instituicao = COALESCE(${dados.instituicao ?? null}, instituicao),
      agencia = COALESCE(${dados.agencia ?? null}, agencia),
      numero_conta = COALESCE(${dados.numero_conta ?? null}, numero_conta),
      ministerio_id = COALESCE(${dados.ministerio_id ?? null}, ministerio_id),
      data_atualizacao = NOW()
    WHERE id = ${id}
  `
}

export async function deleteConta(id: number): Promise<void> {
  const sql = getDb()
  await sql`UPDATE contas SET ativa = FALSE WHERE id = ${id}`
}

// ─── Contas a Receber ───────────────────────────────────────────────────────

export async function getContasReceber(filtros?: {
  status?: string
  ministerioId?: number
  dataInicio?: string
  dataFim?: string
}): Promise<ContaReceber[]> {
  const sql = getDb()
  let query = `
    SELECT cr.*, m.nome AS ministerio_nome, c.nome AS conta_nome
    FROM contas_receber cr
    LEFT JOIN ministerios m ON cr.ministerio_id = m.id
    LEFT JOIN contas c ON cr.conta_id = c.id
    WHERE 1=1
  `

  const params: unknown[] = []

  if (filtros?.status) {
    query += ` AND cr.status = $${params.length + 1}`
    params.push(filtros.status)
  }

  if (filtros?.ministerioId) {
    query += ` AND cr.ministerio_id = $${params.length + 1}`
    params.push(filtros.ministerioId)
  }

  if (filtros?.dataInicio) {
    query += ` AND cr.data_vencimento >= $${params.length + 1}`
    params.push(filtros.dataInicio)
  }

  if (filtros?.dataFim) {
    query += ` AND cr.data_vencimento <= $${params.length + 1}`
    params.push(filtros.dataFim)
  }

  query += ` ORDER BY cr.data_vencimento DESC`

  const rows = await sql(query, params as any[])
  return rows as ContaReceber[]
}

export async function getContaReceber(id: number): Promise<ContaReceber | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT cr.*, m.nome AS ministerio_nome, c.nome AS conta_nome
    FROM contas_receber cr
    LEFT JOIN ministerios m ON cr.ministerio_id = m.id
    LEFT JOIN contas c ON cr.conta_id = c.id
    WHERE cr.id = ${id}
  `
  return (rows[0] ?? null) as ContaReceber | null
}

export async function criarContaReceber(dados: Partial<ContaReceber>): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO contas_receber (
      descricao, tipo, ministerio_id, conta_id, valor, data_vencimento,
      forma_pagamento, status, observacoes
    ) VALUES (
      ${dados.descricao ?? ''},
      ${dados.tipo ?? 'oferta'},
      ${dados.ministerio_id ?? null},
      ${dados.conta_id ?? 0},
      ${dados.valor ?? 0},
      ${dados.data_vencimento ?? new Date().toISOString().split('T')[0]}::date,
      ${dados.forma_pagamento ?? ''},
      'aberto',
      ${dados.observacoes ?? ''}
    )
    RETURNING id
  `
  return (rows[0] as { id: number }).id
}

export async function updateContaReceber(id: number, dados: Partial<ContaReceber>): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE contas_receber
    SET
      descricao = COALESCE(${dados.descricao ?? null}, descricao),
      tipo = COALESCE(${dados.tipo ?? null}, tipo),
      valor = COALESCE(${dados.valor ?? null}, valor),
      data_vencimento = COALESCE(${dados.data_vencimento ?? null}::date, data_vencimento),
      forma_pagamento = COALESCE(${dados.forma_pagamento ?? null}, forma_pagamento),
      status = COALESCE(${dados.status ?? null}, status),
      data_recebimento = COALESCE(${dados.data_recebimento ?? null}::date, data_recebimento),
      observacoes = COALESCE(${dados.observacoes ?? null}, observacoes),
      data_atualizacao = NOW()
    WHERE id = ${id}
  `
}

export async function deleteContaReceber(id: number): Promise<void> {
  const sql = getDb()
  const conta = await getContaReceber(id)
  if (conta?.status === 'aberto') {
    await sql`DELETE FROM contas_receber WHERE id = ${id}`
  }
}

// ─── Contas a Pagar ─────────────────────────────────────────────────────────

export async function getContasPagar(filtros?: {
  status?: string
  ministerioId?: number
  dataInicio?: string
  dataFim?: string
}): Promise<ContaPagar[]> {
  const sql = getDb()
  let query = `
    SELECT cp.*, m.nome AS ministerio_nome, c.nome AS conta_nome
    FROM contas_pagar cp
    LEFT JOIN ministerios m ON cp.ministerio_id = m.id
    LEFT JOIN contas c ON cp.conta_id = c.id
    WHERE 1=1
  `

  const params: unknown[] = []

  if (filtros?.status) {
    query += ` AND cp.status = $${params.length + 1}`
    params.push(filtros.status)
  }

  if (filtros?.ministerioId) {
    query += ` AND cp.ministerio_id = $${params.length + 1}`
    params.push(filtros.ministerioId)
  }

  if (filtros?.dataInicio) {
    query += ` AND cp.data_vencimento >= $${params.length + 1}`
    params.push(filtros.dataInicio)
  }

  if (filtros?.dataFim) {
    query += ` AND cp.data_vencimento <= $${params.length + 1}`
    params.push(filtros.dataFim)
  }

  query += ` ORDER BY cp.data_vencimento DESC`

  const rows = await sql(query, params as any[])
  return rows as ContaPagar[]
}

export async function getContaPagar(id: number): Promise<ContaPagar | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT cp.*, m.nome AS ministerio_nome, c.nome AS conta_nome
    FROM contas_pagar cp
    LEFT JOIN ministerios m ON cp.ministerio_id = m.id
    LEFT JOIN contas c ON cp.conta_id = c.id
    WHERE cp.id = ${id}
  `
  return (rows[0] ?? null) as ContaPagar | null
}

export async function criarContaPagar(dados: Partial<ContaPagar>): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO contas_pagar (
      descricao, tipo, fornecedor, ministerio_id, conta_id, valor,
      data_vencimento, forma_pagamento, status, observacoes
    ) VALUES (
      ${dados.descricao ?? ''},
      ${dados.tipo ?? 'outro'},
      ${dados.fornecedor ?? ''},
      ${dados.ministerio_id ?? null},
      ${dados.conta_id ?? 0},
      ${dados.valor ?? 0},
      ${dados.data_vencimento ?? new Date().toISOString().split('T')[0]}::date,
      ${dados.forma_pagamento ?? ''},
      'pendente',
      ${dados.observacoes ?? ''}
    )
    RETURNING id
  `
  return (rows[0] as { id: number }).id
}

export async function updateContaPagar(id: number, dados: Partial<ContaPagar>): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE contas_pagar
    SET
      descricao = COALESCE(${dados.descricao ?? null}, descricao),
      tipo = COALESCE(${dados.tipo ?? null}, tipo),
      fornecedor = COALESCE(${dados.fornecedor ?? null}, fornecedor),
      valor = COALESCE(${dados.valor ?? null}, valor),
      data_vencimento = COALESCE(${dados.data_vencimento ?? null}::date, data_vencimento),
      forma_pagamento = COALESCE(${dados.forma_pagamento ?? null}, forma_pagamento),
      status = COALESCE(${dados.status ?? null}, status),
      data_pagamento = COALESCE(${dados.data_pagamento ?? null}::date, data_pagamento),
      observacoes = COALESCE(${dados.observacoes ?? null}, observacoes),
      data_atualizacao = NOW()
    WHERE id = ${id}
  `
}

export async function deleteContaPagar(id: number): Promise<void> {
  const sql = getDb()
  const conta = await getContaPagar(id)
  if (conta?.status === 'pendente') {
    await sql`DELETE FROM contas_pagar WHERE id = ${id}`
  }
}

// ─── Dashboard: Saldo por Conta ──────────────────────────────────────────────

export async function getSaldoPorConta(): Promise<SaldoConta[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT
      c.id,
      c.nome,
      c.tipo,
      c.saldo_inicial,
      c.saldo_atual,
      COALESCE(SUM(CASE WHEN cr.status = 'recebido' THEN cr.valor ELSE 0 END), 0) AS recebido_este_mes,
      COALESCE(SUM(CASE WHEN cp.status = 'pago' THEN cp.valor ELSE 0 END), 0) AS pago_este_mes,
      m.nome AS ministerio,
      c.data_atualizacao AS ultima_atualizacao
    FROM contas c
    LEFT JOIN ministerios m ON c.ministerio_id = m.id
    LEFT JOIN contas_receber cr ON c.id = cr.conta_id AND EXTRACT(MONTH FROM cr.data_recebimento) = EXTRACT(MONTH FROM NOW())
    LEFT JOIN contas_pagar cp ON c.id = cp.conta_id AND EXTRACT(MONTH FROM cp.data_pagamento) = EXTRACT(MONTH FROM NOW())
    WHERE c.ativa = TRUE
    GROUP BY c.id, m.id
    ORDER BY c.nome
  `
  return rows as SaldoConta[]
}

// ─── Dashboard: Cobertura 30 Dias ───────────────────────────────────────────

export async function getCobertura30Dias(): Promise<Cobertura30Dias> {
  const sql = getDb()
  
  const hoje = new Date().toISOString().split('T')[0]
  const daqui30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Entradas esperadas (abertos nos próx 30 dias)
  const entradaRows = await sql`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM contas_receber
    WHERE status = 'aberto'
      AND data_vencimento >= ${hoje}::date
      AND data_vencimento <= ${daqui30dias}::date
  `
  const entrada = Number((entradaRows[0] as { total: string }).total)

  // Saídas esperadas (pendentes nos próx 30 dias)
  const saidaRows = await sql`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM contas_pagar
    WHERE status = 'pendente'
      AND data_vencimento >= ${hoje}::date
      AND data_vencimento <= ${daqui30dias}::date
  `
  const saida = Number((saidaRows[0] as { total: string }).total)

  // Saldo total
  const saldoRows = await sql`
    SELECT COALESCE(SUM(saldo_atual), 0) AS total
    FROM contas
    WHERE ativa = TRUE
  `
  const saldoAtual = Number((saldoRows[0] as { total: string }).total)

  const diferenca = entrada - saida
  const diasDeCaixa = saida > 0 ? Math.floor(saldoAtual / (saida / 30)) : 999
  const alertas: string[] = []

  if (diferenca < 0) {
    alertas.push(`⚠️ Déficit de R$ ${Math.abs(diferenca).toFixed(2)} nos próx 30 dias`)
  }
  if (diasDeCaixa < 30) {
    alertas.push(`⚠️ Apenas ${diasDeCaixa} dias de caixa disponível`)
  }

  return {
    data_consulta: hoje,
    saldo_atual: saldoAtual,
    entrada_esperada_30d: entrada,
    saida_esperada_30d: saida,
    diferenca,
    dias_de_caixa: diasDeCaixa,
    cobertura_ok: diferenca >= 0,
    alertas,
  }
}

// ─── Dashboard: Saúde por Ministério ────────────────────────────────────────

export async function getSaudeMinisterios(): Promise<SaudeMinisterio[]> {
  const sql = getDb()
  const thisYear = new Date().getFullYear()

  const rows = await sql`
    SELECT
      m.id,
      m.nome,
      COALESCE(SUM(c.saldo_atual), 0) AS saldo_atual,
      m.orcamento_anual,
      COALESCE(SUM(CASE WHEN cp.status = 'pago' AND EXTRACT(YEAR FROM cp.data_pagamento) = ${thisYear} THEN cp.valor ELSE 0 END), 0) AS gasto_ano
    FROM ministerios m
    LEFT JOIN contas c ON m.id = c.ministerio_id AND c.ativa = TRUE
    LEFT JOIN contas_pagar cp ON m.id = cp.ministerio_id
    WHERE m.ativa = TRUE
    GROUP BY m.id
    ORDER BY m.nome
  `

  return (rows as any[]).map((row) => {
    const gastoAno = Number(row.gasto_ano)
    const orcamentoAnual = Number(row.orcamento_anual)
    const percentualUtilizado = orcamentoAnual > 0 ? (gastoAno / orcamentoAnual) * 100 : 0
    let status: 'verde' | 'amarelo' | 'vermelho' = 'verde'
    let tendencia: 'subindo' | 'descendo' | 'estavel' = 'estavel'

    if (percentualUtilizado >= 100) {
      status = 'vermelho'
      tendencia = 'subindo'
    } else if (percentualUtilizado >= 80) {
      status = 'amarelo'
      tendencia = 'subindo'
    }

    return {
      id: Number(row.id),
      nome: row.nome,
      saldo_atual: Number(row.saldo_atual),
      orcamento_anual: orcamentoAnual,
      gasto_ano: gastoAno,
      percentual_utilizado: Math.round(percentualUtilizado * 100) / 100,
      status,
      tendencia,
    }
  })
}

// ─── Histórico de Saldo ──────────────────────────────────────────────────────

export async function getHistoricoSaldo(contaId: number, limite = 100): Promise<HistoricoSaldo[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT *
    FROM historico_saldo
    WHERE conta_id = ${contaId}
    ORDER BY data_criacao DESC
    LIMIT ${limite}
  `
  return rows as HistoricoSaldo[]
}
