# 📡 API Endpoints - Módulo Financeiro

## Base URL
```
/api/financeiro
```

---

## 1️⃣ MINISTÉRIOS

### GET `/ministerios`
Listar todos os ministérios ativos

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Louvor",
    "descricao": "Ministério de Louvor e Adoração",
    "orcamento_anual": 12000.00,
    "responsavel": "João Silva",
    "ativa": true,
    "data_criacao": "2026-04-28T10:00:00Z"
  }
]
```

### GET `/ministerios/[id]`
Obter um ministério específico

### POST `/ministerios`
Criar novo ministério

**Body:**
```json
{
  "nome": "Missões",
  "descricao": "Ministério de Missões",
  "orcamento_anual": 5000,
  "responsavel": "Maria Santos"
}
```

### PUT `/ministerios/[id]`
Atualizar ministério

**Body:**
```json
{
  "orcamento_anual": 6000,
  "responsavel": "Paulo Costa"
}
```

### DELETE `/ministerios/[id]`
Deletar ministério (soft delete)

---

## 2️⃣ CONTAS (Bancárias e Caixas)

### GET `/contas`
Listar todas as contas

**Query Params:**
- `ministerioId` (opcional) - Filtrar por ministério

**Response:**
```json
[
  {
    "id": 1,
    "tipo": "bancaria",
    "nome": "Conta Principal - Bradesco",
    "instituicao": "Bradesco",
    "agencia": "1234",
    "numero_conta": "56789-0",
    "saldo_inicial": 5000.00,
    "saldo_atual": 12450.50,
    "ministerio_id": 1,
    "ministerio_nome": "Louvor",
    "ativa": true,
    "data_criacao": "2026-04-28T10:00:00Z",
    "data_atualizacao": "2026-04-28T15:30:00Z"
  }
]
```

### GET `/contas/[id]`
Obter uma conta específica

### POST `/contas`
Criar nova conta

**Body:**
```json
{
  "tipo": "bancaria",
  "nome": "Conta Secundária",
  "instituicao": "Itaú",
  "agencia": "5678",
  "numero_conta": "12345-6",
  "saldo_inicial": 2000,
  "ministerio_id": 1
}
```

### PUT `/contas/[id]`
Atualizar conta

**Body:**
```json
{
  "nome": "Conta Principal Atualizada",
  "numero_conta": "98765-4"
}
```

### DELETE `/contas/[id]`
Deletar conta (soft delete)

---

## 3️⃣ CONTAS A RECEBER (Dízimos, Ofertas, Doações)

### GET `/contas-receber`
Listar contas a receber

**Query Params:**
- `status` (opcional) - 'aberto', 'recebido', 'cancelado'
- `ministerioId` (opcional)
- `dataInicio` (opcional) - Formato: YYYY-MM-DD
- `dataFim` (opcional) - Formato: YYYY-MM-DD

**Response:**
```json
[
  {
    "id": 1,
    "descricao": "Dízimo - Semana 1",
    "tipo": "dizimo",
    "ministerio_id": 1,
    "ministerio_nome": "Louvor",
    "conta_id": 1,
    "conta_nome": "Conta Principal - Bradesco",
    "valor": 1500.00,
    "data_vencimento": "2026-04-28",
    "data_recebimento": "2026-04-28",
    "forma_pagamento": "pix",
    "status": "recebido",
    "observacoes": "Recebido via PIX",
    "data_criacao": "2026-04-28T09:00:00Z",
    "data_atualizacao": "2026-04-28T14:00:00Z"
  }
]
```

### GET `/contas-receber/[id]`
Obter conta a receber

### POST `/contas-receber`
Criar conta a receber

**Body:**
```json
{
  "descricao": "Oferta - Célula de Oração",
  "tipo": "oferta",
  "ministerio_id": 1,
  "conta_id": 1,
  "valor": 500,
  "data_vencimento": "2026-04-30",
  "forma_pagamento": "dinheiro",
  "observacoes": "Oferta voluntária"
}
```

### PUT `/contas-receber/[id]`
Atualizar conta a receber

**Body:**
```json
{
  "status": "recebido",
  "data_recebimento": "2026-04-28",
  "observacoes": "Recebido via transferência"
}
```

### DELETE `/contas-receber/[id]`
Deletar conta a receber (apenas se status = 'aberto')

---

## 4️⃣ CONTAS A PAGAR (Aluguel, Energia, Salários, Compras)

### GET `/contas-pagar`
Listar contas a pagar

**Query Params:**
- `status` (opcional) - 'pendente', 'pago', 'cancelado'
- `ministerioId` (opcional)
- `dataInicio` (opcional)
- `dataFim` (opcional)

**Response:**
```json
[
  {
    "id": 1,
    "descricao": "Aluguel do Templo",
    "tipo": "aluguel",
    "fornecedor": "Imobiliária Vista Bela",
    "ministerio_id": null,
    "ministerio_nome": null,
    "conta_id": 1,
    "conta_nome": "Conta Principal - Bradesco",
    "valor": 2500.00,
    "data_vencimento": "2026-05-01",
    "data_pagamento": null,
    "forma_pagamento": "transferencia",
    "status": "pendente",
    "observacoes": "Aluguel referente a maio",
    "data_criacao": "2026-04-28T10:30:00Z",
    "data_atualizacao": "2026-04-28T10:30:00Z"
  }
]
```

### GET `/contas-pagar/[id]`
Obter conta a pagar

### POST `/contas-pagar`
Criar conta a pagar

**Body:**
```json
{
  "descricao": "Energia Elétrica",
  "tipo": "energia",
  "fornecedor": "Energisa",
  "conta_id": 1,
  "valor": 850.50,
  "data_vencimento": "2026-05-05",
  "forma_pagamento": "boleto",
  "observacoes": "Fatura referente a abril"
}
```

### PUT `/contas-pagar/[id]`
Atualizar conta a pagar

**Body:**
```json
{
  "status": "pago",
  "data_pagamento": "2026-04-28",
  "forma_pagamento": "pix"
}
```

### DELETE `/contas-pagar/[id]`
Deletar conta a pagar (apenas se status = 'pendente')

---

## 5️⃣ DASHBOARD

### GET `/dashboard`
Obter dados completos do dashboard

**Response:**
```json
{
  "resumo": {
    "saldo_total": 12450.50,
    "recebido_este_mes": 8500.00,
    "pago_este_mes": 1050.00
  },
  "saldo_por_conta": [
    {
      "id": 1,
      "nome": "Conta Principal - Bradesco",
      "tipo": "bancaria",
      "saldo_inicial": 5000.00,
      "saldo_atual": 12450.50,
      "recebido_este_mes": 8500.00,
      "pago_este_mes": 1050.00,
      "ministerio": "Louvor",
      "ultima_atualizacao": "2026-04-28T15:30:00Z"
    }
  ],
  "cobertura_30dias": {
    "data_consulta": "2026-04-28",
    "saldo_atual": 12450.50,
    "entrada_esperada_30d": 25000.00,
    "saida_esperada_30d": 18500.00,
    "diferenca": 6500.00,
    "dias_de_caixa": 20,
    "cobertura_ok": true,
    "alertas": []
  },
  "saude_ministerios": [
    {
      "id": 1,
      "nome": "Louvor",
      "saldo_atual": 5500.00,
      "orcamento_anual": 12000.00,
      "gasto_ano": 8500.00,
      "percentual_utilizado": 70.83,
      "status": "verde",
      "tendencia": "subindo"
    }
  ]
}
```

---

## 🛠️ EXEMPLO DE USO EM COMPONENTE REACT

### Listar Contas
```typescript
async function listarContas() {
  const res = await fetch('/api/financeiro/contas')
  const contas = await res.json()
  return contas
}
```

### Criar Conta a Receber
```typescript
async function criarReceita(dados: ContaReceber) {
  const res = await fetch('/api/financeiro/contas-receber', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  
  if (!res.ok) {
    throw new Error('Erro ao criar conta a receber')
  }
  
  return res.json()
}
```

### Registrar Recebimento
```typescript
async function registrarRecebimento(id: number) {
  const res = await fetch(`/api/financeiro/contas-receber/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'recebido',
      data_recebimento: new Date().toISOString().split('T')[0],
    }),
  })
  
  return res.json()
}
```

### Obter Dashboard
```typescript
async function carregarDashboard() {
  const res = await fetch('/api/financeiro/dashboard')
  const dashboard = await res.json()
  
  console.log('Saldo Total:', dashboard.resumo.saldo_total)
  console.log('Cobertura 30d:', dashboard.cobertura_30dias.cobertura_ok)
  console.log('Saúde Ministérios:', dashboard.saude_ministerios)
  
  return dashboard
}
```

---

## ⚠️ STATUS CODES

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **404** - Not Found
- **500** - Server Error

---

## 📋 VALIDAÇÕES

✅ **Ao criar conta a receber:**
- Valor > 0
- Data vencimento >= data atual
- Conta deve estar ativa

✅ **Ao registrar recebimento:**
- Status muda de 'aberto' → 'recebido'
- Data recebimento não pode ser antes da data vencimento

✅ **Ao criar conta a pagar:**
- Valor > 0
- Data vencimento >= data atual
- Fornecedor (opcional)

✅ **Ao registrar pagamento:**
- Status muda de 'pendente' → 'pago'
- Validar se há saldo suficiente na conta

