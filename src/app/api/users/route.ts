import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest, hashPassword, toSafeUser } from '@/lib/auth'

/* GET /api/users — admin only: list all users */
export async function GET(req: Request) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      points: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
  return NextResponse.json({ users })
}

/* POST /api/users — admin only: create user */
export async function POST(req: Request) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }
  const email = String(body.email || '').trim().toLowerCase()
  const name = String(body.name || '').trim()
  const password = String(body.password || '')
  const role = body.role === 'ADMIN' ? 'ADMIN' : 'USER'
  const points = Number.isFinite(Number(body.points)) ? Number(body.points) : 0

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
      role,
      status: 'ACTIVE',
      points,
    },
  })

  if (points !== 0) {
    await db.pointsLedger.create({
      data: {
        userId: user.id,
        amount: points,
        reason: 'ADMIN_ADJUST',
        reference: 'initial-balance',
      },
    })
  }

  return NextResponse.json({ user: toSafeUser(user) }, { status: 201 })
}
