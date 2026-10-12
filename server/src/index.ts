import 'dotenv/config'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { z } from 'zod'
import { categories, questionById, questionsForMode, type QuestionMode } from './questions.js'
import { buildPremiumAnalysis, buildReport } from './report.js'
import { getPixDonationDetails, PREMIUM_DONATION_CENTS } from './pix.js'
import {
  addPartner,
  checkStore,
  createSession,
  getSession,
  initStore,
  persist,
  type Partner,
  type Session,
} from './store.js'

const app = express()
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist')
app.use(cors())
app.use(express.json({ limit: '10kb' }))

const nameSchema = z.object({ name: z.string().trim().min(1).max(30) })
const createSessionSchema = nameSchema.extend({
  mode: z.enum(['casais', 'ficantes']).default('casais'),
  adultConfirmed: z.boolean().optional().default(false),
})
const modeSchema = z.object({ mode: z.enum(['casais', 'ficantes']) })
const adultConfirmationSchema = z.object({ confirmed: z.boolean() })
const answerSchema = z.object({
  questionId: z.string(),
  value: z.number().int().min(1).max(5),
  guess: z.number().int().min(1).max(5).optional(),
})

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

function sessionMode(session: Session): QuestionMode {
  return session.mode ?? 'casais'
}

function isFinished(session: Session, p: Partner): boolean {
  return questionsForMode(sessionMode(session)).every((q) => {
    const a = p.answers[q.id]
    return a && (!q.guess || a.guess !== undefined)
  })
}

async function sessionFrom(req: Request): Promise<Session> {
  const session = await getSession(String(req.params.code))
  if (!session) throw new HttpError(404, 'Sala não encontrada. Confira o código.')
  return session
}

function partnerFrom(req: Request, session: Session): Partner {
  const id = req.header('x-partner-id')
  const partner = session.partners.find((p) => p.id === id)
  if (!partner) throw new HttpError(403, 'Você não faz parte desta sala.')
  return partner
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res).catch(next)
  }
}

app.get('/api/questions', asyncRoute(async (req, res) => {
  const { mode, code } = z.object({
    mode: z.enum(['casais', 'ficantes']).default('casais'),
    code: z.string().optional(),
  }).parse(req.query)

  if (mode === 'ficantes') {
    if (!code) throw new HttpError(400, 'Informe a sala para acessar as perguntas +18.')
    const session = await getSession(code)
    if (!session) throw new HttpError(404, 'Sala não encontrada. Confira o código.')
    partnerFrom(req, session)
    if (
      sessionMode(session) !== 'ficantes' ||
      session.partners.length !== 2 ||
      !session.partners.every((partner) => partner.adultConfirmed)
    ) {
      throw new HttpError(403, 'As duas pessoas precisam confirmar que têm 18 anos ou mais para acessar estas perguntas.')
    }
  }

  res.json({ categories, questions: questionsForMode(mode) })
}))

app.get('/api/health', asyncRoute(async (_req, res) => {
  await checkStore()
  return res.json({ status: 'ok' })
}))

app.post('/api/sessions', asyncRoute(async (req, res) => {
  const { name, mode, adultConfirmed } = createSessionSchema.parse(req.body)
  if (mode === 'ficantes' && !adultConfirmed) {
    throw new HttpError(403, 'Confirme que tem 18 anos ou mais para criar uma sala com perguntas +18.')
  }
  const { session, partner } = createSession(name)
  session.mode = mode
  partner.adultConfirmed = adultConfirmed
  await persist(session)
  res.status(201).json({ code: session.code, partnerId: partner.id })
}))

app.post('/api/sessions/:code/join', asyncRoute(async (req, res) => {
  const { name } = nameSchema.parse(req.body)
  const session = await sessionFrom(req)
  if (session.partners.length >= 2) throw new HttpError(409, 'Esta sala já tem duas pessoas.')
  const partner = addPartner(session, name)
  await persist(session)
  res.status(201).json({ code: session.code, partnerId: partner.id })
}))

app.get('/api/sessions/:code', asyncRoute(async (req, res) => {
  const session = await sessionFrom(req)
  const me = partnerFrom(req, session)
  const other = session.partners.find((p) => p.id !== me.id)
  res.json({
    code: session.code,
    total: questionsForMode(sessionMode(session)).length,
    mode: sessionMode(session),
    me: {
      name: me.name,
      answered: Object.keys(me.answers).length,
      finished: isFinished(session, me),
      answers: me.answers,
      adultConfirmed: me.adultConfirmed ?? false,
    },
    partner: other
      ? {
          name: other.name,
          answered: Object.keys(other.answers).length,
          finished: isFinished(session, other),
          adultConfirmed: other.adultConfirmed ?? false,
        }
      : null,
    reportReady: session.partners.length === 2 && session.partners.every((partner) => isFinished(session, partner)),
  })
}))

app.put('/api/sessions/:code/mode', asyncRoute(async (req, res) => {
  const session = await sessionFrom(req)
  partnerFrom(req, session)
  const { mode } = modeSchema.parse(req.body)
  if (session.partners.length !== 2) {
    throw new HttpError(409, 'As duas pessoas precisam entrar na sala antes de escolher o modo.')
  }
  if (mode === 'ficantes' && !session.partners.every((partner) => partner.adultConfirmed)) {
    throw new HttpError(403, 'As duas pessoas precisam confirmar que têm 18 anos ou mais.')
  }
  if (session.partners.some((partner) => Object.keys(partner.answers).length > 0)) {
    throw new HttpError(409, 'O modo não pode ser alterado depois que alguém responder.')
  }
  session.mode = mode
  await persist(session)
  res.json({ mode })
}))

app.put('/api/sessions/:code/adult-confirmation', asyncRoute(async (req, res) => {
  const session = await sessionFrom(req)
  const me = partnerFrom(req, session)
  const { confirmed } = adultConfirmationSchema.parse(req.body)
  if (session.partners.some((partner) => Object.keys(partner.answers).length > 0)) {
    throw new HttpError(409, 'A confirmação de idade não pode ser alterada depois que alguém responder.')
  }
  if (!confirmed && session.mode === 'ficantes') {
    throw new HttpError(409, 'Volte para o modo de casais antes de remover a confirmação.')
  }
  me.adultConfirmed = confirmed
  await persist(session)
  res.json({ confirmed })
}))

app.put('/api/sessions/:code/answers', asyncRoute(async (req, res) => {
  const session = await sessionFrom(req)
  const me = partnerFrom(req, session)
  const body = answerSchema.parse(req.body)
  const question = questionById.get(body.questionId)
  if (!question || !questionsForMode(sessionMode(session)).includes(question)) {
    throw new HttpError(400, 'Pergunta inválida para o modo selecionado.')
  }
  if (
    sessionMode(session) === 'ficantes' &&
    (session.partners.length !== 2 || !session.partners.every((partner) => partner.adultConfirmed))
  ) {
    throw new HttpError(403, 'As duas pessoas precisam confirmar que têm 18 anos ou mais antes de responder.')
  }
  if (question.guess && body.guess === undefined) throw new HttpError(400, 'Informe também o palpite.')
  me.answers[question.id] = question.guess ? { value: body.value, guess: body.guess } : { value: body.value }
  await persist(session)
  res.json({ ok: true })
}))

app.get('/api/sessions/:code/report', asyncRoute(async (req, res) => {
  const session = await sessionFrom(req)
  partnerFrom(req, session)
  if (session.partners.length < 2 || !session.partners.every((partner) => isFinished(session, partner))) {
    throw new HttpError(409, 'O relatório fica pronto quando os dois terminarem.')
  }
  const report = buildReport(session.partners[0], session.partners[1], sessionMode(session))
  const premiumUnlocked =
    session.premiumDonation?.status === 'confirmed' || session.premiumPayment?.status === 'paid'
  const pixDonation = getPixDonationDetails()
  res.json({
    ...report,
    premium: {
      status: premiumUnlocked ? 'donation_confirmed' : 'not_started',
      pixConfigured: !!pixDonation,
      pixKey: pixDonation?.key ?? null,
      pixCopyPaste: pixDonation?.copyPaste ?? null,
      donationCents: PREMIUM_DONATION_CENTS,
      ...(premiumUnlocked ? { analysis: buildPremiumAnalysis(report) } : {}),
    },
  })
}))

app.post('/api/sessions/:code/premium/confirm-donation', asyncRoute(async (req, res) => {
  const session = await sessionFrom(req)
  const partner = partnerFrom(req, session)
  if (session.partners.length < 2 || !session.partners.every((partner) => isFinished(session, partner))) {
    throw new HttpError(409, 'A análise Premium fica disponível quando os dois terminarem.')
  }

  if (!getPixDonationDetails()) {
    throw new HttpError(503, 'A chave Pix para contribuição ainda não foi configurada.')
  }

  session.premiumDonation = {
    status: 'confirmed',
    confirmedByPartnerId: partner.id,
    confirmedAt: Date.now(),
  }
  await persist(session)
  return res.json({ confirmed: true })
}))

app.use(express.static(clientDist))
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  void next
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message })
  if (err instanceof z.ZodError) return res.status(400).json({ message: 'Dados inválidos.' })
  console.error(err)
  return res.status(500).json({ message: 'Erro inesperado. Tente novamente.' })
})

const port = Number(process.env.PORT ?? 3001)
void initStore()
  .then(() => {
    app.listen(port, () => console.log(`API rodando em http://localhost:${port}`))
  })
  .catch((error: unknown) => {
    console.error('Falha ao inicializar persistência da aplicação:', error)
    process.exitCode = 1
  })
