import { t } from '../content/texts'
import type { Answer, Category, DonationConfirmation, Question, QuestionMode, Report, SessionView } from './types'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown; partnerId?: string } = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.partnerId ? { 'x-partner-id': options.partnerId } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, (data as { message?: string }).message ?? t.common.error)
  return data as T
}

export const api = {
  questions: (mode: QuestionMode, code: string, partnerId: string, enabled: boolean) => {
    if (!enabled) return Promise.resolve({ categories: [], questions: [] })
    const query = new URLSearchParams({ mode })
    if (mode === 'ficantes') query.set('code', code)
    return request<{ categories: Category[]; questions: Question[] }>(`/questions?${query}`, { partnerId })
  },
  create: (name: string, mode: QuestionMode, adultConfirmed: boolean) =>
    request<{ code: string; partnerId: string }>('/sessions', {
      method: 'POST',
      body: { name, mode, adultConfirmed },
    }),
  join: (code: string, name: string) =>
    request<{ code: string; partnerId: string }>(`/sessions/${code}/join`, { method: 'POST', body: { name } }),
  session: (code: string, partnerId: string) => request<SessionView>(`/sessions/${code}`, { partnerId }),
  setSessionMode: (code: string, partnerId: string, mode: QuestionMode) =>
    request<{ mode: QuestionMode }>(`/sessions/${code}/mode`, { method: 'PUT', body: { mode }, partnerId }),
  confirmAdult: (code: string, partnerId: string, confirmed: boolean) =>
    request<{ confirmed: boolean }>(`/sessions/${code}/adult-confirmation`, { method: 'PUT', body: { confirmed }, partnerId }),
  answer: (code: string, partnerId: string, body: { questionId: string } & Answer) =>
    request<{ ok: true }>(`/sessions/${code}/answers`, { method: 'PUT', body, partnerId }),
  report: (code: string, partnerId: string) => request<Report>(`/sessions/${code}/report`, { partnerId }),
  confirmPremiumDonation: (code: string, partnerId: string) =>
    request<DonationConfirmation>(`/sessions/${code}/premium/confirm-donation`, { method: 'POST', partnerId }),
}
