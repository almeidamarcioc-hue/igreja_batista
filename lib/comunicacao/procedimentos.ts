/* ============================================================================
   RUNBOOK OPERACIONAL — IBTM (Igreja Batista Transformação)
   ARQUIVO DE DADOS — ÚNICO arquivo que um voluntário precisa editar
   para mudar qualquer passo, aviso ou imagem. NÃO é preciso mexer no app.
   ========================================================================== */

export interface Passo {
  id: string
  titulo: string
  descricao: string
  aviso: string
  imagem: string
  critico: boolean
}

export interface Troubleshooting {
  problema: string
  solucao: string
}

export interface Area {
  id: string
  nome: string
  icone: string
  cor: string
  responsavelSugerido: string
  chegadaAntecedencia: string
  dependencias: string
  observacoes: string
  pendente?: boolean
  pendenteMensagem?: string
  fases: {
    pre: Passo[]
    operacao: Passo[]
    pos: Passo[]
  }
  troubleshooting: Troubleshooting[]
}

export interface Procedimentos {
  atualizadoEm: string
  areas: Area[]
}

export const PROCEDIMENTOS: Procedimentos = {
  atualizadoEm: '2026-07-21',
  areas: [
    /* =====================================================================
       ÁREA 1 — TRANSMISSÃO NO YOUTUBE
       Fonte: Checklist Transmissao.pdf
    ===================================================================== */
    {
      id: 'transmissao-youtube',
      nome: 'Transmissão no YouTube',
      icone: '📡',
      cor: '#e11d48',
      responsavelSugerido: 'Operador de Live',
      chegadaAntecedencia: '',
      dependencias: 'Depende do áudio do Gabriel (Reaper/ReaStream via rede) e do vídeo do ATEM Mini Pro (equipe de Câmeras).',
      observacoes: '',
      fases: {
        pre: [
          { id: 'yt-pre-01', titulo: 'Abrir o OBS e confirmar a coleção de cenas', descricao: 'Confira pelo título da janela se o perfil/coleção de cenas correto está carregado.', aviso: '', imagem: '/comunicacao/img/yt-obs-interface.jpeg', critico: true },
          { id: 'yt-pre-02', titulo: 'Conferir se as 4 cenas existem', descricao: 'principal, biblia, slide e preset.', aviso: '', imagem: '', critico: true },
          { id: 'yt-pre-03', titulo: 'Ativar o Modo estúdio', descricao: 'Permite preparar a próxima cena antes de colocá-la no ar.', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-04', titulo: 'Verificar FPS e CPU', descricao: 'No canto inferior direito: FPS estável (ex.: 30.00/30.00) e CPU sem sobrecarga.', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-05', titulo: 'Ligar o ATEM Mini Pro e conferir as câmeras', descricao: '2 câmeras + monitor de retorno conectados por HDMI firme. Conferir imagem no monitor de retorno.', aviso: '', imagem: '/comunicacao/img/yt-atem-mini-pro.jpeg', critico: true },
          { id: 'yt-pre-06', titulo: 'Confirmar a entrada em "PGM" no ATEM', descricao: 'Antes do culto, confirme qual entrada está ao vivo (PGM).', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-07', titulo: 'Conferir a fonte "blackmagic" no OBS', descricao: 'Em Propriedades: Dispositivo = ATEM Mini Pro (não confundir com NDI Webcam Video). Imagem nítida na pré-visualização, sem tela preta ou congelada.', aviso: '', imagem: '/comunicacao/img/yt-blackmagic-props.jpeg', critico: true },
          { id: 'yt-pre-08', titulo: 'Confirmar com o Gabriel o envio do áudio', descricao: 'Reaper aberto e enviando ("Send") o áudio pela rede.', aviso: '⚠️ A transmissão depende desse envio — confirme antes de ir ao ar.', imagem: '', critico: true },
          { id: 'yt-pre-09', titulo: 'Conferir o filtro ReaStream da fonte "reaper"', descricao: 'Enabled marcado, modo "Receive audio/MIDI", Identifier combinando com o Gabriel (normalmente "default").', aviso: '', imagem: '/comunicacao/img/yt-reastream.jpeg', critico: false },
          { id: 'yt-pre-10', titulo: 'Conferir o áudio no mixer', descricao: 'A barra da fonte "reaper" deve se mover ao falar/tocar (não travada em -inf dB). A fonte não pode estar muda.', aviso: '', imagem: '', critico: true },
          { id: 'yt-pre-11', titulo: 'Atualizar o vídeo IBTMNEWS da semana', descricao: 'Baixar o .mp4 da semana. Na cena "preset", fonte IBTMNEWS > Propriedades > Arquivo local > Explorar e selecionar o novo arquivo.', aviso: '', imagem: '/comunicacao/img/yt-cena-preset.jpeg', critico: true },
          { id: 'yt-pre-12', titulo: 'Marcar "Reiniciar reprodução quando a fonte se tornar ativa"', descricao: 'Para o vídeo sempre começar do início.', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-13', titulo: 'Testar a reprodução completa do IBTMNEWS', descricao: 'Áudio e imagem sincronizados.', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-14', titulo: 'Conferir as demais fontes da cena "preset"', descricao: 'Intro Culto, Dizimo, Encerramento, Pix, Redes sociais — devem continuar como estavam.', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-15', titulo: 'Criar/abrir a transmissão do dia no YouTube Studio', descricao: 'Data e título corretos.', aviso: '', imagem: '/comunicacao/img/yt-youtube-studio.jpeg', critico: true },
          { id: 'yt-pre-16', titulo: 'Definir Privacidade como Público', descricao: 'A tempo de gerar o link para divulgação.', aviso: '', imagem: '', critico: true },
          { id: 'yt-pre-17', titulo: 'Gerar e enviar o link da live', descricao: 'Copiar o link público e enviar para quem divulga (redes sociais, WhatsApp) com antecedência.', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-18', titulo: 'Conferir a monetização', descricao: 'Ativado/desativado conforme decisão da equipe.', aviso: '⚠️ Padrão ainda não definido nos documentos — confirmar com a equipe.', imagem: '', critico: false },
          { id: 'yt-pre-19', titulo: 'Configurar as transições de cena', descricao: 'Ex.: Esmaecer 300ms, para trocas suaves.', aviso: '', imagem: '', critico: false },
          { id: 'yt-pre-20', titulo: 'Fazer um teste rápido de transmissão', descricao: 'Poucos minutos antes do culto: confirmar áudio e vídeo chegando corretamente no YouTube.', aviso: '', imagem: '', critico: true },
        ],
        operacao: [
          { id: 'yt-op-01', titulo: 'Iniciar a transmissão no OBS no horário combinado', descricao: 'Clicar em "Iniciar transmissão".', aviso: '', imagem: '', critico: true },
          { id: 'yt-op-02', titulo: 'Aguardar o status no YouTube', descricao: 'Deve mudar de "Não há dados" para "pronto para transmitir".', aviso: '', imagem: '', critico: false },
          { id: 'yt-op-03', titulo: 'Trocar de cena com as transições configuradas', descricao: 'principal / biblia / slide / preset conforme o momento do culto.', aviso: '', imagem: '', critico: false },
          { id: 'yt-op-04', titulo: 'Comunicar a equipe se algo sair do esperado', descricao: 'Qualquer item fora do padrão deve ser avisado a tempo de corrigir.', aviso: '', imagem: '', critico: false },
        ],
        pos: [
          { id: 'yt-pos-01', titulo: 'Encerrar a transmissão no OBS', descricao: 'Parar a transmissão ao fim do culto.', aviso: '⚠️ O procedimento detalhado de encerramento não consta no documento base — confirmar o passo exato com a equipe.', imagem: '', critico: true },
          { id: 'yt-pos-02', titulo: 'Finalizar a live no YouTube Studio', descricao: 'Encerrar a transmissão no painel do YouTube.', aviso: '⚠️ Passo pendente de detalhamento pela equipe.', imagem: '', critico: false },
          { id: 'yt-pos-03', titulo: 'Salvar/conferir a gravação da live', descricao: 'Confirmar que a gravação ficou salva.', aviso: '⚠️ Definir com a equipe onde e como salvar/exportar.', imagem: '', critico: false },
        ],
      },
      troubleshooting: [
        { problema: 'YouTube mostra "Não há dados"', solucao: 'É normal antes de iniciar a transmissão no OBS. Após clicar em "Iniciar transmissão", aguarde o status mudar para "pronto para transmitir". (Info do manual de transmissão.)' },
      ],
    },

    /* =====================================================================
       ÁREA 2 — MIX DE SOM PARA A TRANSMISSÃO
       Fonte: Checklist_Equipe_de_Audio.pdf
    ===================================================================== */
    {
      id: 'mix-som',
      nome: 'Mix de som',
      icone: '🎚️',
      cor: '#f59e0b',
      responsavelSugerido: 'Equipe de Áudio / MIX',
      chegadaAntecedencia: '1 hora',
      dependencias: 'Recebe o áudio do notebook da mesa de som; grava no Reaper e alimenta a transmissão.',
      observacoes: '',
      fases: {
        pre: [
          { id: 'mix-pre-01', titulo: 'Chegar 1 hora antes para acompanhar o ensaio do louvor', descricao: '', aviso: '', imagem: '', critico: true },
          { id: 'mix-pre-02', titulo: 'Verificar o envio do áudio com a mesa de som', descricao: 'Confirmar que o notebook está ligado e enviando o áudio para o computador da MIX.', aviso: '', imagem: '', critico: true },
          { id: 'mix-pre-03', titulo: 'Ligar o computador da MIX', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'mix-pre-04', titulo: 'Abrir o Reaper', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'mix-pre-05', titulo: 'Abrir o OBS', descricao: 'Usado para monitorar o áudio e visualizar o culto.', aviso: '', imagem: '', critico: false },
          { id: 'mix-pre-06', titulo: 'Regular o áudio durante o ensaio', descricao: 'Verificar se todos os microfones e instrumentos estão funcionando corretamente.', aviso: '', imagem: '', critico: true },
        ],
        operacao: [
          { id: 'mix-op-01', titulo: 'Iniciar a gravação no Reaper no início do louvor', descricao: '', aviso: '', imagem: '', critico: true },
          { id: 'mix-op-02', titulo: 'Acompanhar os níveis de áudio durante toda a gravação', descricao: 'Garantir boa qualidade do início ao fim.', aviso: '', imagem: '', critico: false },
        ],
        pos: [
          { id: 'mix-pos-01', titulo: 'Encerrar a gravação', descricao: '', aviso: '', imagem: '', critico: true },
          { id: 'mix-pos-02', titulo: 'Salvar o projeto do Reaper com a data do culto no nome', descricao: 'Ex.: 2026-07-21.rpp', aviso: '', imagem: '', critico: true },
          { id: 'mix-pos-03', titulo: 'Fechar os programas e desligar o computador', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'mix-pos-04', titulo: 'Verificar se a sala está organizada', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'mix-pos-05', titulo: 'Desligar o ar-condicionado, se foi utilizado', descricao: '', aviso: '', imagem: '', critico: false },
        ],
      },
      troubleshooting: [],
    },

    /* =====================================================================
       ÁREA 3 — DATASHOW (projeção / Holyrics)
       Fonte: COMUNICAÇÃO OPERADOR DE DATASHOW 2026.pdf
    ===================================================================== */
    {
      id: 'datashow',
      nome: 'Datashow',
      icone: '📽️',
      cor: '#3b82f6',
      responsavelSugerido: 'Operador de Datashow',
      chegadaAntecedencia: '1h15',
      dependencias: 'Arquivos do dia chegam pelo grupo do WhatsApp "DataShow". Software: Holyrics.',
      observacoes: '',
      fases: {
        pre: [
          { id: 'ds-pre-01', titulo: 'Chegar com no mínimo 1h15 e ir à sala da comunicação', descricao: '', aviso: '', imagem: '/comunicacao/img/datashow-sala.jpeg', critico: true },
          { id: 'ds-pre-02', titulo: 'Ligar o computador', descricao: 'Botão liga/desliga do CPU e depois do monitor.', aviso: '', imagem: '/comunicacao/img/datashow-computador.jpeg', critico: false },
          { id: 'ds-pre-03', titulo: 'Ligar os 4 disjuntores do Datashow / canhão de luzes', descricao: 'Na caixa de energia ao lado do altar (aciona os 4 disjuntores de uma vez).', aviso: '', imagem: '/comunicacao/img/datashow-disjuntores.jpeg', critico: true },
          { id: 'ds-pre-04', titulo: 'Ligar os 2 projetores com o controle', descricao: 'Um acima do altar, outro acima da mesa de som. Segure o power apontando ao aparelho até a luz azul piscar. Os controles ficam na sala da comunicação, ao lado do computador.', aviso: '', imagem: '', critico: true },
          { id: 'ds-pre-05', titulo: 'Abrir o Holyrics', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'ds-pre-06', titulo: 'Baixar os arquivos do dia (WhatsApp Web)', descricao: 'Grupo "DataShow". Salvar em ARQUIVOS > CULTOS DOMINGOS > 2026 > MÊS > PASTA DO DIA (criar a pasta se não existir). Arquivos: vídeo timer (fixo), introdução (fixo), avisos (semanal), adicionais, capa tema.', aviso: '', imagem: '', critico: true },
          { id: 'ds-pre-07', titulo: 'Adicionar os vídeos no Holyrics', descricao: 'Arrastar os vídeos para a coluna esquerda (aba "vídeo").', aviso: '', imagem: '', critico: false },
          { id: 'ds-pre-08', titulo: 'Montar a lista de canções (Letras)', descricao: 'Conferir com o louvor as músicas do dia. Em "Letras", pesquisar cada uma e arrastar para a coluna direita. Conferir se batem com o ensaio.', aviso: '', imagem: '', critico: true },
          { id: 'ds-pre-09', titulo: 'Conferir o tema de cada música', descricao: 'Deve estar no tema padrão; alterar uma por vez. Em dúvida, falar com outro voluntário do datashow.', aviso: '', imagem: '', critico: false },
        ],
        operacao: [
          { id: 'ds-op-01', titulo: 'Abertura: reproduzir Timer, Introdução e Avisos (nesta ordem)', descricao: 'Programar o Timer para zerar no horário definido pelo pastor. Ao acabar um vídeo, 2x clique no próximo para reproduzir.', aviso: '', imagem: '', critico: true },
          { id: 'ds-op-02', titulo: 'Louvor: acompanhar as letras', descricao: '1x clique no nome da música para selecioná-la; ao iniciar, 2x na 1ª frase. Avance/volte com as setas → / ←, alguns segundos antes de os músicos terminarem a frase.', aviso: '', imagem: '', critico: false },
          { id: 'ds-op-03', titulo: 'Apagar a letra em ministração/instrumental', descricao: 'Tecla F9 deixa o telão sem letra. Clique 2x na frase para ela voltar a aparecer.', aviso: '', imagem: '', critico: false },
          { id: 'ds-op-04', titulo: 'Colocar a Capa de tema quando começar a mensagem', descricao: 'Alterar papel de parede: Arquivo > Configurações > Papel de parede > Alterar > pasta do dia > selecionar o PNG.', aviso: '', imagem: '', critico: false },
          { id: 'ds-op-05', titulo: 'Durante a ministração: usar "Ir para Bíblia"', descricao: 'Digitar livro + capítulo + versículo. Número único: prefixar "0" (ex.: "08"). Salmos: "008". ESC volta à capa tema.', aviso: '', imagem: '', critico: false },
          { id: 'ds-op-06', titulo: 'Louvor final: repetir o acompanhamento das letras', descricao: '', aviso: '', imagem: '', critico: false },
        ],
        pos: [
          { id: 'ds-pos-01', titulo: 'Desligar os projetores (datashow)', descricao: '', aviso: '', imagem: '', critico: true },
          { id: 'ds-pos-02', titulo: 'Desligar os disjuntores ligados na chegada', descricao: '', aviso: '', imagem: '', critico: true },
          { id: 'ds-pos-03', titulo: 'Fechar o Holyrics, pastas e arquivos', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'ds-pos-04', titulo: 'Desconectar o WhatsApp Web', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'ds-pos-05', titulo: 'Desligar o computador e o monitor', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'ds-pos-06', titulo: 'Pendurar o fone no gancho da parede', descricao: '', aviso: '', imagem: '', critico: false },
        ],
      },
      troubleshooting: [],
    },

    /* =====================================================================
       ÁREA 4 — CÂMERAS (filmagem)
       Fonte: Checklist_Ministerio_Comunicacao.pdf
    ===================================================================== */
    {
      id: 'cameras',
      nome: 'Câmeras',
      icone: '🎥',
      cor: '#10b981',
      responsavelSugerido: 'Operador de Câmera',
      chegadaAntecedencia: '1h30',
      dependencias: 'Entrega o vídeo ao switch/ATEM Mini Pro que alimenta a Transmissão.',
      observacoes: 'Fundamentos do ministério: pontualidade, reverência durante o culto, cuidado com o patrimônio, não abandonar o posto, comunicação objetiva com o diretor e trabalho em equipe.',
      fases: {
        pre: [
          { id: 'cam-pre-01', titulo: 'Chegar com no mínimo 1h30 de antecedência', descricao: '', aviso: '', imagem: '', critico: true },
          { id: 'cam-pre-02', titulo: 'Participar da oração inicial (15 min)', descricao: 'Tempo de Palavra, Meditação, Oração e Comunhão.', aviso: '', imagem: '', critico: false },
          { id: 'cam-pre-03', titulo: 'Confirmar sua função na escala', descricao: 'Checar o QR Code de voluntários.', aviso: '', imagem: '', critico: false },
          { id: 'cam-pre-04', titulo: 'Colocar o headset (quando houver)', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'cam-pre-05', titulo: 'Conferir uniforme/vestimenta adequada', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'cam-pre-06', titulo: 'Montar a Câmera 1 (bag azul)', descricao: 'Levar ao suporte na parede, perto da mesa de som. Encaixar e apertar a trava até ficar firme. Ligar e confirmar a imagem.', aviso: '', imagem: '/comunicacao/img/cam-camera1.jpeg', critico: true },
          { id: 'cam-pre-07', titulo: 'Montar a Câmera 2 (bag vermelha)', descricao: 'Posicionar ao lado da Sala de Comunicação. Fixar no tripé/suporte. Conectar os cabos (energia, HDMI/SDI e rede, se houver). Ligar e confirmar a imagem no sistema.', aviso: '', imagem: '/comunicacao/img/cam-camera2.jpeg', critico: true },
          { id: 'cam-pre-08', titulo: 'Inspecionar o equipamento', descricao: 'Tripé firme, cabeça hidráulica funcionando, travas apertadas, câmera fixa, fonte ligada, gimbal/bateria (câmera móvel), cartão de memória instalado, cabos conectados, imagem chegando ao switch, sem mensagens de erro.', aviso: '', imagem: '', critico: true },
          { id: 'cam-pre-09', titulo: 'Configurar a câmera', descricao: 'Lente limpa, foco ajustado, zoom ok, White Balance, ISO correto, obturador (FPS 40–90), exposição (a partir de f/4), nitidez, horizonte nivelado, resolução e FPS corretos.', aviso: '', imagem: '', critico: false },
          { id: 'cam-pre-10', titulo: 'Conferir o posicionamento', descricao: 'Não obstruir pessoas, operador consegue se mover, sem cabos atravessando a passagem, tripé nivelado, enquadramento inicial definido.', aviso: '', imagem: '', critico: false },
          { id: 'cam-pre-11', titulo: 'Fazer o teste geral antes da transmissão', descricao: 'Todas as câmeras funcionando e aparecendo no switch, GC (gerador de caracteres), vinhetas, gravação iniciada, live programada, áudio monitorado.', aviso: '', imagem: '', critico: true },
        ],
        operacao: [
          { id: 'cam-op-01', titulo: 'Manter o pregador sempre bem enquadrado', descricao: 'Em foco, dentro do quadro, sem sombra no rosto, cabeça não cortada, mãos visíveis ao gesticular.', aviso: '', imagem: '', critico: true },
          { id: 'cam-op-02', titulo: 'Cobrir o louvor', descricao: 'Vocalista principal, instrumentistas, solistas, coral, congregação, bateria, teclado, violão, guitarra.', aviso: '', imagem: '', critico: false },
          { id: 'cam-op-03', titulo: 'Fazer movimentos suaves', descricao: 'Zoom lento, pan e tilt suaves, sem tremores ou movimentos bruscos. Antecipar a movimentação.', aviso: '', imagem: '', critico: false },
          { id: 'cam-op-04', titulo: 'Manter comunicação com o diretor', descricao: 'Responder imediatamente, confirmar comandos, avisar sobre problemas, não conversar assuntos paralelos, atento ao headset.', aviso: '', imagem: '', critico: false },
          { id: 'cam-op-05', titulo: 'Conferir a qualidade a cada 15 minutos', descricao: 'Áudio limpo/sem chiado, vídeo nítido/sem travamento, internet estável, sincronismo correto, nenhuma câmera fora do ar.', aviso: '', imagem: '', critico: false },
        ],
        pos: [
          { id: 'cam-pos-01', titulo: 'Desligar as câmeras', descricao: '', aviso: '', imagem: '', critico: true },
          { id: 'cam-pos-02', titulo: 'Guardar baterias e cartões', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'cam-pos-03', titulo: 'Enrolar os cabos corretamente', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'cam-pos-04', titulo: 'Guardar os tripés', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'cam-pos-05', titulo: 'Limpar as lentes', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'cam-pos-06', titulo: 'Guardar as câmeras nas bags', descricao: 'Azul = Câmera 1 / Vermelha = Câmera 2. Conferir se as duas bags estão completas e no armário.', aviso: '', imagem: '/comunicacao/img/cam-armario-bags.jpeg', critico: true },
          { id: 'cam-pos-07', titulo: 'Organizar a sala técnica e conferir se nada ficou ligado', descricao: '', aviso: '', imagem: '', critico: false },
          { id: 'cam-pos-08', titulo: 'Registrar falhas e manutenção', descricao: 'Alguma câmera com falha? Cabo danificado? Tripé com defeito? Bateria fraca? Algum equipamento precisa de manutenção? Registrar a ocorrência.', aviso: '', imagem: '', critico: false },
        ],
      },
      troubleshooting: [],
    },

    /* =====================================================================
       ÁREA 5 — ILUMINAÇÃO (Lumikit / cena de palco)
       ⚠️ SEM MATERIAL BASE. Área criada como PENDENTE, aguardando o time
       fornecer o passo a passo. NÃO invente procedimentos.
    ===================================================================== */
    {
      id: 'iluminacao',
      nome: 'Iluminação',
      icone: '💡',
      cor: '#a855f7',
      responsavelSugerido: '',
      chegadaAntecedencia: '',
      dependencias: 'Observação: o canhão de luzes compartilha os 4 disjuntores ligados pela equipe do Datashow.',
      observacoes: '',
      pendente: true,
      pendenteMensagem: 'Ainda não há procedimento de iluminação (Lumikit) documentado. Assim que o time definir o passo a passo, preencha as fases desta área no arquivo procedimentos.ts.',
      fases: {
        pre: [],
        operacao: [],
        pos: [],
      },
      troubleshooting: [],
    },
  ],
}
