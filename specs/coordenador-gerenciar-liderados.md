# Especificação: Coordenador Gerenciar Liderados (Usuários Cadastrados)

**Versão:** 2.0 — FINAL  
**Data:** 2026-07-30  
**Status:** Especificação Completa — Pronta para Desenvolvimento  
**Prioridade:** Alta  

---

## 1. Descrição do Problema

Atualmente, um coordenador de comunicação pode **criar usuários (operadores)** via `/configuracoes` (feature: formulário direto para coordenadores). No entanto, **NÃO existe um lugar centralizado** onde ele possa:
- 📋 **Listar** todos os usuários que ele próprio cadastrou
- 🔐 **Alterar a senha** de um operador (se o operador esqueceu)
- ✅ **Ativar/Desativar** um usuário (para suspender acessos)

### Por que é importante?

1. **Controle de acesso**: Coordenador precisa gerenciar os acessos dos operadores que contrata
2. **Segurança**: Permite desativar usuários rapidamente (ex: operador saiu da equipe)
3. **Suporte**: Coordenador pode resetar senhas sem abrir ticket ao admin
4. **Rastreabilidade**: Rastrear quem criou qual usuário (contribui para compliance)

---

## 2. Escopo Técnico

### Componentes/Arquivos Afetados

1. **`lib/db.ts`** (Backend - Schema)
   - **NOVA COLUNA** na tabela `usuarios`: `criado_por_usuario_id` (INTEGER, nullable)
   - Será usada para rastrear qual coordenador criou cada usuário
   - Constraint: `FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL`

2. **`app/api/admin/usuarios/route.ts`** (Backend - POST)
   - Modificar função `criarUsuario()` em `lib/db.ts` para registrar `criado_por_usuario_id` automaticamente
   - Quando um coordenador POST em `/api/admin/usuarios`, o novo usuário recebe `criado_por_usuario_id = userId` do coordenador

3. **Novo Endpoint: `app/api/admin/usuarios/meus-liderados/route.ts`**
   - GET: Listar usuários criados pelo coordenador autenticado
   - Retorna: array de usuários com campos: id, nome, email, usuario, ativo, data_criacao, modulos, perfil_id

4. **Modificar: `app/api/admin/usuarios/[id]/route.ts`** (Backend - PUT)
   - Adicionar validação: coordenador SÓ pode editar campos `senha` e `ativo` se `criado_por_usuario_id === userId`
   - Admin continua podendo editar qualquer usuário (sem restrições)

5. **Modificar: `app/api/admin/usuarios/[id]/route.ts`** (Backend - DELETE)
   - Adicionar validação: coordenador SÓ pode deletar (soft delete — desativar) se `criado_por_usuario_id === userId`

6. **Componente: `components/GerenciarLiderados.tsx`** (Frontend)
   - **Renderizar lista de liderados** com:
     - Coluna: Nome Completo
     - Coluna: E-mail
     - Coluna: Usuário
     - Coluna: Status (Ativo/Inativo)
     - Coluna: Data de Criação
     - Coluna: Ações (Editar, Excluir)
   - **Editar Liderado modal/drawer**:
     - Campo: Alterar senha (input password, obrigatório)
     - Campo: Ativar/Desativar (toggle)
     - Botões: Salvar, Cancelar
   - **Mensagens de feedback** (sucesso, erro)

7. **Sidebar/Menu** (Frontend)
   - Novo item no menu/sidebar: "👥 Gerenciar Liderados"
   - Disponível apenas para coordenadores (role = 'coordenador')
   - Leva a `/comunicacao/coordenador/gerenciar-liderados` ou rota similar
   - Bloqueia acesso se coordenador tem múltiplas áreas (redireciona home com mensagem)

### Arquitetura de Dados

```
Coordenador (usuario.id = 5)
    ├─ cria → Operador A (usuario.id = 10, criado_por_usuario_id = 5)
    ├─ cria → Operador B (usuario.id = 11, criado_por_usuario_id = 5)
    └─ cria → Operador C (usuario.id = 12, criado_por_usuario_id = 5)

Quando coordenador #5 acessa GET /api/admin/usuarios/meus-liderados
    → Retorna: Operadores A, B, C
    → Não retorna: Operadores de outros coordenadores
    
Admin (usuario.id = 1) pode ver/editar TODOS, sem filtro criado_por_usuario_id
```

---

## 3. Requisitos Funcionais

### RF001: Rastreamento de Criador

**Descrição:** Quando um coordenador **cria um novo usuário** via POST `/api/admin/usuarios`, o campo `criado_por_usuario_id` deve ser preenchido automaticamente com o ID do coordenador autenticado.

**Implementação:**
1. No endpoint POST, extrair `userId` da sessão
2. Verificar se é admin ou coordenador (já faz)
3. Adicionar `criado_por_usuario_id = userId` ao registro novo (admin não preenche, fica NULL)

**Critério:**
- Novo usuário criado por coordenador recebe `criado_por_usuario_id = id_do_coordenador`
- Novo usuário criado por admin recebe `criado_por_usuario_id = NULL`
- Não afeta usuários existentes (migração com `DEFAULT NULL`)

---

### RF002: Listar Liderados

**Descrição:** Endpoint GET `/api/admin/usuarios/meus-liderados` retorna APENAS os usuários criados pelo coordenador autenticado. Admin vê TODOS.

**Implementação:**
1. Validar que request vem de coordenador autenticado (use `requireAdminOrCoordenador()`)
2. Se é admin: retorna todos os usuários (sem filtro)
3. Se é coordenador: Query WHERE `criado_por_usuario_id = ${userId}`
4. Retornar array com campos: id, nome, email, usuario, ativo, data_criacao, modulos, perfil_id

**Critério:**
- Admin: vê TODOS os usuários
- Coordenador: vê APENAS seus liderados (criado_por_usuario_id = userId)
- Response 200 com array (pode estar vazio)

---

### RF003: Editar Liderado (Alterar Senha e Status)

**Descrição:** Coordenador pode alterar a **senha** e o **status** (ativo/inativo) de seus liderados via PUT `/api/admin/usuarios/[id]`. O coordenador digita a NOVA senha; o sistema não recupera a antiga.

**Implementação:**
1. No endpoint PUT, adicionar validação:
   - Se é admin: pode editar qualquer usuário (todos os campos)
   - Se é coordenador: só pode editar se `criado_por_usuario_id == userId_autenticado`
2. Campos editáveis por coordenador: `senha`, `ativo`
   - **Não pode editar**: role, modulos, perfil_id, email, usuario
3. Se tenta editar usuário de outro coordenador: retorna 403 "Você não tem permissão para editar este usuário"
4. Senha obrigatória no PUT (validação no frontend); hashada com bcrypt antes de salvar

**Critério:**
- Alterar senha: nova senha obrigatória, hashada
- Alterar status: `ativo = true ou false`
- Validação: coordenador SÓ pode editar seus liderados
- Response 200 OK ou 403 Forbidden

---

### RF004: Interface de Gerenciamento (UI)

**Descrição:** Novo item no menu/sidebar ("👥 Gerenciar Liderados") leva a página com componente React que exibe:
1. **Lista de Liderados** (tabela ou cards)
2. **Modal/Drawer de Edição** (senha + status)
3. **Botão Excluir** (com confirmação)
4. **Mensagens de Feedback** (sucesso, erro, loading)

**Renderização:**
- Tabela com colunas: Nome | E-mail | Usuário | Status | Data Criação | Ações
- Botão "Editar" abre modal
- Modal tem: campo de senha, toggle ativo/inativo, Salvar/Cancelar
- Mensagem "Nenhum liderado encontrado" se lista vazia
- Botão sugestivo redireciona para `/configuracoes` para criar novo

**Critério:**
- Tabela responsiva (mobile)
- Loading state enquanto busca
- Estado vazio com mensagem e CTA

---

### RF005: Exclusão Lógica de Liderado (Soft Delete)

**Descrição:** Coordenador pode **desativar** um liderado (soft delete) clicando em "Excluir". Sistema não remove registro do BD; apenas marca `ativo = false`.

**Implementação:**
1. Usar DELETE `/api/admin/usuarios/[id]` (já existe)
2. Modificar endpoint para fazer `UPDATE usuarios SET ativo = false WHERE id = [id]` em vez de `DELETE`
3. Adicionar validação: coordenador SÓ desativa seus próprios liderados
4. Admin consegue desativar qualquer usuário

**Critério:**
- Confirmação modal antes de desativar: "Tem certeza que deseja desativar 'Nome'?"
- Mensagem de sucesso após desativar
- Liderado é removido da lista imediatamente (refresh)
- Registro continua no BD com `ativo = false`

---

## 4. Requisitos Não-Funcionais

### RNF001: Performance

**Critério:**
- GET `/api/admin/usuarios/meus-liderados`: resposta em < 500ms
- Renderizar lista com 100+ usuários: < 1 segundo
- Sem cache ou paginação (v1.0)

---

### RNF002: Segurança

**Critério:**
- Coordenador **NÃO consegue**:
  - Editar/deletar liderado de outro coordenador
  - Ver liderados de outro coordenador
  - Alterar role, modulos, perfil_id de um liderado
- Validação no servidor (não apenas frontend)
- Senha hashada com bcrypt (já faz)
- Coordenador com múltiplas áreas: bloqueado (redireciona home)

---

### RNF003: Bloqueia Múltiplas Áreas

**Critério:**
- Coordenador com permissões em 2+ áreas NÃO consegue acessar gerenciador
- Redirect automático para "/" (home) com mensagem
- Alinhado com spec anterior (coordenador-formulario-direto.md)

---

## 5. Decisões Confirmadas (Respostas aos Stakeholder)

| # | Dúvida Original | Resposta Confirmada | Impacto |
|---|---|---|---|
| 1 | Coluna `criado_por_usuario_id` obrigatória? | ✅ **SIM** — Será adicionada via migration | Schema: Nova coluna em `usuarios` |
| 2 | Apenas coordenador que criou pode gerenciar? | ✅ **SIM** — Validação `criado_por_usuario_id == userId` | Segurança: Coordenador não consegue editar alheios |
| 3 | Bloqueia múltiplas áreas? | ✅ **SIM** — Mesmo bloqueio de `/configuracoes` | UX: Redirect + mensagem (múltiplas áreas) |
| 4 | Onde colocar entrada? | ✅ **Novo item no menu/sidebar** — "👥 Gerenciar Liderados" | UI: Novo link ao lado de Configurações |
| 5 | Admin consegue ver/editar todos? | ✅ **SIM** — Admin vê TODOS sem filtro `criado_por_usuario_id` | Backend: RF002 sem restrição para admin |
| 6 | Coordenador edita APENAS senha + status? | ✅ **SIM** — Apenas `senha` e `ativo` | Backend: RF003 valida campos editáveis |
| 7 | Busca obrigatória? | ❌ **NÃO** — Não implementar (opcional) | Simplifica: Remove RF003 de buscas |
| 8 | Hard delete ou soft delete? | ✅ **Soft delete** — Desativar usuário (`ativo = false`) | Backend: RF005 usa UPDATE em vez de DELETE |
| 9 | Precisa auditoria/logs? | ❌ **NÃO** — Não precisa para v1.0 | Simplifica: Remove RNF003 (logs) |
| 10 | Limite de liderados? | ➖ **N/A** — Sem cache/paginação (v1.0) | Backend: Sem limite explícito |

---

## 6. Critérios de Aceite em Gherkin

### CAT001: Coordenador Lista Seus Liderados

```gherkin
Cenário: Coordenador acessa gerenciador via menu e vê lista de liderados
  Dado que um coordenador está autenticado
  E esse coordenador criou 3 operadores (A, B, C)
  Quando clica em "👥 Gerenciar Liderados" no menu/sidebar
  Então é levado a página de gerenciamento
  E vê tabela com:
    - Coluna: Nome (mostra "Operador A", "Operador B", etc)
    - Coluna: E-mail
    - Coluna: Usuário (login)
    - Coluna: Status (Ativo/Inativo)
    - Coluna: Data de Criação
    - Coluna: Ações (botões Editar, Excluir)
  E a lista contém APENAS seus liderados (não de outro coordenador)
```

### CAT002: Endpoint GET Retorna Apenas Liderados do Coordenador

```gherkin
Cenário: GET /api/admin/usuarios/meus-liderados filtra por criador
  Dado um coordenador X autenticado
  E coordenador X criou usuários com IDs: 10, 11, 12
  Quando faz GET /api/admin/usuarios/meus-liderados
  Então recebe JSON com array contendo:
    - { id: 10, nome: "...", email: "...", criado_por_usuario_id: X }
    - { id: 11, nome: "...", email: "...", criado_por_usuario_id: X }
    - { id: 12, nome: "...", email: "...", criado_por_usuario_id: X }
  E NÃO contém usuários criados por outro coordenador
  E resposta status 200
```

### CAT003: Admin Vê Todos os Usuários

```gherkin
Cenário: Admin acessa /api/admin/usuarios/meus-liderados e vê TODOS
  Dado um admin está autenticado
  E existem usuários criados por coordenadores A, B, C
  Quando faz GET /api/admin/usuarios/meus-liderados
  Então recebe array com TODOS os usuários (sem filtro criado_por_usuario_id)
  E resposta status 200
```

### CAT004: Editar Liderado — Alterar Senha

```gherkin
Cenário: Coordenador altera senha de um liderado
  Dado um liderado "João Silva" (ID=10) cadastrado
  E coordenador está visualizando a lista
  Quando clica "Editar" na linha do João
  Então abre modal com título "Editar Liderado: João Silva"
  E modal contém:
    - Campo: "Senha" (input type=password, obrigatório)
    - Campo: "Ativo" (toggle, atualmente "Sim")
    - Botão: "Salvar"
    - Botão: "Cancelar"
  Quando preenche Senha = "nova_senha_123"
  E clica "Salvar"
  Então PUT /api/admin/usuarios/10 é chamado com { senha: "nova_senha_123" }
  E response retorna { ok: true }
  E modal fecha
  E mensagem exibe: "Usuário atualizado com sucesso"
```

### CAT005: Editar Liderado — Desativar

```gherkin
Cenário: Coordenador desativa um liderado
  Dado um liderado "Maria Santos" (ID=11, ativo=true)
  Quando clica "Editar"
  E no modal, clica no toggle "Ativo" para "Não" (ativo=false)
  E clica "Salvar"
  Então PUT /api/admin/usuarios/11 é chamado com { ativo: false }
  E liderado deixa de aparecer como "Ativo" na lista
  E a coluna Status muda para "Inativo"
```

### CAT006: Desativar Liderado com Confirmação

```gherkin
Cenário: Coordenador desativa um liderado via botão Excluir
  Dado um liderado "Carlos Oliveira" (ID=12)
  E coordenador vê botão "Excluir" na linha
  Quando clica "Excluir"
  Então aparece modal de confirmação:
    "Tem certeza que deseja desativar 'Carlos Oliveira'?"
    [Cancelar] [Desativar]
  Quando clica "Desativar" no modal
  Então DELETE /api/admin/usuarios/12 é chamado (soft delete)
  E API marca usuario.ativo = false
  E response retorna { ok: true }
  E usuário é removido imediatamente da lista
  E mensagem exibe: "Liderado desativado com sucesso"
```

### CAT007: Validação — Coordenador Não Consegue Editar Outro

```gherkin
Cenário: Coordenador X não consegue editar liderado de Coordenador Y
  Dado coordenador X está autenticado
  E tenta fazer PUT /api/admin/usuarios/20 (criado por Coordenador Y)
  Quando a requisição é enviada
  Então API retorna status 403
  E mensagem: "Você não tem permissão para editar este usuário"
```

### CAT008: Coordenador Múltiplas Áreas É Bloqueado

```gherkin
Cenário: Coordenador com múltiplas áreas não acessa gerenciador
  Dado um coordenador com permissões em 2 áreas
  Quando tenta clicar em "👥 Gerenciar Liderados" no menu
  Ou tenta acessar a rota diretamente
  Então é redirecionado para "/" (home)
  E mensagem exibe: "Sua conta tem permissões em múltiplas áreas. Essa funcionalidade está em desenvolvimento."
```

### CAT009: Lista Vazia

```gherkin
Cenário: Coordenador sem liderados vê mensagem vazia
  Dado um coordenador que NÃO criou nenhum usuário ainda
  Quando acessa o gerenciador de liderados
  Então lista vazia com mensagem:
    "Você ainda não cadastrou nenhum liderado."
  E botão sugestivo: "➕ Criar primeiro operador"
  E ao clicar, redireciona para /configuracoes
```

### CAT010: Rastreamento Automático no POST

```gherkin
Cenário: Novo usuário criado recebe criado_por_usuario_id automaticamente
  Dado um coordenador com ID=5 autenticado
  Quando POST /api/admin/usuarios com:
    { usuario: "joao", nome: "João", email: "joao@ex.com", senha: "...", modulos: "comunicacao", perfil_id: 2 }
  Então novo usuário é criado no BD com:
    - criado_por_usuario_id = 5 (automaticamente preenchido)
    - role = "usuario"
    - ativo = true
  E response retorna { id: <novo_id> }
```

### CAT011: Menu Item Visível Apenas para Coordenador

```gherkin
Cenário: Menu "Gerenciar Liderados" aparece apenas para coordenadores
  Dado um operador (role='usuario') autenticado
  Quando abre o menu/sidebar
  Então NÃO vê o item "👥 Gerenciar Liderados"
  
  Dado um coordenador (role='coordenador') autenticado
  Quando abre o menu/sidebar
  Então vê o item "👥 Gerenciar Liderados"
```

---

## 7. Casos de Borda

### CB001: Coordenador Com Múltiplas Áreas

**Cenário:** Coordenador tem permissões em "Transmissão" e "Mix de Som".

**Comportamento esperado:**
- ❌ Não consegue acessar gerenciador de liderados
- ❌ Redirect para "/" (home)
- ⚠️ Mensagem: "Sua conta tem permissões em múltiplas áreas. Essa funcionalidade está em desenvolvimento."
- ℹ️ Alinhado com spec anterior (coordenador-formulario-direto.md)

---

### CB002: Liderado Já Desativado e Reativar

**Cenário:** Coordenador tenta editar liderado que já está desativado e quer reativar.

**Comportamento esperado:**
- ✅ Modal abre normalmente
- ✅ Toggle mostra "Inativo"
- ✅ Pode reativar (toggle → Ativo → Salvar com `ativo = true`)
- ✅ PUT atualiza e marca `ativo = true` novamente
- ✅ Sem erros

---

### CB003: Alterar Senha Para Vazio

**Cenário:** Coordenador deixa campo de senha em branco no modal de edição.

**Comportamento esperado:**
- ❌ Validação no frontend: "Senha é obrigatória"
- ❌ Botão "Salvar" desabilitado se campo vazio
- ✅ Sem chamar API

---

### CB004: Desativar e Depois Tentar Editar (Stale Data)

**Cenário:** Coordenador desativa um liderado, depois a página está stale e tenta editar.

**Comportamento esperado:**
- ❌ API retorna 404 "Usuário não encontrado" (ou 403 se `ativo = false`)
- ⚠️ Frontend mostra erro: "Usuário foi desativado ou removido"
- ✅ Lista é atualizada (liderado removido)

---

### CB005: Validação de Senha Fraca

**Cenário:** Coordenador digita senha muito curta (< 6 caracteres).

**Comportamento esperado:**
- ❌ Validação no frontend: "Senha deve ter pelo menos 6 caracteres"
- ❌ Botão "Salvar" desabilitado
- ✅ Sem chamar API

---

### CB006: Liderado Deleta Sua Própria Conta Via API

**Cenário:** Um operador (role='usuario') tenta DELETE `/api/admin/usuarios/{seu_id}`.

**Comportamento esperado:**
- ❌ API já valida: "Não é possível excluir o próprio usuário"
- ✅ Sem mudanças neste requisito

---

## 8. Dependências Externas

### Backend
1. **Tabela `usuarios` — Nova Coluna**
   - `criado_por_usuario_id INTEGER DEFAULT NULL`
   - FOREIGN KEY: `REFERENCES usuarios(id) ON DELETE SET NULL`
   - Migration script no `initDb()` de `lib/db.ts`

2. **API `/api/admin/usuarios` (já existe, precisa modificar)**
   - POST: adicionar lógica de `criado_por_usuario_id`
   - PUT [id]: adicionar validação de permissão por coordenador
   - DELETE [id]: modificar para soft delete com validação

3. **Novo Endpoint: GET `/api/admin/usuarios/meus-liderados`**
   - Route: `app/api/admin/usuarios/meus-liderados/route.ts`
   - Sem query params (busca removida)
   - Validação: `requireAdminOrCoordenador()`

4. **Função de DB em `lib/db.ts`**
   - `getUsuariosPorCriador(userId: number)` — retorna array
   - Modify `criarUsuario()` — adicionar param `criado_por_usuario_id`
   - Modify `updateUsuario()` — adicionar validação de permissão
   - Modify `deleteUsuario()` — modificar para soft delete com validação

### Frontend
1. **Componente: `components/GerenciarLiderados.tsx`**
   - Props: none (fetch direto no component com `/api/admin/usuarios/meus-liderados`)
   - States: lista, loading, modal editando, etc

2. **Modal/Drawer de Edição**
   - Pode usar componente existente ou criar novo
   - Fields: senha (obrigatório), ativo (toggle)

3. **Integração em Menu/Sidebar**
   - Novo link: "👥 Gerenciar Liderados"
   - Disponível apenas para role = 'coordenador'
   - Com proteção de múltiplas áreas

---

## 9. Mapa Técnico para Desenvolvedor

### Sequência de Implementação Sugerida

**Fase 1: Backend (1–2 dias)**
```
1. Adicionar coluna criado_por_usuario_id em lib/db.ts
2. Modificar criarUsuario() para registrar criado_por_usuario_id
3. Criar endpoint GET /api/admin/usuarios/meus-liderados
4. Modificar PUT [id] para validar permissão (coordenador vs admin)
5. Modificar DELETE [id] para soft delete com validação
6. Testar com curl/Insomnia
```

**Fase 2: Frontend (1–2 dias)**
```
1. Criar componente GerenciarLiderados.tsx
2. Adicionar modal de edição
3. Integrar novo item no menu/sidebar
4. Implementar proteção de múltiplas áreas (redirect + mensagem)
5. Testar fluxos (listar, editar, desativar)
```

**Fase 3: QA & Polish (1 dia)**
```
1. Casos de borda (CB001–CB006)
2. Validações frontend
3. Mensagens de erro/sucesso
4. Performance
5. Acessibilidade (ARIA labels, focus management)
```

### Stack Utilizado
- Next.js 16.2.4 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Neon PostgreSQL
- Bcrypt (senha)

### Checklist Técnico

**BD:**
- [ ] Migration script para `criado_por_usuario_id`
- [ ] FOREIGN KEY constraint
- [ ] Default NULL para usuários existentes

**API:**
- [ ] GET `/api/admin/usuarios/meus-liderados` — implementado
- [ ] Validação 403 no PUT [id] (coordenador não consegue editar alheios)
- [ ] Soft delete no DELETE [id] (UPDATE ativo=false)
- [ ] Testes de permissão

**UI:**
- [ ] Componente `GerenciarLiderados.tsx`
- [ ] Modal edição (senha + ativo)
- [ ] Modal confirmação desativação
- [ ] Estados loading / empty / error
- [ ] Menu item "👥 Gerenciar Liderados"
- [ ] Proteção múltiplas áreas (redirect)
- [ ] Responsive design
- [ ] Accessibility (ARIA)

**Testes:**
- [ ] CAT001–CAT011 (Gherkin)
- [ ] CB001–CB006 (Casos de borda)

---

## 10. Resumo Executivo

| Aspecto | Descrição |
|---------|-----------|
| **Feature** | Gerenciador de Liderados para Coordenadores |
| **Escopo** | Listar, editar (senha/status), desativar usuários criados |
| **Prioridade** | Alta |
| **Impacto** | Segurança + controle de acesso + suporte |
| **Decisões Confirmadas** | 10/10 dúvidas resolvidas ✅ |
| **Requisitos Funcionais** | 5 (RF001–RF005) |
| **Requisitos Não-Funcionais** | 3 (RNF001–RNF003) |
| **Critérios Aceite** | 11 cenários Gherkin (CAT001–CAT011) |
| **Casos Borda** | 6 (CB001–CB006) |
| **Arquivos Novos** | 1 endpoint + 1 componente + 1 menu item |
| **Arquivos Modificados** | 4 (lib/db.ts, 2 routes PUT/DELETE, menu/sidebar) |
| **Estimativa** | 3–4 dias (backend + frontend + QA) |
| **Status** | ✅ **PRONTO PARA DESENVOLVIMENTO** |

---

**DOCUMENTO FINAL — SEM DÚVIDAS PENDENTES**

Todas as 10 questões foram respondidas pelo stakeholder. Spec está completa, inequívoca e pronta para o desenvolvedor implementar.

**Próximos Passos:**
1. ✅ Spec aprovada pelo stakeholder
2. → Passar para desenvolvedor com instrução: "Implemente conforme spec; não precisa voltar com dúvidas"
3. → Implementar conforme checklist técnico (Fase 1, 2, 3)
4. → QA valida contra critérios de aceite (CAT001–CAT011, CB001–CB006)
