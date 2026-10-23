import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clearAuthAttempts, consumeAuthAttempt, getClientIp } from '@/lib/auth-rate-limit'
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
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body harus berupa objek JSON' }, { status: 400 })
  }
  const ip = getClientIp(req)
  const rateLimit = await consumeAuthAttempt('register-ip', ip, 6, 60 * 60 * 1000, 60 * 60 * 1000)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan pendaftaran. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? 3600) } }
    )
  }

  const email = String(body.email || '').trim().toLowerCase()
  const name = String(body.name || '').trim()
  const password = String(body.password || '')
  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
  }
  if (password.length < 12) {
    return NextResponse.json({ error: 'Kata sandi harus berisi 12 sampai 128 karakter' }, { status: 400 })
  }
  if (name.length > 120) {
    return NextResponse.json({ error: 'Nama maksimal 120 karakter' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
  }

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: hashPassword(password),
        role: 'USER',
        status: 'ACTIVE',
        points: 100, // signup bonus
      },
    })

    await tx.pointsLedger.create({
      data: {
        userId: created.id,
        amount: 100,
        reason: 'SIGNUP_BONUS',
        reference: 'signup',
      },
    })

    return created
  })

  await Promise.all([
    clearAuthAttempts('login-ip', ip),
    clearAuthAttempts('login-email', email),
  ])
  const token = await createSession(user.id)
  const res = NextResponse.json({ user: toSafeUser(user) })
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
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
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
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
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body harus berupa objek JSON' }, { status: 400 })
  }
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 })
  }
  if (email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid atau terlalu panjang' }, { status: 400 })
  }
  if (password.length > 128) {
    return NextResponse.json({ error: 'Kata sandi maksimal 128 karakter' }, { status: 400 })
  }

  const ip = getClientIp(req)
  const ipLimit = await consumeAuthAttempt('login-ip', ip, 20, 15 * 60 * 1000, 15 * 60 * 1000)
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan masuk dari jaringan ini. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds ?? 900) } }
    )
  }
  const emailLimit = await consumeAuthAttempt('login-email', email, 10, 15 * 60 * 1000, 15 * 60 * 1000)
  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan masuk untuk akun ini. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(emailLimit.retryAfterSeconds ?? 900) } }
    )
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
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return res
}
