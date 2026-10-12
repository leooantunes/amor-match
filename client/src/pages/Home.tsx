import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, ErrorMessage, Field, Heart } from '../components/ui'
import { t } from '../content/texts'
import { useCreateSession, useJoinSession } from '../lib/queries'
import type { QuestionMode } from '../lib/types'
import { useIdentityStore } from '../store/identity'

export function HomePage() {
  const navigate = useNavigate()
  const setIdentity = useIdentityStore((s) => s.setIdentity)
  const create = useCreateSession()
  const join = useJoinSession()
  const [createName, setCreateName] = useState('')
  const [questionMode, setQuestionMode] = useState<QuestionMode>('casais')
  const [adultConfirmed, setAdultConfirmed] = useState(false)
  const [joinName, setJoinName] = useState('')
  const [code, setCode] = useState('')

  const onCreate = (e: FormEvent) => {
    e.preventDefault()
    create.mutate({ name: createName.trim(), mode: questionMode, adultConfirmed }, {
      onSuccess: (r) => {
        setIdentity(r.code, { partnerId: r.partnerId, name: createName.trim() })
        navigate(`/s/${r.code}`)
      },
    })
  }

  const onJoin = (e: FormEvent) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    join.mutate(
      { code: c, name: joinName.trim() },
      {
        onSuccess: (r) => {
          setIdentity(r.code, { partnerId: r.partnerId, name: joinName.trim() })
          navigate(`/s/${r.code}`)
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="py-4 text-center">
        <Heart className="mx-auto mb-3 h-14 w-14 animate-beat text-love-600" />
        <h1 className="font-display text-4xl font-bold text-love-900 sm:text-5xl">{t.home.title}</h1>
        <p className="mx-auto mt-3 max-w-prose text-lg text-ink-soft">{t.home.subtitle}</p>
        <ol className="mt-5 flex flex-wrap justify-center gap-2 text-sm font-medium text-love-900">
          {t.home.steps.map((s, i) => (
            <li key={s} className="rounded-full bg-love-100 px-4 py-1">
              {i + 1}. {s}
            </li>
          ))}
        </ol>
      </div>

      <Card>
        <h2 className="font-display text-2xl font-bold text-love-900">{t.home.createTitle}</h2>
        <p className="mb-4 text-ink-soft">{t.home.createHelp}</p>
        <form onSubmit={onCreate} className="space-y-4">
          <Field id="create-name" label={t.home.nameLabel} placeholder={t.home.namePlaceholder} value={createName} onChange={(e) => setCreateName(e.target.value)} maxLength={30} required autoComplete="given-name" />
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-semibold text-ink-soft">{t.home.questionModeLabel}</legend>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 border-love-300 bg-white px-4 py-3 font-medium text-ink has-[:checked]:border-love-700 has-[:checked]:bg-love-50">
              <input
                type="radio"
                name="question-mode"
                value="casais"
                checked={questionMode === 'casais'}
                onChange={() => setQuestionMode('casais')}
                className="h-5 w-5 accent-love-700"
              />
              {t.home.couplesQuestions}
            </label>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 border-love-300 bg-white px-4 py-3 font-medium text-ink has-[:checked]:border-love-700 has-[:checked]:bg-love-50">
              <input
                type="radio"
                name="question-mode"
                value="ficantes"
                checked={questionMode === 'ficantes'}
                onChange={() => setQuestionMode('ficantes')}
                className="h-5 w-5 accent-love-700"
              />
              {t.home.adultQuestions}
            </label>
          </fieldset>
          {questionMode === 'ficantes' && (
            <>
              <p className="text-sm text-ink-soft">{t.home.adultQuestionsHelp}</p>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={adultConfirmed}
                  onChange={(e) => setAdultConfirmed(e.target.checked)}
                  className="h-5 w-5 accent-love-700"
                />
                {t.home.adultConfirmation}
              </label>
            </>
          )}
          <Button type="submit" className="w-full" disabled={create.isPending || !createName.trim() || (questionMode === 'ficantes' && !adultConfirmed)}>
            {create.isPending ? t.common.loading : t.home.create}
          </Button>
          <ErrorMessage message={create.error?.message} />
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-2xl font-bold text-love-900">{t.home.joinTitle}</h2>
        <p className="mb-4 text-ink-soft">{t.home.joinHelp}</p>
        <form onSubmit={onJoin} className="space-y-4">
          <Field id="join-code" label={t.home.codeLabel} value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required autoCapitalize="characters" autoComplete="off" className="min-h-12 w-full rounded-2xl border-2 border-love-300 bg-white px-4 text-base uppercase tracking-widest" />
          <Field id="join-name" label={t.home.nameLabel} placeholder={t.home.namePlaceholder} value={joinName} onChange={(e) => setJoinName(e.target.value)} maxLength={30} required autoComplete="given-name" />
          <Button type="submit" variant="secondary" className="w-full" disabled={join.isPending || code.trim().length < 6 || !joinName.trim()}>
            {join.isPending ? t.common.loading : t.home.join}
          </Button>
          <ErrorMessage message={join.error?.message} />
        </form>
      </Card>
    </div>
  )
}
