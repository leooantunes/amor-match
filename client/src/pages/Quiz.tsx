import { useEffect, useRef, useState } from 'react'
import { Button, Card, ErrorMessage, ProgressBar } from '../components/ui'
import { ScaleInput } from '../components/ScaleInput'
import { t } from '../content/texts'
import { useQuestions, useSaveAnswer } from '../lib/queries'
import type { Question, SessionView } from '../lib/types'

const isComplete = (q: Question, a: SessionView['me']['answers'][string] | undefined) =>
  !!a && (!q.guess || a.guess !== undefined)

function Step({
  question,
  index,
  total,
  partnerName,
  initial,
  saving,
  error,
  onBack,
  onNext,
}: {
  question: Question
  index: number
  total: number
  partnerName: string
  initial?: { value: number; guess?: number }
  saving: boolean
  error?: string
  onBack?: () => void
  onNext: (value: number, guess?: number) => void
}) {
  const [value, setValue] = useState<number | undefined>(initial?.value)
  const [guess, setGuess] = useState<number | undefined>(initial?.guess)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus(), [])

  const ready = value !== undefined && (!question.guess || guess !== undefined)
  const last = index === total - 1

  return (
    <Card>
      <p className="text-sm font-semibold text-love-800" aria-live="polite">
        {t.quiz.progress(index + 1, total)}
      </p>
      <div className="mb-5 mt-2">
        <ProgressBar value={index + 1} max={total} label={t.quiz.progress(index + 1, total)} />
      </div>
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold leading-snug text-love-900 outline-none sm:text-3xl">
        {question.text}
      </h2>
      <ScaleInput name={`v-${question.id}`} legend={t.quiz.scaleLegend} value={value} onChange={setValue} />
      {question.guess && (
        <ScaleInput name={`g-${question.id}`} legend={t.quiz.guessLegend(partnerName)} hint={t.quiz.guessHint} value={guess} onChange={setGuess} />
      )}
      <ErrorMessage message={error} />
      <div className="mt-6 flex gap-3">
        {onBack && (
          <Button variant="secondary" type="button" onClick={onBack} disabled={saving}>
            {t.quiz.back}
          </Button>
        )}
        <Button className="flex-1" type="button" disabled={!ready || saving} onClick={() => ready && onNext(value, guess)}>
          {saving ? t.quiz.saving : last ? t.quiz.finish : t.quiz.next}
        </Button>
      </div>
    </Card>
  )
}

export function Quiz({ view, partnerId }: { view: SessionView; partnerId: string }) {
  const { data } = useQuestions()
  const save = useSaveAnswer(view.code, partnerId)
  const questions = data?.questions ?? []
  const [index, setIndex] = useState<number | null>(null)

  const start = Math.max(0, questions.findIndex((q) => !isComplete(q, view.me.answers[q.id])))
  const current = index ?? start
  const question = questions[current]
  if (!question) return null

  return (
    <Step
      key={question.id}
      question={question}
      index={current}
      total={questions.length}
      partnerName={view.partner?.name ?? ''}
      initial={view.me.answers[question.id]}
      saving={save.isPending}
      error={save.error?.message}
      onBack={current > 0 ? () => setIndex(current - 1) : undefined}
      onNext={(value, guess) =>
        save.mutate(
          { questionId: question.id, value, ...(question.guess ? { guess } : {}) },
          { onSuccess: () => setIndex(Math.min(current + 1, questions.length - 1)) },
        )
      }
    />
  )
}
