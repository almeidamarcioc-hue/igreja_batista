# Comunicação — o que o líder e o operador podem fazer

Documentação dos dois níveis de acesso do módulo Comunicação, conforme o
comportamento implementado no sistema.

> Além destes dois níveis existe o **administrador** (`role = 'admin'`), que
> enxerga e faz tudo em todas as áreas, e mais o cadastro de usuários e perfis
> em `/configuracoes`.

---

## 1. Como o sistema identifica cada nível

O nível **não** vem de um campo "cargo" no usuário: ele é deduzido das
permissões do perfil de acesso. As áreas de Comunicação são
`transmissao-youtube`, `mix-som`, `datashow`, `cameras` e `iluminacao`.

| Nível | Como é reconhecido |
|---|---|
| **Administrador** | `role = 'admin'`, ou perfil com permissão `*` |
| **Líder de área** (coordenador) | tem `comunicacao:<área>.editar`, `.excluir` ou `.coordenador` |
| **Operador** (liderado) | tem só `comunicacao:<área>` e/ou `.visualizar` / `.criar` |

Pontos importantes:

- **`.criar` não é permissão de líder.** Na tela de perfis ela aparece como
  "Marcar/Criar" e significa preencher checklist — é a permissão do operador.
- **Uma pessoa só vê as áreas que constam nas permissões dela.** Sem
  `comunicacao:cameras`, a área Câmeras não aparece no menu nem nas consultas.
- **Perfis antigos**: perfis criados pela semeadura inicial têm apenas
  permissões genéricas (`comunicacao.visualizar`), sem a área. Nesse caso a área
  é deduzida do **nome do perfil** (ex.: "Comunicação — Câmeras (Operador)"), e
  o nível de líder exige que o nome contenha "Coordenador".
- **"Comunicação — Coordenador Geral"** é tratado como acesso a todas as áreas.

---

## 2. Comparativo rápido

| Ação | Líder de área | Operador |
|---|---|---|
| Ver as áreas em que tem permissão | ✅ | ✅ |
| Criar e preencher checklist | ✅ | ✅ |
| Finalizar (salvar) checklist | ✅ | ✅ |
| Reiniciar o **próprio** preenchimento | ✅ | ✅ |
| Exportar checklist em texto | ✅ | ✅ |
| Ver os checklists **da equipe** | ✅ | ❌ (só os próprios) |
| Filtrar o histórico por operador | ✅ | ❌ |
| Ver quem preencheu cada checklist | ✅ | ❌ (vê apenas o próprio nome) |
| Gerenciar o template do checklist | ✅ | ❌ |
| Cadastrar operador | ✅ | ❌ |
| Alterar senha de operador | ✅ | ❌ |
| Ativar/desativar operador | ✅ | ❌ |
| Excluir checklist | ✅ (via API) | ❌ |
| Acessar `/configuracoes` | ✅ ¹ | ❌ |

¹ Bloqueado para líderes com permissão em **mais de uma área** — veja a
seção 5.

---

## 3. Líder de área (coordenador)

### 3.1 Dashboard (`/comunicacao`)

- Lista os checklists realizados **por toda a equipe** da área dele.
- **Filtro por período** (data inicial e final).
- **Filtro por operador**: seleciona quem quer acompanhar. A lista de operadores
  é montada a partir de quem realmente preencheu checklist na área, então nunca
  oferece alguém cujos dados não seriam visíveis.
- Cada card mostra a data, o percentual, os passos marcados e o **nome de quem
  preencheu**.
- Botão **➕ Novo Checklist** por área, que leva à lista da área.

### 3.2 Visualizar um checklist ("Ver")

- Mostra o resultado **consolidado da equipe**: um passo aparece marcado se
  qualquer pessoa da área o marcou.
- O campo "Responsável" mostra **quem preencheu**. Se ninguém preencheu ainda,
  exibe o responsável sugerido do template com a marca "(sugerido)".

### 3.3 Preencher checklist

- O líder também preenche checklist normalmente.
- Ao **preencher** (diferente de "Ver"), ele vê e altera **as marcações dele**,
  não as da equipe. Isso é intencional: as marcações são gravadas por usuário,
  então desmarcar um passo marcado por outra pessoa não teria efeito e a tela
  ficaria confusa.
- **🔄 Reiniciar** apaga apenas o preenchimento **dele** naquele culto/área.

### 3.4 Gerenciar Checklist (template da área)

Pelo menu, em **Gerenciar Checklist** dentro da área:

- **Adicionar** passo customizado, escolhendo a fase (Antes / Durante / Depois).
- **Editar** título e descrição de qualquer passo, inclusive os que vêm do
  template original. O passo editado recebe a marca "(editado)" e tem a opção
  **↩️ Restaurar original**.
- **Remover** passo. Passos do template original são desativados (podem voltar);
  passos customizados são apagados.
- As alterações valem para a área e passam a valer no checklist: passos
  removidos deixam de aparecer e os totais/percentuais acompanham.

### 3.5 Gerenciar Liderados

Pelo menu, em **Gerenciar Liderados**:

- **Listar** os operadores da área dele.
- **➕ Novo Operador**: informa nome, e-mail, usuário e senha (mínimo 6
  caracteres). A **área e o perfil são definidos pelo servidor** a partir das
  permissões de quem está cadastrando — não é possível criar acesso a outra área
  nem um usuário com mais poder.
- **🔐 Alterar Senha**: digita a nova senha (mínimo 6 caracteres). O sistema não
  mostra a senha antiga.
- **⚪ Desativar / ✅ Reativar**: o usuário desativado não consegue entrar, mas
  continua no sistema e pode ser reativado. Não há exclusão definitiva aqui.
- No modal de edição a senha é **opcional**: deixando em branco, apenas o status
  é alterado.

Quem aparece como liderado: os usuários cujo **perfil pertence à área** que ele
lidera, mais os que ele mesmo cadastrou. Ficam de fora ele mesmo,
administradores e outras pessoas com o mesmo perfil de coordenador.

---

## 4. Operador (liderado)

O operador tem acesso **somente ao checklist** da área dele.

### 4.1 O que vê ao entrar

- **Dashboard** com os checklists **que ele mesmo preencheu**, com filtro por
  período. Não vê o trabalho dos colegas nem o filtro por operador.
- Botão **➕ Novo Checklist** para iniciar um checklist, escolhendo a data.

### 4.2 O que pode fazer

- **Preencher** o checklist marcando os passos.
- **💾 Salvar Checklist** para finalizar. Depois de finalizado, o checklist fica
  bloqueado para alteração (o desbloqueio é feito por quem coordena a área).
- **🔄 Reiniciar** o próprio preenchimento daquele culto/área.
- **📥 Exportar checklist** em arquivo de texto.
- **Consultar** a aba "Durante" (guia de consulta) e a seção de Troubleshooting.

### 4.3 O que não pode

- Ver ou filtrar checklists de outros operadores.
- Gerenciar o template (incluir, editar ou remover passos).
- Cadastrar usuários, alterar senha de outras pessoas ou ativar/desativar
  contas.
- Abrir `/configuracoes` ou a tela de Gerenciar Liderados — se tentar pela URL,
  recebe aviso de acesso restrito.
- Acessar áreas para as quais não tem permissão — mesmo digitando a URL, recebe
  "Acesso negado".

---

## 5. Regras que valem para os dois

- **Sessão**: expira em 20 minutos de inatividade.
- **Conta desativada**: ao tentar entrar, a mensagem é *"Sua conta está
  desativada. Procure o líder da sua área ou o administrador."*
- **Marcações são por usuário**: cada pessoa tem o próprio progresso em um
  mesmo culto/área. A visão consolidada da equipe é usada na listagem do líder e
  no modo "Ver".
- **Líder com mais de uma área** fica bloqueado em `/configuracoes` e no
  cadastro de operador, com a mensagem *"Sua conta tem permissões em múltiplas
  áreas. Essa funcionalidade está em desenvolvimento."* O acompanhamento dos
  checklists das várias áreas funciona normalmente.

---

## 6. Pontos de atenção conhecidos

- **Excluir checklist não tem botão na interface.** A regra existe na API
  (`POST /api/comunicacao/excluir-checklist`, liberada para admin e líder da
  área), mas o componente que continha o botão (`DetalhesChecklist.tsx`) não
  está em uso em nenhuma tela. Para disponibilizar isso, é preciso ligar o
  componente de novo ou acrescentar o botão na tela de histórico.
- **Líder com mais de uma área** não cadastra operador nem acessa
  `/configuracoes` (item acima).
- **Passos "Durante"** são apenas guia de consulta: não entram no percentual do
  checklist, que considera as fases "Antes" e "Depois".

---

## 7. Como conceder as permissões (administrador)

Em `/configuracoes` → aba **Perfis de Acesso**, ao editar um perfil, marque a
área desejada em Comunicação e as ações:

| Objetivo | Marcar |
|---|---|
| Operador da área | `Visualizar` + `Marcar/Criar` |
| Líder da área | `Visualizar` + `Marcar/Criar` + `Editar` (e `Excluir`, se quiser que exclua checklists) |

Depois, associe o perfil ao usuário na aba **Usuários**. Como o líder da área
consegue cadastrar os próprios operadores, o administrador normalmente só
precisa criar o perfil e o usuário do líder.
