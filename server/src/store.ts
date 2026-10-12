import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'
import type { QuestionMode } from './questions.js'

export interface Answer {
  value: number
  guess?: number
}

export interface Partner {
  id: string
  name: string
  answers: Record<string, Answer>
  adultConfirmed?: boolean
}

export interface Session {
  code: string
  createdAt: number
  partners: Partner[]
  mode?: QuestionMode
  premiumDonation?: {
    status: 'confirmed'
    confirmedByPartnerId: string
    confirmedAt: number
  }
  premiumPayment?: {
    status: 'paid'
  }
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'sessions.json')
const TTL_MS = 1000 * 60 * 60 * 24 * 30
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const sessions = new Map<string, Session>()

let pool: Pool | undefined

function loadFileStore() {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Session[]
    const now = Date.now()
    for (const s of raw) if (now - s.createdAt < TTL_MS) sessions.set(s.code, s)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

export async function initStore(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL precisa ser configurada em produção para preservar as salas.')
    }
    loadFileStore()
    return
  }

  pool = new Pool({ connectionString: databaseUrl, max: 5 })
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lovematch_sessions (
      code text PRIMARY KEY,
      session jsonb NOT NULL,
      created_at timestamptz NOT NULL
    )
  `)
  const { rows } = await pool.query<{ session: Session }>(
    "SELECT session FROM lovematch_sessions WHERE created_at > NOW() - INTERVAL '30 days'",
  )
  for (const { session } of rows) sessions.set(session.code, session)
  await pool.query("DELETE FROM lovematch_sessions WHERE created_at <= NOW() - INTERVAL '30 days'")
}

export async function checkStore(): Promise<void> {
  if (pool) await pool.query('SELECT 1')
}

export async function persist(session?: Session): Promise<void> {
  if (pool) {
    const toPersist = session ? [session] : [...sessions.values()]
    for (const current of toPersist) {
      await pool.query(
        `INSERT INTO lovematch_sessions (code, session, created_at)
         VALUES ($1, $2::jsonb, to_timestamp($3 / 1000.0))
         ON CONFLICT (code) DO UPDATE
         SET session = EXCLUDED.session, created_at = EXCLUDED.created_at`,
        [current.code, JSON.stringify(current), current.createdAt],
      )
    }
    return
  }

  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify([...sessions.values()]))
}

export function createSession(name: string): { session: Session; partner: Partner } {
  const partner: Partner = { id: randomUUID(), name, answers: {} }
  const session: Session = { code: newCode(), createdAt: Date.now(), partners: [partner] }
  sessions.set(session.code, session)
  return { session, partner }
}

function newCode(): string {
  let code = ''
  do {
    code = Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')
  } while (sessions.has(code))
  return code
}

export async function getSession(code: string): Promise<Session | undefined> {
  const normalizedCode = code.toUpperCase()
  if (pool) {
    const { rows } = await pool.query<{ session: Session }>(
      `SELECT session FROM lovematch_sessions
       WHERE code = $1 AND created_at > NOW() - INTERVAL '30 days'`,
      [normalizedCode],
    )
    const session = rows[0]?.session
    if (session) sessions.set(normalizedCode, session)
    else sessions.delete(normalizedCode)
    return session
  }
  return sessions.get(normalizedCode)
}

export function addPartner(session: Session, name: string): Partner {
  const partner: Partner = { id: randomUUID(), name, answers: {} }
  session.partners.push(partner)
  return partner
}
