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
  if (body.role === 'ADMIN' || body.role === 'USER') data.role = body.role
  if (body.status === 'ACTIVE' || body.status === 'SUSPENDED') data.status = body.status
  if (typeof body.email === 'string' && body.email.trim()) {
    const email = body.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    data.email = email
  }
  if (typeof body.password === 'string' && body.password.length > 0) {
    if (body.password.length < 12) {
      return NextResponse.json({ error: 'Kata sandi minimal 12 karakter' }, { status: 400 })
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
  if (user.points + pointsDelta < 0 || user.points + pointsDelta > MAX_POINTS) {
    return NextResponse.json({ error: 'Perubahan poin akan membuat saldo di luar batas yang diizinkan.' }, { status: 400 })
  }

  const nextRole = data.role ?? user.role
  const nextStatus = data.status ?? user.status
  if (user.role === 'ADMIN' && user.status === 'ACTIVE' && (nextRole !== 'ADMIN' || nextStatus !== 'ACTIVE')) {
    const activeAdmins = await db.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } })
    if (activeAdmins <= 1) {
      return NextResponse.json({ error: 'Akun ini adalah administrator aktif terakhir; promosikan admin lain sebelum menonaktifkannya.' }, { status: 400 })
    }
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { ...data, points: { increment: pointsDelta } },
    })
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
  })

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
  const target = await db.user.findUnique({ where: { id }, select: { role: true, status: true } })
  if (!target) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  if (target.role === 'ADMIN' && target.status === 'ACTIVE') {
    const activeAdmins = await db.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } })
    if (activeAdmins <= 1) {
      return NextResponse.json({ error: 'Administrator aktif terakhir tidak dapat dihapus.' }, { status: 400 })
    }
  }
  await db.user.delete({ where: { id } })
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
