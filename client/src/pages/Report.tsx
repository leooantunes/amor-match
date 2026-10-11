import { Link } from 'react-router-dom'
import { Button, Card, ErrorMessage, Heart, Loading } from '../components/ui'
import { t } from '../content/texts'
import { useReport } from '../lib/queries'
import type { QuestionInsight } from '../lib/types'

function Ring({ value, label }: { value: number; label: string }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <div className="relative mx-auto h-44 w-44" role="img" aria-label={`${label}: ${value}%`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-love-100" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-love-700 transition-all" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <Heart className="h-5 w-5 text-love-600" />
        <span className="font-display text-4xl font-bold text-love-900">{value}%</span>
      </div>
    </div>
  )
}

function Insights({ title, empty, items }: { title: string; empty: string; items: QuestionInsight[] }) {
  return (
    <Card>
      <h2 className="font-display text-2xl font-bold text-love-900">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-ink-soft">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {items.map((i) => (
            <li key={i.text} className="rounded-2xl bg-love-50 p-4">
              <p className="font-medium">{i.text}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {i.answers.map((a) => `${a.name}: ${t.quiz.scale[a.value - 1]}`).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function Report({ code, partnerId }: { code: string; partnerId: string }) {
  const { data, isPending, error, refetch } = useReport(code, partnerId, true)
  if (isPending) return <Loading text={t.common.loading} />
  if (error || !data) {
    return (
      <Card>
        <ErrorMessage message={error?.message ?? t.common.error} />
        <Button className="mt-4" onClick={() => refetch()}>{t.common.retry}</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-love-800">{t.report.title}</p>
        <p className="mt-1 font-display text-xl text-ink-soft">
          {data.names[0]} &amp; {data.names[1]}
        </p>
        <div className="my-4"><Ring value={data.overall} label={t.report.overall} /></div>
        <h1 className="font-display text-3xl font-bold text-love-900">{data.title}</h1>
        <p className="mx-auto mt-2 max-w-prose text-ink-soft">{data.summary}</p>
        {data.sintonia !== null && (
          <div className="mt-5 rounded-2xl bg-love-50 p-4 text-left">
            <p className="font-semibold text-love-900">{t.report.sintoniaTitle}: {data.sintonia}%</p>
            <p className="mt-1 text-sm text-ink-soft">{data.sintoniaText}</p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-2xl font-bold text-love-900">{t.report.categories}</h2>
        <ul className="mt-4 space-y-5">
          {data.categories.map((c) => (
            <li key={c.id}>
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">{c.label}</span>
                <span className="font-bold text-love-800">{c.score}%</span>
              </div>
              <div role="meter" aria-label={c.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.score} className="my-1 h-3 overflow-hidden rounded-full bg-love-100">
                <div className="h-full rounded-full bg-love-700" style={{ width: `${c.score}%` }} />
              </div>
              <p className="text-sm text-ink-soft">{c.explanation}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Insights title={t.report.strengths} empty={t.report.strengthsEmpty} items={data.strengths} />
      <Insights title={t.report.attention} empty={t.report.attentionEmpty} items={data.attention} />

      <p className="text-center text-sm text-ink-soft">{t.report.disclaimer}</p>
      <div className="text-center">
        <Link to="/" className="inline-flex min-h-12 items-center rounded-full bg-love-700 px-6 font-semibold text-white hover:bg-love-800">
          {t.report.newTest}
        </Link>
      </div>
    </div>
  )
}
