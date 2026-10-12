import { useEffect, useRef, useState } from 'react'
import { Button, Card, ErrorMessage, ProgressBar } from '../components/ui'
import { ScaleInput } from '../components/ScaleInput'
import { t } from '../content/texts'
import { useConfirmAdult, useQuestions, useSaveAnswer, useSetSessionMode } from '../lib/queries'
import type { Question, QuestionMode, SessionView } from '../lib/types'

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
  const canAccessQuestions =
    view.mode === 'casais' || (view.me.adultConfirmed && !!view.partner?.adultConfirmed)
  const { data } = useQuestions(view.mode, view.code, partnerId, canAccessQuestions)
  const save = useSaveAnswer(view.code, partnerId)
  const setMode = useSetSessionMode(view.code, partnerId)
  const confirmAdult = useConfirmAdult(view.code, partnerId)
  const questions = (data?.questions ?? []).filter((q) => (q.mode ?? 'casais') === view.mode)
  const [index, setIndex] = useState<number | null>(null)

  const modeLocked = view.me.answered > 0 || (view.partner?.answered ?? 0) > 0
  const start = Math.max(0, questions.findIndex((q) => !isComplete(q, view.me.answers[q.id])))
  const current = index ?? start
  const question = questions[current]
  const changeMode = (mode: QuestionMode) => {
    if (mode !== view.mode) setMode.mutate(mode)
  }

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-display text-xl font-bold text-love-900">{t.quiz.modeTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2" role="group" aria-label={t.quiz.modeTitle}>
          <Button
            type="button"
            variant={view.mode === 'casais' ? 'primary' : 'secondary'}
            aria-pressed={view.mode === 'casais'}
            disabled={modeLocked || setMode.isPending}
            onClick={() => changeMode('casais')}
          >
            {t.quiz.couplesMode}
          </Button>
          <Button
            type="button"
            variant={view.mode === 'ficantes' ? 'primary' : 'secondary'}
            aria-pressed={view.mode === 'ficantes'}
            disabled={modeLocked || setMode.isPending || !view.me.adultConfirmed || !view.partner?.adultConfirmed}
            onClick={() => changeMode('ficantes')}
          >
            {t.quiz.flingMode}
          </Button>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{t.quiz.modeAdultNote}</p>
        <label className="mt-3 flex min-h-12 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={view.me.adultConfirmed}
            disabled={confirmAdult.isPending || modeLocked}
            onChange={(event) => confirmAdult.mutate(event.target.checked)}
            className="h-5 w-5 accent-love-700"
          />
          {t.quiz.modeAdultLabel}
        </label>
        {view.me.adultConfirmed && !view.partner?.adultConfirmed && (
          <p className="mt-2 text-sm text-ink-soft" role="status">{t.quiz.waitingAdultConfirmation}</p>
        )}
        {view.mode === 'ficantes' && !view.me.adultConfirmed && (
          <p className="mt-2 text-sm text-ink-soft" role="status">{t.quiz.confirmAdultFirst}</p>
        )}
        {view.mode === 'ficantes' && <p className="mt-2 text-sm text-ink-soft">{t.quiz.adultNote}</p>}
        {modeLocked && <p className="mt-2 text-sm text-ink-soft">{t.quiz.modeLocked}</p>}
        <ErrorMessage message={setMode.error?.message ?? confirmAdult.error?.message} />
      </Card>
      {setMode.isPending && <p role="status" className="text-center text-sm text-ink-soft">{t.quiz.changingMode}</p>}
      {question && (view.mode !== 'ficantes' || (view.me.adultConfirmed && view.partner?.adultConfirmed)) && (
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
      )}
    </div>
  )
}
