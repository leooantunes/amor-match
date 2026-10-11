import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Answer } from '../lib/types'

export const useQuestions = () =>
  useQuery({ queryKey: ['questions'], queryFn: api.questions, staleTime: Infinity })

export const useSession = (code: string, partnerId: string | undefined) =>
  useQuery({
    queryKey: ['session', code],
    queryFn: () => api.session(code, partnerId!),
    enabled: !!partnerId,
    retry: false,
    // Atualiza sozinho enquanto alguém ainda não terminou.
    refetchInterval: (q) => {
      const s = q.state.data
      return s && s.reportReady ? false : 3000
    },
  })

export const useReport = (code: string, partnerId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: ['report', code],
    queryFn: () => api.report(code, partnerId!),
    enabled: enabled && !!partnerId,
    refetchInterval: (q) => (q.state.data?.premium.status === 'donation_confirmed' ? false : 10_000),
  })

export const useCreateSession = () => useMutation({ mutationFn: api.create })

export const useJoinSession = () =>
  useMutation({ mutationFn: ({ code, name }: { code: string; name: string }) => api.join(code, name) })

export const useConfirmPremiumDonation = (code: string, partnerId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.confirmPremiumDonation(code, partnerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['report', code] }),
  })
}

export const useSaveAnswer = (code: string, partnerId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { questionId: string } & Answer) => api.answer(code, partnerId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session', code] }),
  })
}
