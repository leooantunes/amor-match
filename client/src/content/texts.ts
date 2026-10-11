/** Textos globais do app — altere aqui para mudar em todas as telas. */
export const t = {
  appName: 'LoveMatch',
  tagline: 'Descubram juntos o quanto vocês combinam',
  skipToContent: 'Pular para o conteúdo',
  footer: 'Feito com carinho para casais curiosos. Suas respostas ficam apenas na sala de vocês.',

  home: {
    title: 'Será que combinamos?',
    subtitle:
      'Cada um responde no seu próprio celular. Algumas perguntas pedem para adivinhar o que o outro respondeu. No fim, vocês recebem um relatório de compatibilidade.',
    createTitle: 'Criar uma sala',
    createHelp: 'Comece e envie o código ou link para a pessoa amada.',
    joinTitle: 'Entrar com um código',
    joinHelp: 'Recebeu um código? Digite abaixo.',
    nameLabel: 'Seu nome',
    namePlaceholder: 'Como você gosta de ser chamado(a)?',
    codeLabel: 'Código da sala',
    create: 'Criar sala',
    join: 'Entrar na sala',
    steps: ['Criem a sala', 'Respondam separados', 'Vejam o relatório'],
  },

  lobby: {
    title: 'Sala criada!',
    help: 'Envie o código ou o link abaixo para seu par. Esta tela atualiza sozinha quando a pessoa entrar.',
    code: 'Código da sala',
    copyLink: 'Copiar link',
    copied: 'Link copiado!',
    share: 'Compartilhar',
    waiting: 'Aguardando seu par entrar…',
    partnerJoined: (n: string) => `${n} entrou na sala!`,
    start: 'Começar perguntas',
  },

  join: {
    title: 'Você foi convidado(a)!',
    help: 'Informe seu nome para entrar na sala.',
  },

  quiz: {
    progress: (a: number, b: number) => `Pergunta ${a} de ${b}`,
    scaleLegend: 'O quanto você concorda?',
    guessLegend: (n: string) => `Como você acha que ${n} respondeu?`,
    guessHint: 'Pergunta interligada: palpite agora e descubra no final se acertou.',
    back: 'Voltar',
    next: 'Próxima',
    finish: 'Finalizar',
    saving: 'Salvando…',
    scale: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'],
    scaleShort: ['Discordo muito', 'Discordo', 'Neutro', 'Concordo', 'Concordo muito'],
  },

  waiting: {
    title: 'Você terminou!',
    help: (n: string) => `Agora é só esperar ${n} terminar. O relatório aparece aqui automaticamente.`,
    partnerProgress: (n: string, a: number, b: number) => `${n} respondeu ${a} de ${b}`,
  },

  report: {
    title: 'Relatório de compatibilidade',
    overall: 'Compatibilidade geral',
    sintoniaTitle: 'Sintonia (quanto se conhecem)',
    categories: 'Por área',
    strengths: 'Onde vocês se encontram',
    strengthsEmpty: 'Nenhuma resposta idêntica desta vez — e tudo bem!',
    attention: 'Pontos para conversar',
    attentionEmpty: 'Nenhuma grande divergência. Parabéns!',
    downloadPdf: 'Salvar relatório em PDF',
    premium: {
      title: 'Análise Premium do casal',
      subtitle: 'Apoie a manutenção do LoveMatch e receba um guia personalizado para transformar o resultado em boas conversas e momentos a dois.',
      donation: (value: string) => `Contribuição única de ${value} por casal`,
      benefitsTitle: 'O que vocês recebem',
      benefits: [
        {
          icon: '♡',
          title: 'Conversas que aproximam',
          description: 'Perguntas personalizadas para explorar as áreas em que vocês podem se entender ainda melhor.',
        },
        {
          icon: '✦',
          title: 'Encontros com intenção',
          description: 'Ideias de atividades a dois pensadas para criar conexão e boas lembranças.',
        },
        {
          icon: '7',
          title: 'Um desafio de 7 dias',
          description: 'Um ritual simples para reservar tempo de qualidade e fortalecer a parceria no dia a dia.',
        },
        {
          icon: '↓',
          title: 'Relatório completo em PDF',
          description: 'Salvem e revisitem juntos os resultados, sugestões e próximos passos para o casal.',
        },
      ],
      pixInstructions: (value: string) => `Faça um Pix de ${value} para apoiar a manutenção do LoveMatch.`,
      pixKeyLabel: 'Chave Pix',
      pixCopyPasteLabel: 'Pix Copia e Cola',
      copyPix: 'Copiar código Pix',
      pixCopied: 'Código Pix copiado!',
      pixCopyError: 'Não foi possível copiar. Selecione e copie o código Pix manualmente.',
      confirm: 'Já fiz a doação — liberar Premium',
      confirmDisclosure: 'A confirmação é manual. O LoveMatch não consegue verificar o Pix automaticamente. Confirme somente depois de concluir a transferência.',
      confirmed: 'Premium liberado para o casal.',
      setupRequired: 'A chave Pix ainda não foi configurada.',
      confirming: 'Liberando o Premium…',
      conversationGuide: 'Um roteiro para conversar',
      dateIdeas: 'Ideias de encontro para vocês',
      connectionChallenge: 'Desafio de conexão de 7 dias',
      unlocked: 'Premium desbloqueado para o casal',
    },
    newTest: 'Fazer novo teste',
    disclaimer: 'Este teste é uma brincadeira para inspirar boas conversas e não substitui o diálogo entre vocês.',
  },

  common: {
    loading: 'Carregando…',
    error: 'Algo deu errado. Tente novamente.',
    retry: 'Tentar de novo',
    home: 'Ir para o início',
  },
}
