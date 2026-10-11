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
  const [shareStatus, setShareStatus] = useState('')
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
  const shareMessage = t.report.shareMessage(data.names, data.overall, `${window.location.origin}/s/${code}`)

  const shareOnInstagram = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: t.report.shareTitle, text: shareMessage })
        setShareStatus(t.report.shareSuccess)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setShareStatus(t.report.shareCancelled)
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareMessage)
      setShareStatus(t.report.shareCopied)
    } catch {
      setShareStatus(t.report.shareCopyError)
    }
  }

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
      <div className="report-actions flex flex-col items-center gap-4">
        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
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
        <div className="flex items-center justify-center gap-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.report.shareWhatsApp}
            title={t.report.shareWhatsApp}
            className="inline-flex size-12 items-center justify-center rounded-full border border-love-300 bg-love-100 text-love-700 shadow-sm transition-colors hover:bg-love-200 hover:text-love-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-love-700"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="currentColor">
              <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.55 0 .22 5.33.22 11.9c0 2.1.55 4.15 1.6 5.96L.12 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.88-5.34 11.88-11.9 0-3.18-1.24-6.17-3.47-8.42ZM12.1 21.78h-.01c-1.78 0-3.52-.48-5.03-1.39l-.36-.21-3.74.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.52-5.24c0-5.47 4.45-9.92 9.91-9.92 2.65 0 5.14 1.03 7.01 2.91a9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.92 9.92Zm5.44-7.43c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.28.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" />
            </svg>
          </a>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void shareOnInstagram()}
            aria-label={t.report.shareInstagram}
            title={t.report.shareInstagram}
            className="size-12 rounded-full border-love-300 bg-love-100 p-0 text-love-700 hover:bg-love-200 hover:text-love-800"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </Button>
        </div>
        <p className="text-center text-sm text-ink-soft" role="status" aria-live="polite">
          {shareStatus}
        </p>
      </div>
    </div>
  )
}
