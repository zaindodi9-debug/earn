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
  const existingLevel = await db.gameLevel.findUnique({ where: { id }, select: { id: true, gameId: true } })
  if (!existingLevel) return NextResponse.json({ error: 'Level tidak ditemukan' }, { status: 404 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body harus berupa objek JSON' }, { status: 400 })
  }

  const data: { name?: string; difficulty?: string; status?: string; levelNumber?: number; targetScore?: number; timeLimitSec?: number; rewardPoints?: number } = {}
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.trim().length > 120) {
      return NextResponse.json({ error: 'Nama level wajib diisi dan maksimal 120 karakter.' }, { status: 400 })
    }
    data.name = body.name.trim()
  }
  if (body.difficulty !== undefined) {
    if (!['EASY', 'MEDIUM', 'HARD', 'EXPERT'].includes(body.difficulty)) {
      return NextResponse.json({ error: 'difficulty tidak valid.' }, { status: 400 })
    }
    data.difficulty = body.difficulty
  }
  if (body.status !== undefined) {
    if (!['ACTIVE', 'LOCKED'].includes(body.status)) {
      return NextResponse.json({ error: 'status level tidak valid.' }, { status: 400 })
    }
    data.status = body.status
  }

  const MAX_DB_INT = 2_147_483_647
  const numericRules: Record<string, { min: number; max: number; label: string }> = {
    levelNumber: { min: 1, max: 100_000, label: 'levelNumber' },
    targetScore: { min: 1, max: MAX_DB_INT, label: 'targetScore' },
    timeLimitSec: { min: 1, max: 86_400, label: 'timeLimitSec' },
    rewardPoints: { min: 0, max: MAX_DB_INT, label: 'rewardPoints' },
  }
  for (const [key, rule] of Object.entries(numericRules)) {
    if (body[key] === undefined) continue
    const value = Number(body[key])
    if (!Number.isInteger(value) || value < rule.min || value > rule.max) {
      return NextResponse.json({ error: `${rule.label} harus bilangan bulat antara ${rule.min} dan ${rule.max}.` }, { status: 400 })
    }
    data[key] = value
  }

  if (data.levelNumber !== undefined) {
    const dup = await db.gameLevel.findUnique({
      where: { gameId_levelNumber: { gameId: existingLevel.gameId, levelNumber: data.levelNumber } },
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
  const existingLevel = await db.gameLevel.findUnique({ where: { id }, select: { id: true } })
  if (!existingLevel) return NextResponse.json({ error: 'Level tidak ditemukan' }, { status: 404 })
  await db.gameLevel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
