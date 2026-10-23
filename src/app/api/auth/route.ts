import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  createSession,
  getUserFromRequest,
  hashPassword,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  toSafeUser,
  verifyPassword,
} from '@/lib/auth'

/* POST /api/auth/register — public signup */
export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }
  const email = String(body.email || '').trim().toLowerCase()
  const name = String(body.name || '').trim()
  const password = String(body.password || '')
  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
  }

  const user = await db.user.create({
    data: {
      email,
      name: name || null,
      passwordHash: hashPassword(password),
      role: 'USER',
      status: 'ACTIVE',
      points: 100, // signup bonus
    },
  })

  await db.pointsLedger.create({
    data: {
      userId: user.id,
      amount: 100,
      reason: 'SIGNUP_BONUS',
      reference: 'signup',
    },
  })

  const token = await createSession(user.id)
  const res = NextResponse.json({ user: toSafeUser(user) })
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return res
}

/* GET /api/auth/me */
export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({ user: toSafeUser(user) })
}

/* DELETE /api/auth/logout */
export async function DELETE(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const { parseCookie } = await import('@/lib/auth')
  const token = parseCookie(cookie, SESSION_COOKIE_NAME)
  if (token) {
    try {
      await db.session.deleteMany({ where: { token } })
    } catch {}
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}

/* PUT /api/auth/login */
export async function PUT(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Email atau kata sandi salah' }, { status: 401 })
  }
  if (user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Akun dinonaktifkan. Hubungi administrator.' }, { status: 403 })
  }

  const token = await createSession(user.id)
  const res = NextResponse.json({ user: toSafeUser(user) })
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return res
}
