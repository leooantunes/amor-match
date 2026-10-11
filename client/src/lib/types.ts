export interface Category {
  id: string
  label: string
  description: string
}

export interface Question {
  id: string
  category: string
  text: string
  weight: number
  guess?: boolean
}

export interface Answer {
  value: number
  guess?: number
}

export interface SessionView {
  code: string
  total: number
  me: { name: string; answered: number; finished: boolean; answers: Record<string, Answer> }
  partner: { name: string; answered: number; finished: boolean } | null
  reportReady: boolean
}

export interface QuestionInsight {
  text: string
  answers: { name: string; value: number }[]
}

export interface Report {
  names: [string, string]
  overall: number
  compatibility: number
  sintonia: number | null
  title: string
  summary: string
  sintoniaText: string | null
  categories: { id: string; label: string; score: number; explanation: string }[]
  strengths: QuestionInsight[]
  attention: QuestionInsight[]
}
