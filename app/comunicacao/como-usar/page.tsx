'use client'

import { useState } from 'react'

// Manual de uso dentro do próprio sistema, escrito clique a clique.
// Cada passo diz o que fazer e o que acontece depois.

const COR_TITULO = '#002347'
const COR_DOURADO = '#C5A059'

function Passo({ numero, acao, resultado }: { numero: number; acao: React.ReactNode; resultado: React.ReactNode }) {
  return (
    <li className="flex gap-3 mb-4">
      <span
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: COR_TITULO }}
      >
        {numero}
      </span>
      <div className="flex-1 pt-0.5">
        <p className="text-sm text-gray-800">{acao}</p>
        <p className="text-xs text-gray-600 mt-1">
          <span className="font-semibold" style={{ color: COR_TITULO }}>O que acontece: </span>
          {resultado}
        </p>
      </div>
    </li>
  )
}

function Secao({ id, titulo, subtitulo, children }: { id: string; titulo: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-white rounded-lg shadow-md p-6 mb-6 scroll-mt-4">
      <h2 className="text-xl font-bold mb-1" style={{ color: COR_TITULO }}>{titulo}</h2>
      {subtitulo && <p className="text-sm text-gray-500 mb-4">{subtitulo}</p>}
      <div className={subtitulo ? '' : 'mt-4'}>{children}</div>
    </section>
  )
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-sm mt-3"
      // Cor do texto explícita: sem isso o conteúdo herda a cor do body
      style={{ backgroundColor: '#FFF8E7', border: `1px solid ${COR_DOURADO}`, color: '#5C4A1F' }}
    >
      {children}
    </div>
  )
}

const BOTAO = 'font-semibold'

export default function ComoUsarPage() {
  const [aba, setAba] = useState<'operador' | 'lider'>('operador')

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: COR_TITULO }}>📖 Como usar o sistema</h1>
        <p className="text-gray-600 mt-1">
          Passo a passo do módulo de Comunicação. Cada item diz o que clicar e o que acontece depois.
        </p>
      </div>

      {/* Escolha do público */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setAba('operador')}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={aba === 'operador'
            ? { backgroundColor: COR_TITULO, color: '#fff' }
            : { backgroundColor: '#fff', color: COR_TITULO, border: '1px solid #d1d5db' }}
        >
          🎧 Para o operador
        </button>
        <button
          onClick={() => setAba('lider')}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={aba === 'lider'
            ? { backgroundColor: COR_TITULO, color: '#fff' }
            : { backgroundColor: '#fff', color: COR_TITULO, border: '1px solid #d1d5db' }}
        >
          🧑‍🏫 Para o líder da área
        </button>
      </div>

      {aba === 'operador' && (
        <>
          <div className="rounded-lg px-4 py-3 mb-6 text-sm" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E3A5F' }}>
            <strong>Quem é o operador:</strong> quem opera a área durante o culto (câmeras, som, datashow,
            transmissão ou iluminação) e vai marcando no sistema o que já foi feito.
          </div>

          <Secao id="op-entrar" titulo="1. Entrar no sistema" subtitulo="Toda vez que você for operar">
            <ol>
              <Passo
                numero={1}
                acao={<>Abra o site e digite seu <strong>usuário</strong> e <strong>senha</strong>, depois clique em <span className={BOTAO}>Entrar</span>.</>}
                resultado={<>Abre a tela inicial com os quadrados dos módulos que você tem acesso.</>}
              />
              <Passo
                numero={2}
                acao={<>Clique no quadrado <span className={BOTAO}>📡 Comunicação</span>.</>}
                resultado={<>Abre a tela de Comunicação. Na faixa da esquerda aparece o menu, com o nome da sua área (por exemplo, <em>Câmeras</em>).</>}
              />
            </ol>
            <Aviso>
              Se aparecer <em>"Sua conta está desativada"</em>, fale com o líder da sua área: ele reativa
              seu acesso em poucos segundos.
            </Aviso>
          </Secao>

          <Secao id="op-novo" titulo="2. Começar o checklist do dia" subtitulo="Faça isso ao chegar, antes do culto">
            <ol>
              <Passo
                numero={1}
                acao={<>Na tela de Comunicação, clique no botão verde <span className={BOTAO}>➕ Novo Checklist</span>, no alto à direita.</>}
                resultado={<>Abre a tela da sua área com a lista dos checklists que você já preencheu antes.</>}
              />
              <Passo
                numero={2}
                acao={<>Clique de novo em <span className={BOTAO}>➕ Novo Checklist</span>.</>}
                resultado={<>Abre uma janelinha pedindo a <strong>Data da realização</strong>, já preenchida com a data de hoje.</>}
              />
              <Passo
                numero={3}
                acao={<>Confirme a data (mude só se o checklist for de outro dia) e clique em <span className={BOTAO}>Começar</span>.</>}
                resultado={<>Abre o checklist da sua área com todos os passos a fazer.</>}
              />
            </ol>
          </Secao>

          <Secao id="op-marcar" titulo="3. Marcar os passos" subtitulo="Durante a preparação e depois do culto">
            <p className="text-sm text-gray-700 mb-4">
              O checklist tem três partes:
            </p>
            <ul className="text-sm text-gray-700 mb-4 space-y-1 list-disc pl-5">
              <li><strong>✅ ANTES DE INICIAR</strong> — o que precisa estar pronto antes do culto começar.</li>
              <li><strong>▸ DURANTE</strong> — orientações para consultar durante o culto. Não tem o que marcar aqui.</li>
              <li><strong>🏁 DEPOIS DE FINALIZAR</strong> — o que fazer ao encerrar.</li>
            </ul>
            <ol>
              <Passo
                numero={1}
                acao={<>Clique no quadradinho ao lado de cada passo que você já concluiu.</>}
                resultado={<>O passo fica marcado e é <strong>salvo na hora</strong> — não existe botão de "salvar" para cada item. A barra de progresso e a contagem no alto do bloco vão subindo.</>}
              />
              <Passo
                numero={2}
                acao={<>Se marcou por engano, clique no mesmo quadradinho outra vez.</>}
                resultado={<>O passo volta a ficar desmarcado.</>}
              />
              <Passo
                numero={3}
                acao={<>Pode fechar o sistema e voltar depois, durante o culto, para marcar a parte do <strong>DEPOIS</strong>.</>}
                resultado={<>Suas marcações continuam salvas. Basta abrir a área e clicar no checklist da data.</>}
              />
            </ol>
            <Aviso>
              Passos marcados com <strong>crítico</strong> são os que não podem falhar. Se não conseguir
              concluir algum, avise o líder da sua área.
            </Aviso>
          </Secao>

          <Secao id="op-salvar" titulo="4. Finalizar o checklist" subtitulo="Ao terminar tudo, no fim do culto">
            <ol>
              <Passo
                numero={1}
                acao={<>Desça até o fim da tela e clique em <span className={BOTAO}>💾 Salvar Checklist</span>.</>}
                resultado={<>Abre uma confirmação mostrando a data e quantos passos você concluiu.</>}
              />
              <Passo
                numero={2}
                acao={<>Confira e clique em <span className={BOTAO}>Salvar Checklist</span> na janelinha.</>}
                resultado={<>O checklist é registrado como finalizado e o sistema volta para a tela de Comunicação. A partir daí ele fica <strong>bloqueado para alteração</strong>.</>}
              />
            </ol>
            <Aviso>
              Finalizou e precisa corrigir algo? Você não consegue desbloquear sozinho. Peça ao líder da
              sua área — ele libera o checklist para edição.
            </Aviso>
          </Secao>

          <Secao id="op-outros" titulo="5. Outros botões da tela do checklist">
            <ul className="space-y-3 text-sm text-gray-700">
              <li>
                <strong>📥 Exportar checklist</strong> — baixa um arquivo de texto com todos os passos e o
                que foi marcado. Serve para guardar ou enviar por mensagem.
              </li>
              <li>
                <strong>🔄 Reiniciar</strong> — apaga <strong>o seu</strong> preenchimento daquele dia e
                começa do zero. Pede confirmação antes. Não apaga o trabalho de outra pessoa.
              </li>
              <li>
                <strong>← Voltar</strong> — volta para a tela de Comunicação sem alterar nada.
              </li>
            </ul>
          </Secao>

          <Secao id="op-ver" titulo="6. Consultar o que você já fez">
            <ol>
              <Passo
                numero={1}
                acao={<>No menu da esquerda, clique em <span className={BOTAO}>Dashboard</span>.</>}
                resultado={<>Mostra a lista dos checklists <strong>que você preencheu</strong>, com a data e o percentual de cada um.</>}
              />
              <Passo
                numero={2}
                acao={<>Se quiser ver outro período, mude a <strong>Data inicial</strong> e a <strong>Data final</strong>.</>}
                resultado={<>A lista é atualizada sozinha, sem precisar clicar em nada.</>}
              />
              <Passo
                numero={3}
                acao={<>Clique em <span className={BOTAO}>Ver</span> no checklist que quiser conferir.</>}
                resultado={<>Abre o checklist daquele dia mostrando o que foi marcado, apenas para leitura.</>}
              />
            </ol>
          </Secao>
        </>
      )}

      {aba === 'lider' && (
        <>
          <div className="rounded-lg px-4 py-3 mb-6 text-sm" style={{ backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', color: '#3B2E5A' }}>
            <strong>Quem é o líder da área:</strong> o responsável por uma área da Comunicação. Além de
            tudo que o operador faz, você acompanha o trabalho da equipe, ajusta o checklist da sua área e
            cuida dos acessos dos seus operadores.
          </div>

          <Secao id="lid-acompanhar" titulo="1. Acompanhar o que a equipe fez" subtitulo="Tela de Comunicação (Dashboard)">
            <ol>
              <Passo
                numero={1}
                acao={<>No menu da esquerda, clique em <span className={BOTAO}>Dashboard</span>.</>}
                resultado={<>Mostra os checklists realizados na sua área, com data, percentual e o <strong>nome de quem preencheu</strong> cada um.</>}
              />
              <Passo
                numero={2}
                acao={<>Ajuste a <strong>Data inicial</strong> e a <strong>Data final</strong> para escolher o período.</>}
                resultado={<>A lista é atualizada na hora.</>}
              />
              <Passo
                numero={3}
                acao={<>No campo <strong>Operador</strong>, escolha uma pessoa da equipe.</>}
                resultado={<>A lista passa a mostrar somente os checklists daquela pessoa, e o percentual reflete o que <strong>ela</strong> marcou. Para voltar ao geral, escolha <em>Todos os operadores</em>.</>}
              />
              <Passo
                numero={4}
                acao={<>Clique em <span className={BOTAO}>Ver</span> em um checklist.</>}
                resultado={<>Abre o checklist daquele dia mostrando tudo que a equipe marcou, e em <strong>Responsável</strong> aparece quem preencheu.</>}
              />
            </ol>
            <Aviso>
              O campo <strong>Operador</strong> só aparece depois que alguém da sua equipe tiver preenchido
              algum checklist no período escolhido.
            </Aviso>
          </Secao>

          <Secao id="lid-liberar" titulo="2. Liberar um checklist já finalizado" subtitulo="Quando o operador precisa corrigir algo">
            <ol>
              <Passo
                numero={1}
                acao={<>Abra o checklist pelo botão <span className={BOTAO}>Ver</span>.</>}
                resultado={<>Abre em modo de leitura, sem permitir marcar.</>}
              />
              <Passo
                numero={2}
                acao={<>Clique em <span className={BOTAO}>✏️ Editar</span>.</>}
                resultado={<>O checklist é destravado e volta a aceitar marcações. Depois, quem for corrigir precisa clicar em <strong>💾 Salvar Checklist</strong> novamente.</>}
              />
            </ol>
          </Secao>

          <Secao id="lid-template" titulo="3. Ajustar o checklist da sua área" subtitulo="Incluir, mudar o texto ou tirar passos">
            <p className="text-sm text-gray-700 mb-4">
              Isso muda o checklist <strong>para todos os cultos seguintes</strong> da sua área. Os
              checklists já finalizados não são alterados.
            </p>
            <ol>
              <Passo
                numero={1}
                acao={<>No menu da esquerda, embaixo do nome da sua área, clique em <span className={BOTAO}>⚙️ Gerenciar Checklist</span>.</>}
                resultado={<>Abre uma janela com dois blocos: o formulário para adicionar um passo e, abaixo, a lista dos passos que existem hoje.</>}
              />
              <Passo
                numero={2}
                acao={<><strong>Para incluir um passo:</strong> preencha o <strong>Título</strong> (obrigatório), a <strong>Descrição</strong> (opcional), escolha a <strong>Fase</strong> — Antes, Durante ou Depois — e clique em <span className={BOTAO}>➕ Adicionar Passo</span>.</>}
                resultado={<>O passo aparece na lista, no grupo <em>CUSTOMIZADOS</em>, e passa a valer no checklist da área.</>}
              />
              <Passo
                numero={3}
                acao={<><strong>Para mudar o texto de um passo:</strong> clique no <span className={BOTAO}>✏️</span> ao lado dele, corrija o título e a descrição e clique em <span className={BOTAO}>💾 Salvar</span>.</>}
                resultado={<>O passo passa a mostrar o texto novo, com a marca <em>(editado)</em>. Um botão <strong>↩️ Restaurar original</strong> aparece caso queira voltar ao texto de fábrica.</>}
              />
              <Passo
                numero={4}
                acao={<><strong>Para tirar um passo:</strong> clique no <span className={BOTAO}>🗑️</span> e confirme.</>}
                resultado={<>O passo deixa de aparecer no checklist e o total de passos diminui.</>}
              />
              <Passo
                numero={5}
                acao={<>Quando terminar, clique no <span className={BOTAO}>×</span> no alto da janela.</>}
                resultado={<>A janela fecha e o checklist da tela já aparece com as alterações.</>}
              />
            </ol>
          </Secao>

          <Secao id="lid-cadastrar" titulo="4. Cadastrar um novo operador" subtitulo="Quando entra alguém novo na sua equipe">
            <ol>
              <Passo
                numero={1}
                acao={<>No menu da esquerda, clique em <span className={BOTAO}>👥 Gerenciar Liderados</span>.</>}
                resultado={<>Abre a lista dos operadores da sua área.</>}
              />
              <Passo
                numero={2}
                acao={<>Clique em <span className={BOTAO}>➕ Novo Operador</span>.</>}
                resultado={<>Abre uma janela com quatro campos para preencher.</>}
              />
              <Passo
                numero={3}
                acao={<>Preencha <strong>Nome Completo</strong>, <strong>E-mail</strong>, <strong>Usuário (login)</strong> e <strong>Senha</strong> (no mínimo 6 caracteres) e clique em <span className={BOTAO}>Cadastrar</span>.</>}
                resultado={<>A pessoa é criada já com acesso à <strong>sua área</strong> e aparece na lista como <em>Ativo</em>. Você não precisa escolher permissões: o sistema define sozinho.</>}
              />
              <Passo
                numero={4}
                acao={<>Passe o usuário e a senha para a pessoa.</>}
                resultado={<>Ela já consegue entrar e preencher o checklist da área.</>}
              />
            </ol>
            <Aviso>
              O campo <strong>E-mail</strong> é obrigatório porque é por ele que a pessoa recupera a senha
              sozinha depois. Se aparecer <em>"Nome de usuário já existe"</em>, escolha outro login.
            </Aviso>
          </Secao>

          <Secao id="lid-senha" titulo="5. Trocar a senha de um operador" subtitulo="Quando a pessoa esquece a senha">
            <ol>
              <Passo
                numero={1}
                acao={<>Clique em <span className={BOTAO}>👥 Gerenciar Liderados</span> e localize a pessoa na lista.</>}
                resultado={<>Cada pessoa aparece em um cartão com o nome, o login, o e-mail e o status.</>}
              />
              <Passo
                numero={2}
                acao={<>Clique em <span className={BOTAO}>🔐 Alterar Senha</span>.</>}
                resultado={<>Abre uma janela com o campo de senha e o status da conta.</>}
              />
              <Passo
                numero={3}
                acao={<>Digite a nova senha (no mínimo 6 caracteres) e clique em <span className={BOTAO}>Salvar</span>.</>}
                resultado={<>A senha é trocada na hora. Informe a nova senha à pessoa.</>}
              />
            </ol>
            <Aviso>
              O sistema nunca mostra a senha antiga — nem para você. Se alguém esquecer, o caminho é
              cadastrar uma nova.
            </Aviso>
          </Secao>

          <Secao id="lid-status" titulo="6. Desativar ou reativar um operador" subtitulo="Quando alguém sai ou volta para a equipe">
            <ol>
              <Passo
                numero={1}
                acao={<>Em <span className={BOTAO}>👥 Gerenciar Liderados</span>, clique em <span className={BOTAO}>⚪ Desativar</span> no cartão da pessoa.</>}
                resultado={<>Abre um pedido de confirmação.</>}
              />
              <Passo
                numero={2}
                acao={<>Confirme clicando em <span className={BOTAO}>Desativar</span>.</>}
                resultado={<>A pessoa passa a aparecer como <em>Inativo</em> e <strong>não consegue mais entrar</strong>. Os checklists que ela preencheu continuam guardados.</>}
              />
              <Passo
                numero={3}
                acao={<>Para trazer alguém de volta, clique em <span className={BOTAO}>✅ Reativar</span> no cartão dela.</>}
                resultado={<>A conta volta a funcionar com a mesma senha de antes.</>}
              />
            </ol>
            <Aviso>
              Desativar é o jeito certo de tirar o acesso de quem saiu da equipe: nada é apagado e dá para
              reverter depois.
            </Aviso>
          </Secao>

          <Secao id="lid-preencher" titulo="7. O líder também preenche checklist">
            <p className="text-sm text-gray-700">
              Você pode operar e preencher o checklist como qualquer operador — o passo a passo é o mesmo
              descrito na aba <strong>🎧 Para o operador</strong>. Só uma diferença: quando você está
              <strong> preenchendo</strong>, as marcações que aparecem são <strong>as suas</strong>. Para
              ver o que a equipe marcou, use o botão <strong>Ver</strong> no Dashboard.
            </p>
          </Secao>
        </>
      )}

      <Secao id="ajuda" titulo="Dúvidas comuns">
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold" style={{ color: COR_TITULO }}>Marquei os passos e fechei o navegador sem salvar. Perdi tudo?</p>
            <p>Não. Cada passo é salvo no momento em que você clica. O botão <strong>💾 Salvar Checklist</strong> serve para encerrar e registrar o checklist como concluído.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: COR_TITULO }}>Aparece "Acesso negado" ao abrir uma área.</p>
            <p>Você só tem acesso às áreas da sua função. Se precisar de outra área, fale com o administrador.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: COR_TITULO }}>Aparece "Sua conta está desativada".</p>
            <p>O acesso foi suspenso. O líder da sua área reativa em <strong>Gerenciar Liderados</strong>.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: COR_TITULO }}>O sistema me pediu login de novo.</p>
            <p>Depois de 20 minutos sem uso, a sessão expira por segurança. Basta entrar novamente; nada do que foi marcado se perde.</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: COR_TITULO }}>Finalizei o checklist e preciso corrigir.</p>
            <p>Peça ao líder da área: ele abre o checklist em <strong>Ver</strong> e clica em <strong>✏️ Editar</strong> para liberar.</p>
          </div>
        </div>
      </Secao>
    </div>
  )
}
