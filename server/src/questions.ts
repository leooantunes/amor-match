export type CategoryId =
  | 'comunicacao'
  | 'valores'
  | 'estilo'
  | 'intimidade'
  | 'financas'
  | 'futuro'

export type QuestionMode = 'casais' | 'ficantes'

export interface Category {
  id: CategoryId
  label: string
  description: string
}

export interface Question {
  id: string
  category: CategoryId
  text: string
  mode?: QuestionMode
  /** Peso 1-3 no cálculo da compatibilidade. */
  weight: 1 | 2 | 3
  /** Se true, cada pessoa também palpita a resposta do parceiro(a). */
  guess?: boolean
}

export const categories: Category[] = [
  { id: 'comunicacao', label: 'Comunicação', description: 'Como vocês conversam e resolvem conflitos' },
  { id: 'valores', label: 'Valores', description: 'O que é importante para cada um' },
  { id: 'estilo', label: 'Estilo de vida', description: 'Rotina, lazer e convivência' },
  { id: 'intimidade', label: 'Afeto e intimidade', description: 'Como demonstram e recebem carinho' },
  { id: 'financas', label: 'Finanças', description: 'Dinheiro, planejamento e prioridades' },
  { id: 'futuro', label: 'Futuro', description: 'Planos e sonhos a dois' },
]

export const questions: Question[] = [
  { id: 'c1', category: 'comunicacao', weight: 3, text: 'Prefiro resolver um desentendimento conversando na hora, sem deixar para depois.' },
  { id: 'c2', category: 'comunicacao', weight: 2, text: 'Preciso de um tempo sozinho(a) para esfriar a cabeça depois de uma discussão.', guess: true },
  { id: 'c3', category: 'comunicacao', weight: 2, text: 'Conto ao meu par tudo o que sinto, mesmo quando é difícil.' },
  { id: 'c4', category: 'comunicacao', weight: 1, text: 'Gosto de conversar sobre o nosso dia todos os dias.' },

  { id: 'v1', category: 'valores', weight: 3, text: 'Fidelidade e lealdade são inegociáveis para mim.' },
  { id: 'v2', category: 'valores', weight: 2, text: 'A espiritualidade ou religião tem um papel importante na minha vida.', guess: true },
  { id: 'v3', category: 'valores', weight: 2, text: 'A família (pais, irmãos) deve estar muito presente na vida do casal.' },
  { id: 'v4', category: 'valores', weight: 3, text: 'Honestidade total vale mais do que poupar sentimentos.' },

  { id: 'e1', category: 'estilo', weight: 2, text: 'Prefiro um fim de semana em casa a uma programação cheia de saídas.', guess: true },
  { id: 'e2', category: 'estilo', weight: 1, text: 'Gosto de planejar tudo com antecedência, inclusive viagens.' },
  { id: 'e3', category: 'estilo', weight: 2, text: 'Preciso de momentos só meus, mesmo quando estou em um relacionamento.' },
  { id: 'e4', category: 'estilo', weight: 2, text: 'Acho importante dividir as tarefas da casa de forma igual.' },

  { id: 'i1', category: 'intimidade', weight: 3, text: 'Demonstrações físicas de carinho (abraço, beijo, mão dadas) são essenciais para mim.', guess: true },
  { id: 'i2', category: 'intimidade', weight: 2, text: 'Palavras de carinho e elogios me fazem sentir amado(a).' },
  { id: 'i3', category: 'intimidade', weight: 2, text: 'Gosto de surpresas e gestos românticos inesperados.' },
  { id: 'i4', category: 'intimidade', weight: 2, text: 'Tempo de qualidade, sem celular, é a melhor forma de demonstrar amor.' },

  { id: 'f1', category: 'financas', weight: 3, text: 'Acho que o casal deve ter contas e planejamento financeiro compartilhados.', guess: true },
  { id: 'f2', category: 'financas', weight: 2, text: 'Prefiro poupar a gastar com lazer e experiências.' },
  { id: 'f3', category: 'financas', weight: 2, text: 'Decisões de compra grandes devem ser sempre conversadas antes.' },
  { id: 'f4', category: 'financas', weight: 1, text: 'Dinheiro é um assunto que me deixa tranquilo(a) para conversar.' },

  { id: 'u1', category: 'futuro', weight: 3, text: 'Quero ter filhos (ou mais filhos) no futuro.', guess: true },
  { id: 'u2', category: 'futuro', weight: 3, text: 'Me vejo morando junto ou casado(a) com meu par nos próximos anos.' },
  { id: 'u3', category: 'futuro', weight: 2, text: 'Estaria disposto(a) a mudar de cidade por causa da carreira de um de nós.' },
  { id: 'u4', category: 'futuro', weight: 1, text: 'Tenho sonhos que quero realizar junto com meu par.' },

  { id: 's1', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Tenho vontade de conversar abertamente sobre quais tipos de sexo me dão prazer e quais não quero fazer.' },
  { id: 's2', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Eu toparia falar diretamente sobre sexo oral: o que gosto, o que não gosto e o que tenho curiosidade de experimentar.' },
  { id: 's3', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Tenho curiosidade sobre sexo anal, mas só consideraria com conversa prévia, consentimento e cuidados combinados.' },
  { id: 's4', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Tenho interesse em experimentar brinquedos sexuais junto com a outra pessoa.' },
  { id: 's5', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Tenho curiosidade sobre práticas de dominação e submissão, desde que os limites sejam combinados com clareza.' },
  { id: 's6', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Gosto da ideia de falar sobre fantasias sexuais, mesmo que a gente decida não colocá-las em prática.' },
  { id: 's7', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Para mim, é importante combinar antes se fotos, vídeos ou mensagens íntimas podem ser feitos ou compartilhados.' },
  { id: 's8', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Quero conversar antes sobre camisinha, contracepção e testes de ISTs, sem constrangimento.' },
  { id: 's9', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Eu me sentiria à vontade para dizer exatamente o que quero durante o sexo e pedir mudanças.' },
  { id: 's10', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Se eu ou a outra pessoa disser “não” ou “pare”, a atividade deve parar imediatamente, sem insistência.' },
  { id: 's11', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Tenho vontade de conversar sobre frequência sexual e o que cada um espera de um lance casual.' },
  { id: 's12', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Depois do sexo, gosto de carinho ou conversa; prefiro alinhar esse tipo de expectativa antes.' },
  { id: 's13', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Gosto de tomar a iniciativa e dizer quando estou com vontade de transar.' },
  { id: 's14', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Quero combinar quais práticas sexuais são um “sim”, quais talvez e quais são um “não” antes de transar.' },
  { id: 's15', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Se uma relação sexual causar dor ou desconforto, espero que a gente pare e converse na hora.' },
  { id: 's16', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Tenho interesse em usar lubrificante durante o sexo quando isso ajudar no conforto e no prazer.' },
  { id: 's17', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Prefiro usar camisinha em todas as relações com penetração, mesmo quando há outro método contraceptivo.' },
  { id: 's18', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Consigo conversar sem constrangimento sobre masturbação e sobre o que me dá prazer.' },
  { id: 's19', category: 'intimidade', mode: 'ficantes', weight: 3, text: 'Antes de transar, quero combinar o que faremos para evitar gravidez e reduzir o risco de ISTs.' },
  { id: 's20', category: 'intimidade', mode: 'ficantes', weight: 2, text: 'Quero poder mudar de ideia ou interromper qualquer prática sexual a qualquer momento, e espero o mesmo da outra pessoa.' },
]

export const questionById = new Map(questions.map((q) => [q.id, q]))
export const questionsForMode = (mode: QuestionMode) =>
  questions.filter((question) => (question.mode ?? 'casais') === mode)
export const SCALE_MAX = 5
export const SCALE_MIN = 1
