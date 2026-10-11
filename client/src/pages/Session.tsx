import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, ErrorMessage, Field, Heart, Loading, ProgressBar } from '../components/ui'
import { t } from '../content/texts'
import { ApiError } from '../lib/api'
import { useJoinSession, useSession } from '../lib/queries'
import type { SessionView } from '../lib/types'
import { useIdentityStore } from '../store/identity'
import { Quiz } from './Quiz'
import { Report } from './Report'

function JoinForm({ code }: { code: string }) {
  const setIdentity = useIdentityStore((s) => s.setIdentity)
  const join = useJoinSession()
  const [name, setName] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    join.mutate({ code, name: name.trim() }, { onSuccess: (r) => setIdentity(code, { partnerId: r.partnerId, name: name.trim() }) })
  }
  return (
    <Card>
      <h1 className="font-display text-3xl font-bold text-love-900">{t.join.title}</h1>
      <p className="mb-4 text-ink-soft">{t.join.help}</p>
      <form onSubmit={submit} className="space-y-4">
        <Field id="join-name" label={t.home.nameLabel} placeholder={t.home.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required autoComplete="given-name" />
        <Button type="submit" className="w-full" disabled={join.isPending || !name.trim()}>
          {t.home.join}
        </Button>
        <ErrorMessage message={join.error?.message} />
      </form>
    </Card>
  )
}

function Lobby({ view }: { view: SessionView }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/s/${view.code}`
  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }
  const share = () => navigator.share?.({ title: t.appName, text: t.tagline, url: link }).catch(() => undefined)

  return (
    <Card className="text-center">
      <Heart className="mx-auto h-10 w-10 animate-beat text-love-600" />
      <h1 className="mt-2 font-display text-3xl font-bold text-love-900">{t.lobby.title}</h1>
      <p className="mx-auto mt-2 max-w-prose text-ink-soft">{t.lobby.help}</p>
      <p className="mt-5 text-sm font-semibold text-ink-soft">{t.lobby.code}</p>
      <p className="font-display text-5xl font-bold tracking-[0.3em] text-love-800" aria-label={view.code.split('').join(' ')}>
        {view.code}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="secondary" onClick={copy}>{t.lobby.copyLink}</Button>
        {typeof navigator.share === 'function' && <Button onClick={share}>{t.lobby.share}</Button>}
      </div>
      <p role="status" className="mt-2 h-6 text-sm font-medium text-success">{copied ? t.lobby.copied : ''}</p>
      <p role="status" className="mt-4 text-ink-soft">{t.lobby.waiting}</p>
    </Card>
  )
}

function Waiting({ view }: { view: SessionView }) {
  const p = view.partner!
  return (
    <Card className="text-center">
      <Heart className="mx-auto h-10 w-10 animate-beat text-love-600" />
      <h1 className="mt-2 font-display text-3xl font-bold text-love-900">{t.waiting.title}</h1>
      <p className="mt-2 text-ink-soft">{t.waiting.help(p.name)}</p>
      <div className="mx-auto mt-5 max-w-sm" role="status">
        <p className="mb-2 text-sm font-medium">{t.waiting.partnerProgress(p.name, p.answered, view.total)}</p>
        <ProgressBar value={p.answered} max={view.total} label={t.waiting.partnerProgress(p.name, p.answered, view.total)} />
      </div>
    </Card>
  )
}

export function SessionPage() {
  const code = (useParams().code ?? '').toUpperCase()
  const identity = useIdentityStore((s) => s.identities[code])
  const clearIdentity = useIdentityStore((s) => s.clearIdentity)
  const { data: view, error, isPending } = useSession(code, identity?.partnerId)

  if (!identity) return <JoinForm code={code} />
  if (error) {
    const gone = error instanceof ApiError && (error.status === 404 || error.status === 403)
    return (
      <Card>
        <ErrorMessage message={error.message} />
        <Link
          to="/"
          onClick={() => gone && clearIdentity(code)}
          className="mt-4 inline-flex min-h-12 items-center rounded-full bg-love-700 px-6 font-semibold text-white hover:bg-love-800"
        >
          {t.common.home}
        </Link>
      </Card>
    )
  }
  if (isPending || !view) return <Loading text={t.common.loading} />

  if (view.reportReady) return <Report code={code} partnerId={identity.partnerId} />
  if (!view.partner) return <Lobby view={view} />
  if (view.me.finished) return <Waiting view={view} />
  return <Quiz view={view} partnerId={identity.partnerId} />
}
