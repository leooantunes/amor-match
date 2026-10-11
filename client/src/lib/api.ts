import { t } from '../content/texts'
import type { Answer, Category, DonationConfirmation, Question, Report, SessionView } from './types'

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
  questions: () => request<{ categories: Category[]; questions: Question[] }>('/questions'),
  create: (name: string) => request<{ code: string; partnerId: string }>('/sessions', { method: 'POST', body: { name } }),
  join: (code: string, name: string) =>
    request<{ code: string; partnerId: string }>(`/sessions/${code}/join`, { method: 'POST', body: { name } }),
  session: (code: string, partnerId: string) => request<SessionView>(`/sessions/${code}`, { partnerId }),
  answer: (code: string, partnerId: string, body: { questionId: string } & Answer) =>
    request<{ ok: true }>(`/sessions/${code}/answers`, { method: 'PUT', body, partnerId }),
  report: (code: string, partnerId: string) => request<Report>(`/sessions/${code}/report`, { partnerId }),
  confirmPremiumDonation: (code: string, partnerId: string) =>
    request<DonationConfirmation>(`/sessions/${code}/premium/confirm-donation`, { method: 'POST', partnerId }),
}
