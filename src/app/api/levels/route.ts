import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

/* GET /api/levels?gameId=xxx — public list */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const gameId = url.searchParams.get('gameId') || undefined
  const levels = await db.gameLevel.findMany({
    where: gameId ? { gameId } : {},
    include: { game: true },
    orderBy: [{ gameId: 'asc' }, { levelNumber: 'asc' }],
  })
  return NextResponse.json({ levels })
}

/* POST /api/levels — admin only */
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
  const gameId = String(body.gameId || '')
  const levelNumber = Number(body.levelNumber)
  const name = String(body.name || '').trim()
  if (!gameId || !Number.isFinite(levelNumber) || levelNumber < 1) {
    return NextResponse.json({ error: 'gameId dan levelNumber wajib diisi' }, { status: 400 })
  }

  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) return NextResponse.json({ error: 'Game tidak ditemukan' }, { status: 404 })

  const dup = await db.gameLevel.findUnique({
    where: { gameId_levelNumber: { gameId, levelNumber } },
  })
  if (dup) return NextResponse.json({ error: 'Level number sudah dipakai' }, { status: 409 })

  const level = await db.gameLevel.create({
    data: {
      gameId,
      levelNumber,
      name: name || `${game.title} Level ${levelNumber}`,
      difficulty: String(body.difficulty || 'EASY'),
      targetScore: Number(body.targetScore) || 100,
      timeLimitSec: Number(body.timeLimitSec) || 60,
      rewardPoints: Number(body.rewardPoints) || 10,
      status: String(body.status || 'ACTIVE'),
    },
  })
  return NextResponse.json({ level }, { status: 201 })
}
