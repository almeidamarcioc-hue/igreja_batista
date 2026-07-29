# Fluxo de Agentes Especializados — Igreja Batista

## Visão Geral

Este projeto usa 3 agentes especializados em pipeline para garantir clareza, qualidade e rastreabilidade:

```
┌──────────────┐
│   Usuário    │ "Preciso que novos usuários tenham..."
└──────┬───────┘
       │ Demanda (vaga ou clara)
       ↓
┌──────────────────────────────────┐
│  1️⃣  ESPECIFICADOR               │
│  ├─ Recebe demanda                │
│  ├─ Lê código/padrões existentes  │
│  ├─ Escreve specs/<slug>.md       │
│  └─ Lista dúvidas pendentes       │
└──────┬───────────────────────────┘
       │ specs/<slug>.md existe, dúvidas resolvidas
       ↓
┌──────────────────────────────────┐
│  2️⃣  DESENVOLVEDOR               │
│  ├─ Valida spec (não ambígua)     │
│  ├─ Implementa código             │
│  ├─ Escreve testes em paralelo    │
│  ├─ Commits granulares            │
│  └─ Reporta bloqueadores          │
└──────┬───────────────────────────┘
       │ Código + Testes prontos
       ↓
┌──────────────────────────────────┐
│  3️⃣  QA (REVISOR)                │
│  ├─ Lê APENAS spec + código       │
│  ├─ Roda testes                   │
│  ├─ Valida cada critério Gherkin  │
│  ├─ Testa casos de borda          │
│  └─ Produz relatório PASS/FAIL    │
└──────┬───────────────────────────┘
       │ Relatório de QA
       ↓
┌──────────────────────────────────┐
│  ✅ APROVADO ou ❌ REJEITADO     │
│  (volta para desenvolvedor se ❌) │
└──────────────────────────────────┘
```

---

## Descrição de Cada Agente

### 1️⃣ ESPECIFICADOR (`especificador.md`)

**Quando acionar:**
- Novo requisito foi solicitado (feature request)
- Bug foi reportado e precisa clarificação
- Demanda é ambígua ou multifacetada
- Antes de qualquer desenvolvimento

**O que faz:**
1. Lê a demanda (pode ser vaga: "novos usuários precisam de...")
2. Consulta código existente e padrões do projeto
3. Escreve `specs/<slug>.md` com:
   - Requisitos estruturados (RF, RNF)
   - Suposições explícitas marcadas como "Precisa confirmação"
   - Critérios de aceite em formato **Gherkin** (Dado/Quando/Então)
   - Casos de borda conhecidos
   - Dependências técnicas
4. Lista "Dúvidas Pendentes" em vez de adivinhar

**Saída esperada:**
- Arquivo `specs/<slug>.md` (Markdown, ~500-1000 linhas)
- Claro o suficiente para o desenvolvedor trabalhar sem perguntas
- Todos os "Quando?" resolvidos, ambiguidades apontadas explicitamente

**Ferramentas:**
- Read (lerá código, documentação)
- Grep (procurará padrões similares)
- Glob (localizará arquivos relevantes)
- Write (escreverá apenas em `specs/`)

**Restrições:**
- ❌ NÃO escreve código
- ❌ NÃO propõe implementação
- ❌ NÃO adivinhas quando há ambiguidade

---

### 2️⃣ DESENVOLVEDOR (`desenvolvedor.md`)

**Quando acionar:**
- `specs/<slug>.md` foi finalizado e validado
- Nenhuma "Dúvida Pendente" está aberta na spec
- Desenvolvimento pode começar
- Testes devem ser escritos junto com o código

**O que faz:**
1. Valida que a spec não é ambígua (se houver dúvidas, PARA)
2. Estuda código existente (padrões, tabelas, APIs)
3. Implementa a feature em etapas:
   - BD (se novo schema)
   - Lógica de negócio (lib/)
   - APIs (app/api/)
   - Frontend (components/)
4. **Escreve testes junto com cada etapa** (não deixa para depois)
5. Cada critério Gherkin da spec vira um teste
6. Commit granular e claro

**Saída esperada:**
- Código funcional que passa em todos os critérios de aceite
- Suite de testes que valida cada critério
- Se descobrir ambiguidade na spec: PARA e reporta (não improvisa)

**Ferramentas:**
- Todas (Read, Edit, Write, Bash, Grep, Glob, Agent)

**Restrições:**
- ❌ NÃO trabalha sem spec (ou com spec ambígua)
- ❌ NÃO muda a spec se achar que está errada (reporta)
- ❌ NÃO deixa testes para depois

**Frase de ouro:** "Spec é lei. Se estiver errada, reporto. Não improviso."

---

### 3️⃣ QA REVISOR (`qa.md`)

**Quando acionar:**
- Código foi implementado
- Desenvolvedor reportou "Pronto para QA"
- Todos os testes rodam sem erro
- Validação final antes de merge/deploy

**O que faz:**
1. Lê `specs/<slug>.md` (INTEIRAMENTE)
2. Lê o código (APENAS, sem mensagens do dev)
3. Roda testes (`npm test`, `pytest`, etc.)
4. Para cada critério Gherkin da spec:
   - Valida que código implementa
   - Verifica que teste existe e passa
   - Marca como PASS / FAIL / INCOMPLETE
5. Testa cada caso de borda
6. Produz relatório estruturado com PASS/FAIL por critério
7. Se tudo passa: **APROVADO**
8. Se algo falha: relatório vai de volta ao desenvolvedor

**Saída esperada:**
- Relatório estruturado (Markdown) com:
  - Resumo: N critérios, X PASS, Y FAIL, Z INCOMPLETE
  - Detalhamento de cada critério
  - Achados adicionais (não-spec, mas relevantes)
  - Recomendação: APROVADO / REPROVADO / COM RESSALVAS

**Ferramentas:**
- Read (lê spec, código, testes)
- Grep (procura implementação)
- Glob (localiza testes)
- Bash (roda testes)
- ❌ **Restrição: SEM escrita, SEM edição**

**Por que essa restrição?**
Se o QA pode escrever/corrigir, ele está "aprovando sua própria correção". A restrição garante independência: ele aprova porque VISTO que está certo, não porque o corrigiu.

**Frase de ouro:** "Minha aprovação é garantia. Se disser PASS, pode ir pro prod."

---

## Handoff de Arquivos

### Especificador → Desenvolvedor

**Arquivo chave:** `specs/<slug>.md`

```
especificador.md cria:
  specs/<slug>.md
    ├─ Requisitos Funcionais (RF001, RF002, ...)
    ├─ Critérios de Aceite (Gherkin)
    └─ Casos de Borda

desenvolvedor.md lê:
  specs/<slug>.md (integralmente)
  → Se houver "Dúvidas Pendentes": PARA
  → Senão: começa a implementar
```

### Desenvolvedor → QA

**Arquivos chave:**
- `specs/<slug>.md` (a mesma, sem mudança)
- Código novo/modificado (exemplos: `lib/xyz.ts`, `app/api/xyz/route.ts`, `components/Xyz.tsx`)
- Testes (`__tests__/xyz.test.ts`)

```
desenvolvedor.md escreve:
  ├─ Código
  ├─ Testes
  └─ Commit message descrevendo o que foi feito

qa.md lê:
  ├─ specs/<slug>.md (fonte de verdade)
  ├─ Código (implementação)
  ├─ Testes (validação)
  → Roda testes
  → Compara resultado com spec
  → Gera relatório
```

### QA → Desenvolvedor (se houver FAIL)

**Arquivo chave:** Relatório de QA (texto ou arquivo temp)

```
qa.md gera:
  relatório_qa_<slug>.md (ou mensagem estruturada)
    ├─ Critério X: FAIL porque...
    ├─ Teste Y: Error porque...
    └─ Recomendação: [lista de correções]

desenvolvedor.md recebe:
  → Lê o relatório
  → Corrige o código
  → Roda testes localmente
  → Commit novo
  → Avisa QA para revisar de novo
```

---

## Fluxo Passo a Passo: Exemplo Prático

### Demanda Original
```
"Quero que coordenadores criem novos usuários da página de configurações,
 com o perfil de operador pré-selecionado se vierem de um link de área."
```

### Passo 1: Especificador
```
1. Lê a demanda (vaga)
2. Estuda código:
   - Como usuários são criados hoje?
   - Qual é a estrutura de perfis?
   - Como funciona o sistema de permissões?
3. Escreve specs/area-user-creation.md com:
   - RF001: Coordenador acessa /configuracoes?area=X
   - RF002: Modal abre automaticamente
   - RF003: Perfil de operador da área é pré-selecionado
   - Critérios Gherkin para cada um
   - Casos de borda: E se não houver perfil de operador? E se área=invalid?
   - Dúvidas: "Que fazer se coordenador não tem permissão de criar usuários?"
4. Envia para validação do usuário / PM
```

### Passo 2: Desenvolvedor
```
1. Lê specs/area-user-creation.md
   - Todas as dúvidas foram resolvidas? SIM → continua
2. Estuda código:
   - Lê /app/configuracoes/page.tsx
   - Lê /app/configuracoes/layout.tsx
   - Lê /lib/db.ts (estrutura de perfis)
3. Implementa:
   - Modifica layout.tsx para permitir coordenadores
   - Modifica page.tsx para usar useSearchParams(), buscar perfil
   - Escreve testes em __tests__/configuracoes.test.ts
4. Commits:
   - commit 1: "fix: permitir coordenadores acessar /configuracoes"
   - commit 2: "feat: pré-selecionar perfil ao vir de link de área"
   - commit 3: "test: adicionar testes para seleção de perfil"
5. Avisa: "Pronto para QA"
```

### Passo 3: QA
```
1. Lê specs/area-user-creation.md
2. Lê código novo:
   - layout.tsx (permite coordenadores?)
   - page.tsx (detecta ?area, busca perfil, pré-seleciona?)
   - Testes
3. Roda: npm test
   - Teste RF001 passa? ✓
   - Teste RF002 passa? ✓
   - Teste RF003 passa? ✓
   - Caso borda 1 passa? ✓
4. Gera relatório:
   ```
   # Relatório de QA — area-user-creation
   
   Status: ✅ APROVADO
   Critérios: 3/3 PASS
   Testes: 8/8 PASS
   
   Detalhamento:
   - RF001: PASS (layout permite coordenadores)
   - RF002: PASS (modal abre automaticamente)
   - RF003: PASS (perfil pré-selecionado)
   - Caso borda (área inválida): PASS (erro 404 apropriado)
   ```
5. Código segue para merge/deploy
```

---

## Padrão de Nomes

Para manter rastreabilidade:

```
Feature: feature-name
├─ specs/feature-name.md
├─ app/feature-name/
│  ├─ page.tsx
│  └─ layout.tsx (se necessário)
├─ components/FeatureName*.tsx
├─ lib/featureName.ts (se lógica complexa)
├─ app/api/feature-name/route.ts
├─ __tests__/featureName.test.ts
└─ __tests__/api.featureName.test.ts
```

---

## Quando NÃO Usar Este Fluxo

1. **Hotfixes críticos** — se é genuinamente urgente (prod down), desenvolve direto e especifica depois
2. **Mudanças triviais** — typo, formatação, docs — pode pular spec
3. **Exploração / POC** — se é experimental, não precisa de spec formal

**Mas a regra padrão é:** Demanda → Spec → Dev → QA.

---

## Observações Finais

### Por que 3 agentes em vez de 1 gigante?

1. **Independência** — cada agente tem responsabilidade clara
2. **Qualidade** — QA não foi quem escreveu o código; pode ser imparcial
3. **Rastreabilidade** — arquivo por arquivo, cada passo é registrado
4. **Escalabilidade** — se houver muitos agentes, podem rodar em paralelo (specs) ou sequência

### O que você ganha?

- ✅ **Specs claras** — sem ambiguidades, sem retrabalho
- ✅ **Código confiável** — testado contra spec, não contra "achismo"
- ✅ **Rastreabilidade** — de demanda a código a validação, tudo documentado
- ✅ **Confiança** — QA aprovado = pode ir pra prod

### Como usar na prática?

```bash
# 1. Enviar demanda para especificador
$ claude agent run especificador \
  --input "Quero que..."

# 2. Validar spec (você ou PM)
$ cat specs/novo-recurso.md

# 3. Enviar para desenvolvedor
$ claude agent run desenvolvedor \
  --spec specs/novo-recurso.md

# 4. Enviar para QA
$ claude agent run qa \
  --spec specs/novo-recurso.md
```

---

**Última atualização:** 2026-07-29
**Projeto:** Igreja Batista — Sistema de Gestão
