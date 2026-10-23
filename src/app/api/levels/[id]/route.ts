import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

/* PATCH /api/levels/[id] — admin only */
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

  const data: any = {}
  for (const k of ['name', 'difficulty', 'status']) {
    if (body[k] !== undefined) data[k] = String(body[k])
  }
  for (const k of ['levelNumber', 'targetScore', 'timeLimitSec', 'rewardPoints']) {
    if (body[k] !== undefined) data[k] = Number(body[k]) || 0
  }

  if (data.levelNumber !== undefined) {
    const current = await db.gameLevel.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ error: 'Level tidak ditemukan' }, { status: 404 })
    const dup = await db.gameLevel.findUnique({
      where: { gameId_levelNumber: { gameId: current.gameId, levelNumber: data.levelNumber } },
    })
    if (dup && dup.id !== id) {
      return NextResponse.json({ error: 'Level number sudah dipakai' }, { status: 409 })
    }
  }

  const level = await db.gameLevel.update({ where: { id }, data, include: { game: true } })
  return NextResponse.json({ level })
}

/* DELETE /api/levels/[id] — admin only */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  const { id } = await params
  await db.gameLevel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
