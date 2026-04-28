# 📊 Módulo Financeiro - Especificação Completa

## 1. ESTRUTURA DE TABELAS

### 1.1 Plano de Contas (`contas`)
Armazena todas as contas bancárias e caixas fixos.

```sql
CREATE TABLE contas (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL,  -- 'bancaria' | 'caixa'
  nome VARCHAR(100) NOT NULL,
  instituicao VARCHAR(100),  -- Bradesco, Itaú, etc. (só para contas bancárias)
  agencia VARCHAR(20),
  numero_conta VARCHAR(30),
  saldo_inicial DECIMAL(12,2) DEFAULT 0,
  saldo_atual DECIMAL(12,2) DEFAULT 0,
  ministério_id INTEGER REFERENCES ministerios(id),
  ativa BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Ministérios (`ministerios`)
Categorização de departamentos/ministérios.

```sql
CREATE TABLE ministerios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT DEFAULT '',
  orcamento_anual DECIMAL(14,2) DEFAULT 0,
  responsavel VARCHAR(100),
  ativa BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Contas a Receber (`contas_receber`)
Dízimos, ofertas, doações, eventos.

```sql
CREATE TABLE contas_receber (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,  -- 'dizimo' | 'oferta' | 'doacao' | 'evento' | 'outro'
  ministério_id INTEGER REFERENCES ministerios(id),
  conta_id INTEGER NOT NULL REFERENCES contas(id),
  valor DECIMAL(12,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  forma_pagamento VARCHAR(30),  -- 'dinheiro' | 'pix' | 'transferencia' | 'cheque'
  status VARCHAR(20) DEFAULT 'aberto',  -- 'aberto' | 'recebido' | 'cancelado'
  observacoes TEXT DEFAULT '',
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT status_valido CHECK (status IN ('aberto', 'recebido', 'cancelado'))
);
```

### 1.4 Contas a Pagar (`contas_pagar`)
Aluguel, energia, salários, compras.

```sql
CREATE TABLE contas_pagar (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,  -- 'aluguel' | 'energia' | 'salario' | 'compra' | 'outro'
  fornecedor VARCHAR(150),
  ministério_id INTEGER REFERENCES ministerios(id),
  conta_id INTEGER NOT NULL REFERENCES contas(id),
  valor DECIMAL(12,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  forma_pagamento VARCHAR(30),  -- 'dinheiro' | 'pix' | 'transferencia' | 'cheque'
  status VARCHAR(20) DEFAULT 'pendente',  -- 'pendente' | 'pago' | 'cancelado'
  observacoes TEXT DEFAULT '',
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT status_valido CHECK (status IN ('pendente', 'pago', 'cancelado'))
);
```

### 1.5 Histórico de Saldo (`historico_saldo`)
Auditoria de movimentações (gerado por triggers).

```sql
CREATE TABLE historico_saldo (
  id SERIAL PRIMARY KEY,
  conta_id INTEGER NOT NULL REFERENCES contas(id),
  saldo_anterior DECIMAL(12,2),
  saldo_novo DECIMAL(12,2),
  tipo_movimento VARCHAR(30),  -- 'recebimento' | 'pagamento' | 'ajuste'
  referencia_id INTEGER,  -- ID da conta_receber ou conta_pagar
  descricao TEXT,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. FÓRMULAS DE CÁLCULO

### 2.1 Saldo Atualizado por Conta
```
Saldo Atual = Saldo Inicial + ∑(Recebimentos) - ∑(Pagamentos)

Onde:
- Recebimentos = SUM(contas_receber.valor) WHERE status='recebido'
- Pagamentos = SUM(contas_pagar.valor) WHERE status='pago'
```

### 2.2 Saldo por Ministério
```
Saldo Ministério = ∑(Saldo Atual de todas as contas do ministério)
```

### 2.3 Fluxo de Caixa - Cobertura (30 dias)
```
Entrada Esperada (30 dias) = ∑(contas_receber.valor) 
  WHERE data_vencimento <= HOJE + 30 dias AND status='aberto'

Saída Esperada (30 dias) = ∑(contas_pagar.valor) 
  WHERE data_vencimento <= HOJE + 30 dias AND status='pendente'

Cobertura = Entrada Esperada - Saída Esperada

Interpretação:
- > 0: Há superávit, entrada cobre saída
- = 0: Equilibrio perfeito
- < 0: Há déficit, saída > entrada (RISCO!)
```

### 2.4 Variação Diária
```
Variação Diária = Saldo de Hoje - Saldo de Ontem
```

### 2.5 Orçamento vs Realizado (por Ministério, período)
```
Realizado = ∑(contas_pagar.valor) 
  WHERE status='pago' AND ministério_id=X AND BETWEEN data_inicio E data_fim

Percentual Utilizado = (Realizado / Orçamento) × 100

Status:
- Verde: 0-80% (normal)
- Amarelo: 80-100% (atenção)
- Vermelho: >100% (excedido)
```

---

## 3. INDICADORES (KPIs) DO DASHBOARD

### 3.1 Caixa Geral
| KPI | Cálculo | Meta | Alerta |
|-----|---------|------|--------|
| **Saldo Total** | ∑(saldo_atual) todas contas | > R$ 0 | < R$ 5.000 |
| **Entrada 30d** | ∑(contas_receber abertos próx 30d) | Tendência | - |
| **Saída 30d** | ∑(contas_pagar pendentes próx 30d) | Tendência | - |
| **Cobertura** | Entrada - Saída | > 0 | ⚠️ Se < 0 |
| **Dias de Caixa** | Saldo Total / (Saída 30d / 30) | > 90 dias | < 30 dias |

### 3.2 Por Ministério
| KPI | Cálculo | Tipo |
|-----|---------|------|
| **Saldo Atual** | ∑ saldo contas ministério | Número |
| **% Orçamento Usado** | (Realizado / Orçamento) × 100 | Percentual |
| **Status Orçamentário** | Verde/Amarelo/Vermelho | Status |
| **Pendências** | ∑ contas_pagar pendentes | Número |

### 3.3 Análise de Fluxo
| Métrica | Descrição |
|---------|-----------|
| **Concentração de Recebimentos** | % de receita nos 5 maiores dízimos |
| **Tipo de Receita** | % Dízimos vs Ofertas vs Doações |
| **Tipo de Despesa** | % Aluguel vs Energia vs Salários vs Outros |
| **Prazo Médio Recebimento** | Dias entre vencimento e recebimento |
| **Prazo Médio Pagamento** | Dias entre vencimento e pagamento |

---

## 4. ESTRUTURA DE RESPOSTA DAS APIs

### 4.1 Saldo por Conta
```json
{
  "id": 1,
  "nome": "Conta Principal - Bradesco",
  "tipo": "bancaria",
  "saldo_inicial": 5000.00,
  "saldo_atual": 12450.50,
  "recebido_este_mes": 8500.00,
  "pago_este_mes": 1050.00,
  "ministério": "Geral",
  "ultima_atualizacao": "2026-04-28T10:30:00Z"
}
```

### 4.2 Cobertura 30 Dias
```json
{
  "data_consulta": "2026-04-28",
  "saldo_atual": 12450.50,
  "entrada_esperada_30d": 25000.00,
  "saida_esperada_30d": 18500.00,
  "diferenca": 6500.00,
  "dias_de_caixa": 20,
  "cobertura_ok": true,
  "alertas": []
}
```

### 4.3 Saúde por Ministério
```json
{
  "ministerios": [
    {
      "id": 1,
      "nome": "Louvor",
      "saldo_atual": 2500.00,
      "orcamento_anual": 12000.00,
      "gasto_ano": 9500.00,
      "percentual_utilizado": 79.17,
      "status": "amarelo",
      "tendencia": "subindo"
    }
  ]
}
```

---

## 5. FLUXOS PRINCIPAIS

### 5.1 Registrar Recebimento (Dízimo/Oferta)
1. Criar registro em `contas_receber` (status='aberto')
2. Ao receber, atualizar `data_recebimento` e `status='recebido'`
3. Trigger atualiza `contas.saldo_atual` e cria registro em `historico_saldo`
4. Dashboard reflete mudança em tempo real

### 5.2 Registrar Despesa (Conta a Pagar)
1. Criar registro em `contas_pagar` (status='pendente')
2. Ao pagar, atualizar `data_pagamento` e `status='pago'`
3. Trigger atualiza `contas.saldo_atual` e cria registro em `historico_saldo`
4. Validar se há saldo suficiente (alerta se não houver)

### 5.3 Gerar Relatório de Cobertura
1. Consultar contas_receber com `data_vencimento` nos próx 30 dias
2. Consultar contas_pagar com `data_vencimento` nos próx 30 dias
3. Calcular: Entrada - Saída
4. Retornar status (OK / ATENÇÃO / CRÍTICO)

---

## 6. REGRAS DE NEGÓCIO

✅ **Validações Obrigatórias:**
- Não permitir criar conta com saldo inicial negativo
- Não permitir pagamento se não houver saldo (alerta sim, bloqueio não)
- Datas de vencimento devem ser >= data de criação
- Orçamento ministério deve ser >= 0
- Ao deletar ministério, não deletar contas (apenas desvincular)

✅ **Triggers necessários:**
- UPDATE contas.saldo_atual quando houver recebimento/pagamento
- INSERT historico_saldo para cada movimento
- UPDATE contas.data_atualizacao após qualquer mudança

✅ **Permissões (para implementar):**
- `financeiro.visualizar` - Ler todas as movimentações
- `financeiro.criar` - Criar receitas/despesas
- `financeiro.editar` - Editar movimentações não finalizadas
- `financeiro.excluir` - Deletar movimentações abertas
- `financeiro.admin` - Acesso completo + ajustes manuais

---

## 7. SEQUÊNCIA DE IMPLEMENTAÇÃO

1. ✅ Criar tabelas no `lib/db.ts`
2. ✅ Criar tipos em `types/index.ts`
3. ✅ Criar APIs: contas, contas_receber, contas_pagar
4. ✅ Criar APIs: dashboard, relatórios
5. ✅ Criar componentes frontend: listagens, formulários
6. ✅ Criar dashboard com KPIs
7. ✅ Adicionar triggers PostgreSQL
8. ✅ Testes e validações

