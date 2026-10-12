export interface Category {
  id: string
  label: string
  description: string
}

export type QuestionMode = 'casais' | 'ficantes'

export interface Question {
  id: string
  category: string
  text: string
  weight: number
  mode?: QuestionMode
  guess?: boolean
}

export interface Answer {
  value: number
  guess?: number
}

export interface SessionView {
  code: string
  total: number
  mode: QuestionMode
  me: { name: string; answered: number; finished: boolean; answers: Record<string, Answer>; adultConfirmed: boolean }
  partner: { name: string; answered: number; finished: boolean; adultConfirmed: boolean } | null
  reportReady: boolean
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
  categories: { id: string; label: string; score: number; explanation: string }[]
  strengths: QuestionInsight[]
  attention: QuestionInsight[]
  premium: {
    status: 'not_started' | 'donation_confirmed'
    pixKey: string | null
    pixCopyPaste: string | null
    pixConfigured: boolean
    donationCents: number
    analysis?: PremiumAnalysis
  }
}

export interface DonationConfirmation {
  confirmed: boolean
}
