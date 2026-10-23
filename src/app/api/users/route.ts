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
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body harus berupa objek JSON' }, { status: 400 })
  }

  const email = String(body.email || '').trim().toLowerCase()
  const name = String(body.name || '').trim()
  const password = String(body.password || '')
  const role = body.role === undefined ? 'USER' : body.role
  const points = body.points === undefined ? 0 : Number(body.points)
  const MAX_POINTS = 2_147_483_647

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
  }
  if (role !== 'ADMIN' && role !== 'USER') {
    return NextResponse.json({ error: 'role tidak valid' }, { status: 400 })
  }
  if (!Number.isInteger(points) || points < 0 || points > MAX_POINTS) {
    return NextResponse.json({ error: 'points harus bilangan bulat nonnegatif dalam batas yang diizinkan.' }, { status: 400 })
  }
  if (password.length < 12) {
    return NextResponse.json({ error: 'Kata sandi minimal 12 karakter' }, { status: 400 })
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
        role,
        status: 'ACTIVE',
        points,
      },
    })

    if (points !== 0) {
      await tx.pointsLedger.create({
        data: {
          userId: created.id,
          amount: points,
          reason: 'ADMIN_ADJUST',
          reference: 'initial-balance',
        },
      })
    }
    return created
  })

  return NextResponse.json({ user: toSafeUser(user) }, { status: 201 })
}
