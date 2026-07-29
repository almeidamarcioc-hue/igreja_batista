# Especificação: Formulário Direto para Coordenadores em /configuracoes

**Versão:** 2.0  
**Data:** 2026-07-29  
**Status:** Especificação Finalizada  
**Resolução de Dúvidas:** D001–D006 resolvidas com input do usuário

---

## 1. Descrição do Problema

Atualmente, a página `/configuracoes` exibe uma **lista de usuários** para todo usuário autenticado que seja admin ou coordenador de comunicação. Coordenadores precisam navegar pela UI, localizar o botão "Novo Usuário", e preencher o formulário manualmente.

A demanda requer:
- **Para Coordenadores:** Abrir `/configuracoes` deve exibir **diretamente o formulário de novo usuário** (não a lista)
- **O novo usuário deve ser pré-configurado** com o perfil de operador da área em que o coordenador é coordenador
- **Para Admin:** Continuar exibindo a lista de usuários (comportamento atual)

### Cenário Atual vs. Esperado

| Contexto | Atual | Esperado |
|----------|-------|----------|
| Admin acessa `/configuracoes` | Lista de usuários + abas | Lista de usuários + abas (sem mudança) |
| Coordenador acessa `/configuracoes` | Lista de usuários + abas | Modal "Novo Usuário" aberto direto |
| Coordenador clica "Novo Usuário" | Modal abre | N/A (já abre direto) |

---

## 2. Escopo Técnico

### Componentes/Arquivos Afetados

1. **`app/configuracoes/layout.tsx`** (Server Component)
   - Validação de acesso (sem mudanças estruturais, apenas na lógica)
   - **SUPOSIÇÃO:** Será necessário passar informação sobre tipo de usuário para a página

2. **`app/configuracoes/page.tsx`** (Client Component)
   - Lógica condicional para renderizar lista OU formulário direto
   - Pré-carregamento de dados: identificar a área do coordenador
   - Inicializar modal já aberto para coordenadores

3. **`app/api/admin/usuarios/route.ts`** (sem mudanças)
   - API de POST/PUT continua igual; já valida `requireAdminOrCoordenador()`

4. **`lib/db.ts`** (sem mudanças)
   - Estrutura de usuários e perfis mantida

### Dependências Entre Componentes

```
layout.tsx (valida acesso)
    ↓
page.tsx (renderiza conteúdo baseado em role/perfil)
    ↓
Componentes de formulário + lista (já existentes)
```

---

## 3. Requisitos Funcionais

### RF001: Detecção de Tipo de Usuário (Admin vs. Coordenador vs. Operador)

**Descrição:** A página deve identificar se o usuário logado é:
- **Admin** (`usuario.role === 'admin'`)
- **Coordenador** (tem `perfil_id` com permissões que incluem coordenador em pelo menos uma área)
- **Operador ou Outro** (usuários sem permissão de coordenador)

**Implementação:**
1. No client, usar `useEffect` com `fetch('/api/auth/me')` para carregar contexto do usuário
2. Extrair `role` e `perfil_id` da resposta
3. Validar permissões baseado no perfil associado

**Critério:** 
- Essa detecção deve ocorrer no cliente para controlar a renderização
- Máximo 100ms overhead (dados já autenticados)
- Admin recebe lista de usuários
- Coordenador (1 área) recebe formulário direto
- Coordenador (múltiplas áreas) será tratado em RF006
- Operador e demais roles redirecionam para `/`

---

### RF002: Renderização Condicional da UI

**Descrição:** Com base no tipo de usuário:

1. **Se Admin:**
   - Renderizar a UI atual: abas (Usuários/Perfis), lista de usuários, botão "Novo Usuário"
   
2. **Se Coordenador (1 área):**
   - Renderizar **apenas** o modal "Novo Usuário" já aberto
   - Ocultar/não renderizar as abas e lista
   - Modal não deve ter botão de fechar (X) visível, apenas "Cancelar" e "Salvar"
   
3. **Se Operador ou outro:**
   - Bloquear acesso com `redirect('/')` no layout.tsx

**Critério:** 
- Layouts visualmente distintos; sem condicional CSS (usar JSX condicional)
- Implementar validação no `app/configuracoes/layout.tsx`:
  - Admin: continua
  - Coordenador com permissão em 1+ áreas: continua
  - Outros: redirect('/')

---

### RF003: Pré-Seleção e Desabilitação de Perfil do Operador

**Descrição:** Quando um coordenador abrir o formulário direto, o campo **"Perfil de acesso"** deve estar pré-selecionado com o perfil de operador correto para a área e **DESABILITADO** (readonly).

**Lógica:**
1. Extrair as permissões do perfil do coordenador logado
2. Identificar a área de comunicação do coordenador (para 1 área; múltiplas áreas vide RF006)
3. Localizar na lista de perfis o correspondente "Operador" dessa área
4. Pré-selecionar no dropdown
5. Desabilitar o campo (operador só pode preencher checklist)

**Exemplo:**
- Usuário tem perfil "Comunicação — Transmissão (Coordenador)"
- Permissões incluem `comunicacao:transmissao-youtube.coordenador`
- → Pré-selecionar perfil "Comunicação — Transmissão (Operador)"
- → Desabilitar dropdown (usuário NÃO consegue alterar)

**Critério:** 
- Campo `formUser.perfil_id` já deve estar preenchido ao abrir o modal
- Dropdown desativado (readonly/disabled)
- Novo operador criado terá APENAS permissão de preencher checklist (sem gerenciar passos, criar usuários)

---

### RF004: Campo de Módulo Pré-Preenchido

**Descrição:** O campo **"Módulos"** do novo usuário deve ser automaticamente ajustado para `"comunicacao"` (já que apenas operadores de comunicação são criados por coordenadores) e **DESABILITADO**.

**Critério:** 
- `formUser.modulos` = `'comunicacao'`
- Campo desabilitado (readonly)
- Usuário não consegue alterar

---

### RF005: Navegação Pós-Criação

**Descrição:** Após criar o novo usuário com sucesso:
1. Modal fecha
2. Mensagem de sucesso exibe
3. **Redirecionar para página da área do coordenador**

**Implementação:**
- Extrair `area_id` do perfil do coordenador
- Redirecionar para `/comunicacao/area-historico/[area-id]?culto_data=today`
- Isso permite ao coordenador ver imediatamente o novo operador criado

**Critério:** 
- Navegação para página da área após sucesso
- `culto_data=today` para mostrar cultos de hoje

---

### RF006: Tratamento de Múltiplas Áreas (Implementação Futura)

**Descrição:** Se um coordenador tem permissões em **múltiplas áreas** de comunicação:

**Escopo Atual (v2.0):**
- ❌ NÃO implementar suporte a múltiplas áreas nesta versão
- Validação no layout deve detectar e redirecionar para `/`
- Exibir mensagem: "Sua conta tem permissões em múltiplas áreas. Essa funcionalidade está em desenvolvimento."

**Escopo Futuro (v3.0):**
- ✅ Criar novo role **"Líder de Área"**
- ✅ "Líder de Área" pode ter múltiplas áreas selecionadas
- ✅ Ao acessar `/configuracoes`, mostrar DROPDOWN de seleção de área
- ✅ Criar operadores apenas para a área selecionada

**Critério (v2.0):** 
- Validação no `layout.tsx`: se coordenador tem múltiplas áreas → `redirect('/')`
- Preparar estrutura (comentários) para v3.0

---

## 4. Requisitos Não-Funcionais

### RNF001: Performance

**Descrição:** A detecção de tipo de usuário e pré-carregamento de áreas não deve adicionar latência significativa.

**Critério:** 
- Máximo 100ms de overhead adicional
- Usar dados já carregados (não fazer requisições extras ao abrir a página)

---

### RNF002: Accessibilidade

**Descrição:** Modal pré-aberto deve ser acessível (ARIA labels, focus management).

**Critério:**
- Modal segue padrões de acessibilidade existentes no projeto (já implementados?)
- Botão "Cancelar" recebe foco ao fechar e retornar à página vazia/home

---

### RNF003: Compatibilidade

**Descrição:** Deve funcionar em Next.js 16.2.4 com App Router e React 18.

**Critério:** Sem uso de APIs descontinuadas; usar Hooks padrão de React.

---

## 5. Suposições Explícitas

1. **Como passar o tipo de usuário do server (layout) para o client (page)? [RESOLVIDO]**
   - ✅ **Solução:** Use `useEffect` + `fetch('/api/auth/me')` para carregar contexto do usuário no client
   - Endpoint já existe em `app/api/auth/me/route.ts`
   - Carregar `role` e `perfil_id` para determinar comportamento

2. **E-mail obrigatório para novo operador? [RESOLVIDO]**
   - ✅ **E-mail é obrigatório** (validação no formulário)
   - ✅ **E-mail será o login padrão** do operador
   - ✅ Mesmo fluxo atual: coordenador preenche e-mail e senha no formulário
   - ❌ Não há pre-geração automática de senha

3. **Quando há múltiplas áreas? [RESOLVIDO - v2.0]**
   - ✅ **Bloquear acesso** a coordenadores com múltiplas áreas (redirect `/`)
   - ✅ Preparar para v3.0 com "Líder de Área"
   - ✅ Validação no `layout.tsx`

4. **Fechamento do modal e navegação? [RESOLVIDO]**
   - ✅ Coordenador clica "Cancelar" → redireciona para `/`
   - ✅ Coordenador clica "Salvar" com sucesso → redireciona para `/comunicacao/area-historico/[area-id]?culto_data=today`

5. **Role "usuario" x Coordenador [RESOLVIDO]**
   - ✅ Novo operador criado sempre terá `role: 'usuario'` (não admin)
   - ✅ Novo operador recebe `ativo: true`
   - ✅ Novo operador recebe perfil pré-selecionado (readonly)
   - ✅ Novo operador terá APENAS permissão de preencher checklist

---

## 6. Critérios de Aceite em Gherkin

### CAT001: Admin Vê Lista

```gherkin
Cenário: Admin acessa /configuracoes e vê lista de usuários
  Dado que um usuário admin está autenticado
  Quando acessa /configuracoes
  Então deve ver as abas "Usuários" e "Perfis de Acesso"
  E deve ver a lista de usuários da sistema
  E deve ver o botão "+ Novo Usuário"
  E nenhum modal deve estar aberto
```

### CAT002: Coordenador com 1 Área Vê Formulário Direto

```gherkin
Cenário: Coordenador (1 área) acessa /configuracoes e vê formulário direto
  Dado que um usuário com perfil de coordenador está autenticado
  E o coordenador é responsável por APENAS a área "Transmissão YouTube"
  Quando acessa /configuracoes
  Então deve ver APENAS o modal "Novo Usuário" aberto
  E as abas e lista de usuários NÃO devem estar visíveis
  E o campo "Perfil de acesso" deve estar pré-selecionado com "Comunicação — Transmissão (Operador)"
  E o campo "Perfil de acesso" deve estar DESABILITADO (readonly)
  E o campo "Módulos" deve estar pré-preenchido com "Comunicacao"
  E o campo "Módulos" deve estar DESABILITADO (readonly)
```

### CAT002b: Coordenador com Múltiplas Áreas É Bloqueado

```gherkin
Cenário: Coordenador (múltiplas áreas) não consegue acessar /configuracoes
  Dado que um usuário com perfil de coordenador está autenticado
  E o coordenador é responsável por "Transmissão YouTube" E "Mix de Som"
  Quando tenta acessar /configuracoes
  Então é redirecionado para "/" (home)
  E uma mensagem de erro exibe: "Sua conta tem permissões em múltiplas áreas. Essa funcionalidade está em desenvolvimento."
  
Nota: Suporte a múltiplas áreas será implementado em v3.0 com novo role "Líder de Área"
```

### CAT003: Pré-Seleção de Perfil Correto e Desabilitado

```gherkin
Cenário: Perfil de operador é identificado, pré-selecionado e desabilitado
  Dado um coordenador de "Mix de Som" acessa /configuracoes
  Quando o formulário é renderizado
  Então o campo "Perfil de acesso" deve mostrar "Comunicação — Mix de Som (Operador)" selecionado
  E o coordenador NÃO consegue alterar o perfil (dropdown desativado/disabled)
  E o campo "Módulos" exibe "Comunicacao" e está desabilitado
```

### CAT004: Criação de Novo Usuário Operador

```gherkin
Cenário: Coordenador cria novo operador para sua área
  Dado o modal de novo usuário está aberto
  E o perfil de operador está pré-selecionado e desabilitado
  E o módulo "Comunicacao" está pré-selecionado e desabilitado
  Quando preenche "Nome Completo" = "João Silva"
  E preenche "Email" = "joao@example.com"
  E preenche "Usuário" = "joaosilva"
  E preenche "Senha" = "senha123"
  E clica "Salvar"
  Então um novo usuário deve ser criado com:
    - nome: "João Silva"
    - email: "joao@example.com" (OBRIGATÓRIO - será o login padrão)
    - usuario: "joaosilva"
    - role: "usuario"
    - modulos: "comunicacao"
    - perfil_id: (id do perfil de operador da área)
    - ativo: true
  E o novo operador terá APENAS permissão de preencher checklist (sem gerenciar passos, sem criar usuários)
  E mensagem de sucesso aparece
```

### CAT005: Cancelamento e Navegação Pós-Sucesso

```gherkin
Cenário A: Coordenador cancela criação de novo usuário
  Dado o modal "Novo Usuário" está aberto
  Quando clica "Cancelar"
  Então o modal fecha
  E o usuário é redirecionado para "/" (home)

Cenário B: Coordenador cria novo usuário com sucesso
  Dado o novo usuário foi criado com sucesso
  Quando a requisição POST /api/admin/usuarios retorna 201
  Então o modal fecha
  E mensagem de sucesso exibe ("Usuário criado com sucesso!")
  E o usuário é redirecionado para "/comunicacao/area-historico/[area-id]?culto_data=today"
    - Onde [area-id] é a área do coordenador
    - ?culto_data=today mostra cultos de hoje
```

### CAT006: API Valida Permissões

```gherkin
Cenário A: Coordenador consegue criar novo usuário
  Dado um POST é enviado para /api/admin/usuarios
  E o usuário é um coordenador (não admin)
  Quando o payload contém dados do novo usuário
  Então a requisição é aceita (status 201)
  E o usuário é criado
  
Cenário B: Usuário sem permissão não consegue criar usuário
  Dado um POST é enviado para /api/admin/usuarios
  E o usuário NÃO é admin nem coordenador
  Quando o payload contém dados do novo usuário
  Então a requisição retorna erro (status 403)
  E mensagem de erro exibe: "Acesso negado"
```

### CAT007: Controle de Acesso a /configuracoes

```gherkin
Cenário A: Admin acessa /configuracoes normalmente
  Dado um usuário admin está autenticado
  Quando acessa /configuracoes
  Então pode ver a lista de usuários e perfis
  E pode criar/editar qualquer usuário

Cenário B: Coordenador (1 área) acessa /configuracoes
  Dado um coordenador com permissão em 1 área está autenticado
  Quando acessa /configuracoes
  Então vê o formulário de novo usuário direto (modal aberto)
  E pode criar operador apenas para sua área

Cenário C: Coordenador (múltiplas áreas) é bloqueado
  Dado um coordenador com permissão em múltiplas áreas está autenticado
  Quando tenta acessar /configuracoes
  Então é redirecionado para "/" (home)

Cenário D: Operador é bloqueado
  Dado um usuário operador está autenticado
  Quando tenta acessar /configuracoes
  Então é redirecionado para "/" (home)
```

### CAT008: Permissões do Operador Criado

```gherkin
Cenário: Novo operador criado tem permissões limitadas
  Dado um novo operador foi criado por um coordenador
  Quando o operador faz login
  E acessa a área de "Checklist de Passos"
  Então consegue APENAS preencher o checklist
  E NÃO consegue:
    - Gerenciar passos
    - Criar novos usuários
    - Editar configurações de área
    - Acessar outras áreas
```

---

## 7. Casos de Borda

### CB001: Coordenador com Múltiplas Áreas [RESOLVIDO]
**Cenário:** Um coordenador tem permissões em "Transmissão" e "Mix de Som".

**Comportamento v2.0:** 
- ✅ Bloquear acesso com `redirect('/')` no `layout.tsx`
- ✅ Exibir mensagem: "Sua conta tem permissões em múltiplas áreas. Essa funcionalidade está em desenvolvimento."

**Escopo Futuro (v3.0):**
- Novo role "Líder de Área" com suporte a múltiplas áreas + dropdown de seleção

---

### CB002: Usuário com Permissões de Coordenador Sem Área Específica
**Cenário:** Perfil de coordenador sem permissões em nenhuma área específica (ex: apenas `comunicacao.visualizar`).

**Comportamento esperado:** 
- ✅ Não deve abrir formulário direto (não é coordenador de nenhuma área)
- ✅ Redirecionar para home com mensagem de erro

**Critério:** Detectar na validação do layout se é coordenador com área definida. Se não tiver área, `redirect('/')`.

---

### CB003: Refresh Após Sucesso [RESOLVIDO]
**Cenário:** Coordenador abre formulário, clica "Salvar", sucesso, depois F5 (refresh).

**Comportamento esperado:** 
- ✅ Usuário é redirecionado para `/comunicacao/area-historico/[area-id]?culto_data=today`
- ✅ Se refazer F5 nessa página, não volta ao modal
- ✅ Modal só reabre se coordenador acessa `/configuracoes` novamente

---

### CB004: Perfil de Operador Não Existe
**Cenário:** Coordenador de uma área, mas o perfil "Operador" dessa área foi deletado do banco.

**Comportamento esperado:** 
- ✅ Exibir erro ao carregar página: "Perfil de operador não disponível para sua área"
- ✅ Bloquear acesso com `redirect('/')`
- ✅ Não permitir que coordenador crie novo operador

**Critério:** 
- Validação no `page.tsx`: verificar se perfil existe
- Se não existir, mostrar erro e redirecionar

---

### CB005: E-mail Duplicado [RESOLVIDO]
**Cenário:** Coordenador tenta criar novo operador com e-mail já existente.

**Comportamento esperado:**
- ✅ API `/api/admin/usuarios` retorna erro 400
- ✅ Modal exibe mensagem: "E-mail já cadastrado"
- ✅ Modal permanece aberto para correção

---

### CB006: Operador Tenta Acessar /configuracoes [RESOLVIDO]
**Cenário:** Um operador (role: 'usuario') tenta acessar /configuracoes.

**Comportamento esperado:**
- ✅ `layout.tsx` detecta que não é admin/coordenador
- ✅ `redirect('/')` (home)
- ✅ Nenhuma mensagem de erro exibe (silencioso)

---

## 8. Dependências Externas

1. **Banco de dados (Neon/PostgreSQL):**
   - Tabelas `usuarios`, `perfis_acesso` devem estar sincronizadas
   - Perfis de operador ("Comunicação — XXX (Operador)") devem existir para todas as áreas

2. **API `/api/admin/usuarios`:**
   - Já existe; apenas confirmar que permite POST com coordenador autenticado
   - Confirmado em `app/api/admin/usuarios/route.ts` (linha 58)

3. **Componentes React:**
   - Modal, LoadingSpinner, inputs já existem em `page.tsx`
   - Reutilizar estrutura existente

---

## 9. Dúvidas Pendentes

❌ **NENHUMA** — Todas as dúvidas (D001–D006) foram resolvidas com input do usuário final.

Ver seção 5 (Suposições Explícitas) para detalhes de cada resolução.

---

## 10. Resumo Técnico para Desenvolvedor

### Stack
- Next.js 16.2.4 (App Router)
- React 18 + TypeScript
- Tailwind CSS (styling)

### Arquivos Principais
1. `app/configuracoes/page.tsx` — Lógica principal (adaptar renderização condicional)
2. `app/configuracoes/layout.tsx` — Validação de acesso (revisar se precisa mudar)
3. `app/api/admin/usuarios/route.ts` — Já suporta coordenador

### Fluxo de Dados
```
User Login → layout.tsx valida (admin ou coordenador)
         → page.tsx renderiza:
              • Se admin: lista + abas
              • Se coordenador: modal direto
         → Pré-carrega perfil de operador
         → Modal abre com formUser.perfil_id pré-preenchido
         → Salva via POST /api/admin/usuarios
```

### Checklist de Implementação (v2.0)

**Layout (`app/configuracoes/layout.tsx`):**
- [ ] Validar `requireAdminOrCoordenador()` sem mudanças estruturais
- [ ] Adicionar detecção: coordenador com múltiplas áreas → `redirect('/')`
- [ ] Adicionar detecção: operador/outro → `redirect('/')`

**Page (`app/configuracoes/page.tsx`):**
- [ ] Adicionar `useEffect` com `fetch('/api/auth/me')` ao montar
- [ ] Extrair `role` e `perfil_id` da resposta
- [ ] Renderização condicional:
  - Se `role === 'admin'`: mostrar lista (comportamento atual)
  - Se coordenador (1 área): mostrar modal direto
- [ ] Pré-carregar dados:
  - [ ] Identificar área do coordenador
  - [ ] Buscar perfil de operador correto
  - [ ] Pré-preencher `formUser.perfil_id` e `formUser.modulos`
- [ ] Desabilitar campos:
  - [ ] `formUser.perfil_id` (disabled)
  - [ ] `formUser.modulos` (disabled)
- [ ] Adicionar validação de e-mail obrigatório
- [ ] Redirecionar pós-sucesso:
  - [ ] Cancelar → `router.push('/')`
  - [ ] Sucesso → `router.push('/comunicacao/area-historico/[area-id]?culto_data=today')`

**Testes:**
- [ ] Admin vê lista (CAT001)
- [ ] Coordenador (1 área) vê formulário (CAT002)
- [ ] Coordenador (múltiplas áreas) é bloqueado (CAT002b)
- [ ] Perfil desabilitado (CAT003)
- [ ] Criação de usuário (CAT004)
- [ ] Cancelamento (CAT005)
- [ ] API valida permissões (CAT006)
- [ ] Controle de acesso (CAT007)
- [ ] Permissões operador (CAT008)
- [ ] Casos de borda (CB001–CB006)

---

---

## 11. Resumo Executivo das Resoluções

| Dúvida | Resolução | Impacto |
|--------|-----------|--------|
| **D001** — Passar tipo de usuário | `useEffect` + `fetch('/api/auth/me')` | Alto |
| **D002** — Múltiplas áreas | Bloquear (v2.0); "Líder de Área" (v3.0) | Médio |
| **D003** — Navegação pós-sucesso | `/comunicacao/area-historico/[area-id]?culto_data=today` | Baixo |
| **D004** — E-mail obrigatório | Sim, será login padrão | Baixo |
| **D005** — Perfil readonly | Sim, operador apenas preenche checklist | Médio |
| **D006** — Acesso a /configuracoes | Admin (lista), Coordenador 1-área (formulário), Operador (bloqueado) | Médio |

---

**Documento Pronto para Implementação — Sem Dúvidas Pendentes****
