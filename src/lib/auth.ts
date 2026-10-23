import { db } from '@/lib/db'
import crypto from 'crypto'

const SESSION_COOKIE = 'np_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
const configuredSecret = process.env.SESSION_SECRET
if (process.env.NODE_ENV === 'production' && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error('SESSION_SECRET must be set to at least 32 characters in production')
}
const SECRET = configuredSecret || 'earngames-dev-secret-change-in-production'

/* ---------------- password hashing (scrypt) ---------------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const test = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'))
}

/* ---------------- session token (HMAC-signed) ---------------- */

export function createToken(userId: string): string {
  const payload = { uid: userId, exp: Date.now() + SESSION_TTL_MS }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyToken(token: string): { uid: string; exp: number } | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (sig !== expected) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

/* ---------------- cookie helpers ---------------- */

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export const SESSION_MAX_AGE = SESSION_TTL_MS / 1000

/* ---------------- session DB + current user ---------------- */

export async function createSession(userId: string): Promise<string> {
  const token = createToken(userId)
  await db.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  })
  return token
}

export async function getUserFromRequest(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const token = parseCookie(cookie, SESSION_COOKIE)
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) return null
  if (session.user.status !== 'ACTIVE') return null
  return session.user
}

export function parseCookie(cookieStr: string, name: string): string | null {
  const parts = cookieStr.split(';').map((s) => s.trim())
  for (const p of parts) {
    const [k, v] = p.split('=')
    if (k === name) return v ?? null
  }
  return null
}

export type SafeUser = {
  id: string
  email: string
  name: string | null
  role: string
  status: string
  points: number
  avatarUrl: string | null
}

export function toSafeUser(u: {
  id: string
  email: string
  name: string | null
  role: string
  status: string
  points: number
  avatarUrl: string | null
}): SafeUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    points: u.points,
    avatarUrl: u.avatarUrl,
  }
}
