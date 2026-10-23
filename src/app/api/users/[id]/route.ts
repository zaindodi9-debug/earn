import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest, hashPassword } from '@/lib/auth'

/* PATCH /api/users/[id] — admin only: update user */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  const { id } = await params
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body harus berupa objek JSON' }, { status: 400 })
  }

  const data: any = {}
  if (typeof body.name === 'string') {
    if (body.name.trim().length > 120) {
      return NextResponse.json({ error: 'Nama maksimal 120 karakter.' }, { status: 400 })
    }
    data.name = body.name.trim() || null
  }
  if (body.role !== undefined) {
    if (body.role !== 'ADMIN' && body.role !== 'USER') {
      return NextResponse.json({ error: 'role tidak valid' }, { status: 400 })
    }
    data.role = body.role
  }
  if (body.status !== undefined) {
    if (body.status !== 'ACTIVE' && body.status !== 'SUSPENDED') {
      return NextResponse.json({ error: 'status tidak valid' }, { status: 400 })
    }
    data.status = body.status
  }
  if (typeof body.email === 'string' && body.email.trim()) {
    const email = body.email.trim().toLowerCase()
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid atau terlalu panjang' }, { status: 400 })
    }
    data.email = email
  }
  if (typeof body.password === 'string' && body.password.length > 0) {
    if (body.password.length < 12 || body.password.length > 128) {
      return NextResponse.json({ error: 'Kata sandi harus berisi 12 sampai 128 karakter' }, { status: 400 })
    }
    data.passwordHash = hashPassword(body.password)
  }

  let pointsDelta = 0
  const MAX_POINTS = 2_147_483_647
  if (body.pointsDelta !== undefined) {
    pointsDelta = Number(body.pointsDelta)
    if (!Number.isInteger(pointsDelta) || Math.abs(pointsDelta) > MAX_POINTS) {
      return NextResponse.json({ error: 'pointsDelta harus bilangan bulat dalam batas yang diizinkan.' }, { status: 400 })
    }
  }

  const user = await db.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  if (data.email && data.email !== user.email) {
    const emailOwner = await db.user.findUnique({ where: { email: data.email }, select: { id: true } })
    if (emailOwner && emailOwner.id !== id) {
      return NextResponse.json({ error: 'Email sudah digunakan akun lain.' }, { status: 409 })
    }
  }
  if (user.points + pointsDelta < 0 || user.points + pointsDelta > MAX_POINTS) {
    return NextResponse.json({ error: 'Perubahan poin akan membuat saldo di luar batas yang diizinkan.' }, { status: 400 })
  }

  const transactionResult = await db.$transaction(async (tx) => {
    // Serialize administrator lifecycle changes so concurrent requests cannot remove every active admin.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(2041950001::bigint)`
    const currentTarget = await tx.user.findUnique({
      where: { id },
      select: { role: true, status: true, points: true },
    })
    if (!currentTarget) return 'missing' as const

    const nextRole = data.role ?? currentTarget.role
    const nextStatus = data.status ?? currentTarget.status
    if (
      currentTarget.role === 'ADMIN' &&
      currentTarget.status === 'ACTIVE' &&
      (nextRole !== 'ADMIN' || nextStatus !== 'ACTIVE')
    ) {
      const activeAdmins = await tx.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } })
      if (activeAdmins <= 1) return 'last-admin' as const
    }
    if (currentTarget.points + pointsDelta < 0 || currentTarget.points + pointsDelta > MAX_POINTS) {
      return 'points-limit' as const
    }

    await tx.user.update({
      where: { id },
      data: { ...data, points: { increment: pointsDelta } },
    })
    // A password reset must invalidate all existing sessions for the target account.
    if (data.passwordHash) {
      await tx.session.deleteMany({ where: { userId: id } })
    }
    if (pointsDelta !== 0) {
      await tx.pointsLedger.create({
        data: {
          userId: id,
          amount: pointsDelta,
          reason: 'ADMIN_ADJUST',
          reference: me.email,
        },
      })
    }
    return 'ok' as const
  })

  if (transactionResult === 'missing') {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  }
  if (transactionResult === 'last-admin') {
    return NextResponse.json({ error: 'Administrator aktif terakhir tidak dapat dinonaktifkan atau diturunkan perannya.' }, { status: 400 })
  }
  if (transactionResult === 'points-limit') {
    return NextResponse.json({ error: 'Perubahan poin akan membuat saldo di luar batas yang diizinkan.' }, { status: 400 })
  }

  const updated = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      points: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return NextResponse.json({ user: updated })
}

/* DELETE /api/users/[id] — admin only: delete user */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  const { id } = await params
  if (id === me.id) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 })
  }
  const deleteResult = await db.$transaction(async (tx) => {
    // Use the same lock as PATCH to make the last-active-admin rule race-safe.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(2041950001::bigint)`
    const target = await tx.user.findUnique({ where: { id }, select: { role: true, status: true } })
    if (!target) return 'missing' as const
    if (target.role === 'ADMIN' && target.status === 'ACTIVE') {
      const activeAdmins = await tx.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } })
      if (activeAdmins <= 1) return 'last-admin' as const
    }
    await tx.user.delete({ where: { id } })
    return 'ok' as const
  })
  if (deleteResult === 'missing') {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  }
  if (deleteResult === 'last-admin') {
    return NextResponse.json({ error: 'Administrator aktif terakhir tidak dapat dihapus.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}

/* GET /api/users/[id] — admin only: user detail with progress + ledger */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    // Explicitly select public/admin-safe fields. Never serialize passwordHash.
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      points: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      progress: {
        include: { gameLevel: { include: { game: true } } },
        orderBy: { updatedAt: 'desc' },
      },
      pointsLedger: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  })
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ user })
}
