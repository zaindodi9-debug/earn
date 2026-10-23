import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

/* GET /api/levels?gameId=xxx — public list */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const gameId = url.searchParams.get('gameId') || undefined
  const me = await getUserFromRequest(req)
  const isAdmin = me?.role === 'ADMIN'
  const where = {
    ...(gameId ? { gameId } : {}),
    ...(!isAdmin ? { status: 'ACTIVE', game: { status: 'ACTIVE' } } : {}),
  }
  const levels = await db.gameLevel.findMany({
    where,
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
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body harus berupa objek JSON' }, { status: 400 })
  }

  const gameId = String(body.gameId || '').trim()
  const levelNumber = Number(body.levelNumber)
  const name = String(body.name || '').trim()
  const difficulty = body.difficulty === undefined ? 'EASY' : String(body.difficulty)
  const status = body.status === undefined ? 'ACTIVE' : String(body.status)
  const targetScore = body.targetScore === undefined ? 100 : Number(body.targetScore)
  const timeLimitSec = body.timeLimitSec === undefined ? 60 : Number(body.timeLimitSec)
  const rewardPoints = body.rewardPoints === undefined ? 10 : Number(body.rewardPoints)

  const MAX_DB_INT = 2_147_483_647
  const MAX_LEVEL_NUMBER = 100_000
  const MAX_TIME_LIMIT_SEC = 86_400

  if (!gameId || !Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > MAX_LEVEL_NUMBER) {
    return NextResponse.json({ error: 'gameId wajib diisi dan levelNumber harus bilangan bulat antara 1 dan 100000.' }, { status: 400 })
  }
  if (!Number.isInteger(targetScore) || targetScore < 1 || targetScore > MAX_DB_INT) {
    return NextResponse.json({ error: 'targetScore harus bilangan bulat antara 1 dan 2147483647.' }, { status: 400 })
  }
  if (!Number.isInteger(timeLimitSec) || timeLimitSec < 1 || timeLimitSec > MAX_TIME_LIMIT_SEC) {
    return NextResponse.json({ error: 'timeLimitSec harus bilangan bulat antara 1 dan 86400 detik.' }, { status: 400 })
  }
  if (!Number.isInteger(rewardPoints) || rewardPoints < 0 || rewardPoints > MAX_DB_INT) {
    return NextResponse.json({ error: 'rewardPoints harus bilangan bulat antara 0 dan 2147483647.' }, { status: 400 })
  }
  if (!['EASY', 'MEDIUM', 'HARD', 'EXPERT'].includes(difficulty)) {
    return NextResponse.json({ error: 'difficulty tidak valid.' }, { status: 400 })
  }
  if (!['ACTIVE', 'LOCKED'].includes(status)) {
    return NextResponse.json({ error: 'status level tidak valid.' }, { status: 400 })
  }
  if (name.length > 120) {
    return NextResponse.json({ error: 'Nama level maksimal 120 karakter.' }, { status: 400 })
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
      difficulty,
      targetScore,
      timeLimitSec,
      rewardPoints,
      status,
    },
  })
  return NextResponse.json({ level }, { status: 201 })
}
