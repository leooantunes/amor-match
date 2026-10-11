import 'dotenv/config'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { z } from 'zod'
import { categories, questionById, questions } from './questions.js'
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

function isFinished(p: Partner): boolean {
  return questions.every((q) => {
    const a = p.answers[q.id]
    return a && (!q.guess || a.guess !== undefined)
  })
}

function sessionFrom(req: Request): Session {
  const session = getSession(String(req.params.code))
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

app.get('/api/questions', (_req, res) => {
  res.json({ categories, questions })
})

app.get('/api/health', asyncRoute(async (_req, res) => {
  await checkStore()
  return res.json({ status: 'ok' })
}))

app.post('/api/sessions', asyncRoute(async (req, res) => {
  const { name } = nameSchema.parse(req.body)
  const { session, partner } = createSession(name)
  await persist(session)
  res.status(201).json({ code: session.code, partnerId: partner.id })
}))

app.post('/api/sessions/:code/join', asyncRoute(async (req, res) => {
  const { name } = nameSchema.parse(req.body)
  const session = sessionFrom(req)
  if (session.partners.length >= 2) throw new HttpError(409, 'Esta sala já tem duas pessoas.')
  const partner = addPartner(session, name)
  await persist(session)
  res.status(201).json({ code: session.code, partnerId: partner.id })
}))

app.get('/api/sessions/:code', (req, res) => {
  const session = sessionFrom(req)
  const me = partnerFrom(req, session)
  const other = session.partners.find((p) => p.id !== me.id)
  res.json({
    code: session.code,
    total: questions.length,
    me: { name: me.name, answered: Object.keys(me.answers).length, finished: isFinished(me), answers: me.answers },
    partner: other
      ? { name: other.name, answered: Object.keys(other.answers).length, finished: isFinished(other) }
      : null,
    reportReady: session.partners.length === 2 && session.partners.every(isFinished),
  })
})

app.put('/api/sessions/:code/answers', asyncRoute(async (req, res) => {
  const session = sessionFrom(req)
  const me = partnerFrom(req, session)
  const body = answerSchema.parse(req.body)
  const question = questionById.get(body.questionId)
  if (!question) throw new HttpError(400, 'Pergunta inválida.')
  if (question.guess && body.guess === undefined) throw new HttpError(400, 'Informe também o palpite.')
  me.answers[question.id] = question.guess ? { value: body.value, guess: body.guess } : { value: body.value }
  await persist(session)
  res.json({ ok: true })
}))

app.get('/api/sessions/:code/report', (req, res) => {
  const session = sessionFrom(req)
  partnerFrom(req, session)
  if (session.partners.length < 2 || !session.partners.every(isFinished)) {
    throw new HttpError(409, 'O relatório fica pronto quando os dois terminarem.')
  }
  const report = buildReport(session.partners[0], session.partners[1])
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
})

app.post('/api/sessions/:code/premium/confirm-donation', asyncRoute(async (req, res) => {
  const session = sessionFrom(req)
  const partner = partnerFrom(req, session)
  if (session.partners.length < 2 || !session.partners.every(isFinished)) {
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
