import { Link } from 'react-router-dom'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button, Card, ErrorMessage, Heart, Loading } from '../components/ui'
import { t } from '../content/texts'
import { useConfirmPremiumDonation, useReport } from '../lib/queries'
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
              <ul className="mt-3 space-y-2">
                {i.answers.map((a) => (
                  <li key={a.name} className="rounded-xl bg-love-100 px-3 py-2">
                    <p className="font-semibold text-love-900">{a.name}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{t.quiz.scale[a.value - 1]}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function Report({ code, partnerId }: { code: string; partnerId: string }) {
  const { data, isPending, error, refetch } = useReport(code, partnerId, true)
  const [pixCopied, setPixCopied] = useState(false)
  const [pixCopyError, setPixCopyError] = useState(false)
  const confirmDonation = useConfirmPremiumDonation(code, partnerId)
  if (isPending) return <Loading text={t.common.loading} />
  if (error || !data) {
    return (
      <Card>
        <ErrorMessage message={error?.message ?? t.common.error} />
        <Button className="mt-4" onClick={() => refetch()}>{t.common.retry}</Button>
      </Card>
    )
  }

  const premiumPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    data.premium.donationCents / 100,
  )

  return (
    <div className="report-content space-y-6">
      <Card className="report-cover overflow-hidden text-center">
        <div className="mx-auto mb-3 flex w-fit items-center gap-3 rounded-full border border-love-300 bg-love-50 px-4 py-2 text-love-700">
          <Heart className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wide">{t.report.title}</p>
          <Heart className="h-5 w-5" />
        </div>
        <div className="mx-auto flex max-w-lg items-center justify-center gap-3 sm:gap-5">
          <Heart className="h-6 w-6 shrink-0 text-love-500 sm:h-8 sm:w-8" />
          <h1 className="font-display text-3xl font-bold leading-tight text-love-900 sm:text-4xl">
            {data.names[0]} <span className="text-love-600">&amp;</span> {data.names[1]}
          </h1>
          <Heart className="h-6 w-6 shrink-0 text-love-500 sm:h-8 sm:w-8" />
        </div>
        <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-love-100 px-4 py-1.5 font-semibold text-love-900">
          <span aria-hidden="true">✧</span>
          <span>{data.title}</span>
          <span aria-hidden="true">✧</span>
        </div>
        <div className="my-4"><Ring value={data.overall} label={t.report.overall} /></div>
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

      {data.premium.analysis ? (
        <>
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-bold text-love-900">{t.report.premium.conversationGuide}</h2>
              <span className="rounded-full bg-love-100 px-3 py-1 text-sm font-semibold text-love-900">
                {t.report.premium.confirmed}
              </span>
            </div>
            <ul className="space-y-3">
              {data.premium.analysis.conversationGuide.map((item) => (
                <li key={item.category} className="rounded-2xl bg-love-50 p-4">
                  <p className="text-sm font-semibold text-love-800">{item.category}</p>
                  <p className="mt-1 font-medium">{item.prompt}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="font-display text-2xl font-bold text-love-900">{t.report.premium.dateIdeas}</h2>
            <ul className="mt-3 space-y-3">
              {data.premium.analysis.dateIdeas.map((idea) => (
                <li key={idea.title} className="rounded-2xl bg-love-50 p-4">
                  <p className="font-semibold text-love-900">{idea.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{idea.description}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="text-center">
            <Heart className="mx-auto h-7 w-7 text-love-600" />
            <h2 className="mt-2 font-display text-2xl font-bold text-love-900">{t.report.premium.connectionChallenge}</h2>
            <p className="mx-auto mt-2 max-w-prose text-ink-soft">{data.premium.analysis.connectionChallenge}</p>
          </Card>
        </>
      ) : (
        <Card className="border-2 border-love-300 bg-love-50/80">
          <div className="text-center">
            <div className="mx-auto flex w-fit items-center gap-2 text-love-600">
              <Heart className="h-5 w-5" />
              <p className="text-sm font-bold uppercase tracking-wide">LoveMatch Premium</p>
              <Heart className="h-5 w-5" />
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-love-900">{t.report.premium.title}</h2>
            <p className="mx-auto mt-2 max-w-prose text-ink-soft">{t.report.premium.subtitle}</p>
            <p className="mt-3 font-semibold text-love-800">{t.report.premium.donation(premiumPrice)}</p>
          </div>
          <div className="mt-6">
            <h3 className="text-center text-sm font-bold uppercase tracking-wide text-love-800">
              {t.report.premium.benefitsTitle}
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {t.report.premium.benefits.map((benefit) => (
                <li key={benefit.title} className="flex gap-3 rounded-2xl border border-love-200 bg-white/70 p-4">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-love-100 font-display text-xl font-bold text-love-700"
                  >
                    {benefit.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-love-900">{benefit.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {confirmDonation.error && <ErrorMessage message={confirmDonation.error.message} />}
          <div className="mt-5 flex flex-col items-center gap-3 text-center">
            {data.premium.pixConfigured && data.premium.pixCopyPaste && data.premium.pixKey ? (
              <>
                <p className="max-w-lg text-sm font-medium text-love-800">
                  {t.report.premium.pixInstructions(premiumPrice)}
                </p>
                <div className="rounded-2xl border border-love-200 bg-white p-4">
                  <QRCodeSVG
                    value={data.premium.pixCopyPaste}
                    size={208}
                    level="M"
                    title={t.report.premium.pixKeyLabel}
                    className="mx-auto"
                  />
                </div>
                <p className="font-semibold text-love-900">{t.report.premium.pixKeyLabel}: {data.premium.pixKey}</p>
                <label htmlFor="premium-pix-copy-paste" className="w-full max-w-lg text-left text-sm font-semibold text-love-900">
                  {t.report.premium.pixCopyPasteLabel}
                </label>
                <textarea
                  id="premium-pix-copy-paste"
                  readOnly
                  rows={4}
                  value={data.premium.pixCopyPaste}
                  className="w-full max-w-lg resize-y rounded-xl border border-love-300 bg-white p-3 text-xs text-ink"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(data.premium.pixCopyPaste!)
                      setPixCopied(true)
                      setPixCopyError(false)
                    } catch {
                      setPixCopied(false)
                      setPixCopyError(true)
                    }
                  }}
                >
                  {pixCopied ? t.report.premium.pixCopied : t.report.premium.copyPix}
                </Button>
                {pixCopyError && <p role="alert" className="text-sm text-danger">{t.report.premium.pixCopyError}</p>}
                <p className="max-w-lg text-sm text-ink-soft">{t.report.premium.confirmDisclosure}</p>
                <Button
                  type="button"
                  disabled={confirmDonation.isPending}
                  onClick={() => confirmDonation.mutate()}
                >
                  {confirmDonation.isPending ? t.report.premium.confirming : t.report.premium.confirm}
                </Button>
              </>
            ) : (
              <p className="text-sm font-medium text-ink-soft">{t.report.premium.setupRequired}</p>
            )}
          </div>
        </Card>
      )}

      <p className="text-center text-sm text-ink-soft">{t.report.disclaimer}</p>
      <div className="report-actions flex flex-col justify-center gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v8H6z" />
          </svg>
          {t.report.downloadPdf}
        </Button>
        <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full bg-love-700 px-6 font-semibold text-white hover:bg-love-800">
          {t.report.newTest}
        </Link>
      </div>
    </div>
  )
}
