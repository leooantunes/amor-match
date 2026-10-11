import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export interface Answer {
  value: number
  guess?: number
}

export interface Partner {
  id: string
  name: string
  answers: Record<string, Answer>
}

export interface Session {
  code: string
  createdAt: number
  partners: Partner[]
}

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'sessions.json')
const TTL_MS = 1000 * 60 * 60 * 24 * 30
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const sessions = new Map<string, Session>()

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Session[]
    const now = Date.now()
    for (const s of raw) if (now - s.createdAt < TTL_MS) sessions.set(s.code, s)
  } catch {
    /* primeiro uso: sem arquivo */
  }
}

let saveTimer: NodeJS.Timeout | undefined
export function persist() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify([...sessions.values()]))
  }, 200)
}

function newCode(): string {
  let code = ''
  do {
    code = Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')
  } while (sessions.has(code))
  return code
}

export function createSession(name: string): { session: Session; partner: Partner } {
  const partner: Partner = { id: randomUUID(), name, answers: {} }
  const session: Session = { code: newCode(), createdAt: Date.now(), partners: [partner] }
  sessions.set(session.code, session)
  persist()
  return { session, partner }
}

export function getSession(code: string): Session | undefined {
  return sessions.get(code.toUpperCase())
}

export function addPartner(session: Session, name: string): Partner {
  const partner: Partner = { id: randomUUID(), name, answers: {} }
  session.partners.push(partner)
  persist()
  return partner
}

load()
