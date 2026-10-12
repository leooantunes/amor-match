import { categories, questionById, questionsForMode, SCALE_MAX, SCALE_MIN, type CategoryId, type QuestionMode } from './questions.js'
import type { Partner } from './store.js'

export interface CategoryResult {
  id: CategoryId
  label: string
  score: number
  explanation: string
}

export interface QuestionInsight {
  text: string
  answers: { name: string; value: number }[]
}

export interface PremiumAnalysis {
  conversationGuide: { category: string; prompt: string }[]
  dateIdeas: { title: string; description: string }[]
  connectionChallenge: string
}

export interface Report {
  names: [string, string]
  overall: number
  compatibility: number
  sintonia: number | null
  title: string
  summary: string
  sintoniaText: string | null
  categories: CategoryResult[]
  strengths: QuestionInsight[]
  attention: QuestionInsight[]
  premiumAnalysis?: PremiumAnalysis
}

const RANGE = SCALE_MAX - SCALE_MIN

const categoryTexts: Record<CategoryId, { high: string; mid: string; low: string }> = {
  comunicacao: {
    high: 'Vocês falam e escutam de um jeito parecido. Isso torna os conflitos mais leves e as conversas mais naturais.',
    mid: 'Há pontos de encontro na forma de se comunicar, mas também ritmos diferentes. Combinar como e quando conversar ajuda muito.',
    low: 'Vocês lidam com conversas e conflitos de formas bem diferentes. Pratiquem ouvir sem interromper e combinem regras para as discussões.',
  },
  valores: {
    high: 'Seus valores caminham juntos. Essa base em comum dá segurança para decisões importantes.',
    mid: 'Vocês compartilham parte dos valores, e as diferenças podem enriquecer o casal se houver respeito e curiosidade.',
    low: 'Há diferenças importantes no que cada um considera essencial. Conversem com abertura sobre o que é negociável e o que não é.',
  },
  estilo: {
    high: 'Rotina e lazer combinam bem: é fácil dividir o dia a dia e curtir o tempo juntos.',
    mid: 'Estilos de vida parecidos em alguns pontos e diferentes em outros. Revezar as escolhas de programa funciona bem.',
    low: 'Seus ritmos e preferências de convivência divergem bastante. Equilibrar tempo a dois e tempo individual será a chave.',
  },
  intimidade: {
    high: 'Vocês demonstram e recebem carinho de formas muito parecidas, o que faz cada um se sentir amado.',
    mid: 'As linguagens do amor de vocês se cruzam em parte. Perguntar "do que você precisa hoje?" faz diferença.',
    low: 'Cada um expressa afeto de um jeito diferente. Aprender a linguagem do amor do outro evita sensação de falta de carinho.',
  },
  financas: {
    high: 'Vocês enxergam o dinheiro de forma alinhada, o que reduz atritos e facilita planos em conjunto.',
    mid: 'Existem diferenças moderadas com o dinheiro. Definir metas e limites combinados evita surpresas.',
    low: 'Perfis financeiros bem diferentes podem gerar tensão. Vale criar acordos claros e uma rotina de conversar sobre o orçamento.',
  },
  futuro: {
    high: 'Vocês sonham na mesma direção, e isso é um ótimo indício de longevidade.',
    mid: 'Os planos têm pontos em comum e alguns ajustes pela frente. Revisitem as metas juntos com frequência.',
    low: 'Seus planos de futuro divergem em pontos centrais. Falem abertamente sobre expectativas antes de grandes passos.',
  },
}

const premiumGuidance: Record<CategoryId, { prompt: string; date: { title: string; description: string } }> = {
  comunicacao: {
    prompt: 'O que ajuda cada um a se sentir ouvido quando um assunto fica difícil?',
    date: { title: 'Caminhada sem distrações', description: 'Façam uma caminhada tranquila e reservem um tempo para cada pessoa falar sem interrupções.' },
  },
  valores: {
    prompt: 'Quais valores vocês querem que estejam presentes nas decisões do casal?',
    date: { title: 'Histórias que formaram vocês', description: 'Escolham fotos ou músicas importantes e contem as histórias e valores que elas representam.' },
  },
  estilo: {
    prompt: 'Como vocês podem equilibrar momentos juntos, rotina e tempo individual?',
    date: { title: 'Um programa escolhido a dois', description: 'Cada pessoa escolhe uma parte do encontro: uma atividade e uma pausa para descansar juntos.' },
  },
  intimidade: {
    prompt: 'Que gesto simples faz cada um se sentir amado e acolhido no dia a dia?',
    date: { title: 'Encontro de carinho', description: 'Preparem uma noite sem telas com uma refeição simples, música favorita e elogios sinceros.' },
  },
  financas: {
    prompt: 'Que plano ou experiência vale a pena priorizar juntos, respeitando os limites de cada um?',
    date: { title: 'Planos sem pressão', description: 'Imaginem um passeio para o futuro e montem juntos uma versão que caiba no orçamento atual.' },
  },
  futuro: {
    prompt: 'Qual sonho individual vocês gostariam de apoiar um no outro nos próximos meses?',
    date: { title: 'Mapa de sonhos', description: 'Tomem algo gostoso e criem uma lista de planos a dois e individuais para o próximo ano.' },
  },
}

const verdicts = [
  { min: 85, title: 'Almas gêmeas', summary: 'Vocês têm uma sintonia rara. Suas respostas mostram visões muito próximas sobre o que importa em um relacionamento.' },
  { min: 70, title: 'Casal muito compatível', summary: 'Há muito em comum entre vocês. As diferenças que existem são pequenas e podem ser resolvidas com diálogo.' },
  { min: 55, title: 'Boa base, com pontos a alinhar', summary: 'Vocês combinam em várias áreas e divergem em outras. Com conversa e empatia, essas diferenças viram aprendizado.' },
  { min: 40, title: 'Opostos em construção', summary: 'Existem diferenças relevantes entre vocês. Isso não impede o amor, mas pede paciência, acordos claros e muita conversa.' },
  { min: 0, title: 'Um desafio a dois', summary: 'Suas respostas mostram visões bem diferentes. Compatibilidade não é destino: usem este resultado como ponto de partida para se conhecerem melhor.' },
]

const pct = (n: number) => Math.round(n * 100)

function band(score: number): 'high' | 'mid' | 'low' {
  return score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low'
}

export function buildReport(a: Partner, b: Partner, mode: QuestionMode = 'casais'): Report {
  const activeQuestions = questionsForMode(mode)
  let weightSum = 0
  let scoreSum = 0
  const perCategory = new Map<CategoryId, { w: number; s: number }>()
  const diffs: { id: string; diff: number; weight: number }[] = []

  for (const q of activeQuestions) {
    const aa = a.answers[q.id]
    const bb = b.answers[q.id]
    if (!aa || !bb) continue
    const diff = Math.abs(aa.value - bb.value)
    const similarity = 1 - diff / RANGE
    weightSum += q.weight
    scoreSum += similarity * q.weight
    const cat = perCategory.get(q.category) ?? { w: 0, s: 0 }
    cat.w += q.weight
    cat.s += similarity * q.weight
    perCategory.set(q.category, cat)
    diffs.push({ id: q.id, diff, weight: q.weight })
  }

  const compatibility = weightSum ? pct(scoreSum / weightSum) : 0

  // Sintonia: quão bem cada um previu a resposta do outro.
  const guessAccuracies: number[] = []
  for (const q of activeQuestions) {
    if (!q.guess) continue
    const ga = a.answers[q.id]?.guess
    const gb = b.answers[q.id]?.guess
    if (ga !== undefined && b.answers[q.id]) guessAccuracies.push(1 - Math.abs(ga - b.answers[q.id].value) / RANGE)
    if (gb !== undefined && a.answers[q.id]) guessAccuracies.push(1 - Math.abs(gb - a.answers[q.id].value) / RANGE)
  }
  const sintonia = guessAccuracies.length
    ? pct(guessAccuracies.reduce((x, y) => x + y, 0) / guessAccuracies.length)
    : null

  const overall = sintonia === null ? compatibility : Math.round(compatibility * 0.85 + sintonia * 0.15)
  const verdict = verdicts.find((v) => overall >= v.min)!

  const categoryResults: CategoryResult[] = categories
    .filter((c) => perCategory.has(c.id))
    .map((c) => {
      const { w, s } = perCategory.get(c.id)!
      const score = pct(s / w)
      return { id: c.id, label: c.label, score, explanation: categoryTexts[c.id][band(score)] }
    })

  const insight = (id: string): QuestionInsight => ({
    text: questionById.get(id)!.text,
    answers: [
      { name: a.name, value: a.answers[id].value },
      { name: b.name, value: b.answers[id].value },
    ],
  })

  const strengths = diffs
    .filter((d) => d.diff === 0)
    .sort((x, y) => y.weight - x.weight)
    .slice(0, 3)
    .map((d) => insight(d.id))
  const attention = diffs
    .filter((d) => d.diff >= 2)
    .sort((x, y) => y.diff * y.weight - x.diff * x.weight)
    .slice(0, 3)
    .map((d) => insight(d.id))

  const sintoniaText =
    sintonia === null
      ? null
      : sintonia >= 75
        ? `Vocês se conhecem muito bem: ${sintonia}% de acerto ao prever as respostas um do outro.`
        : sintonia >= 50
          ? `Vocês se conhecem razoavelmente (${sintonia}% de acerto). Ainda há espaço para descobrir coisas novas um sobre o outro.`
          : `Vocês acertaram pouco ao prever o outro (${sintonia}%). Que tal conversar mais sobre gostos e expectativas?`

  return {
    names: [a.name, b.name],
    overall,
    compatibility,
    sintonia,
    title: verdict.title,
    summary: verdict.summary,
    sintoniaText,
    categories: categoryResults,
    strengths,
    attention,
  }
}

export function buildPremiumAnalysis(report: Report): PremiumAnalysis {
  const areasToExplore = [...report.categories].sort((a, b) => a.score - b.score).slice(0, 3)
  const conversationGuide = areasToExplore.map((category) => ({
    category: category.label,
    prompt: premiumGuidance[category.id].prompt,
  }))
  const dateIdeas = areasToExplore.map((category) => premiumGuidance[category.id].date)

  return {
    conversationGuide,
    dateIdeas,
    connectionChallenge:
      'Durante sete dias, reservem dez minutos sem telas para compartilhar algo bom do dia e uma coisa que gostariam de viver juntos.',
  }
}
