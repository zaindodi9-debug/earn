import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

/* GET /api/progress — current user's progress across all levels */
export async function GET(req: Request) {
  const me = await getUserFromRequest(req)
  if (!me) return NextResponse.json({ error: 'Wajib login' }, { status: 401 })

  const progress = await db.userProgress.findMany({
    where: { userId: me.id },
    include: { gameLevel: { include: { game: true } } },
  })
  return NextResponse.json({ progress })
}

/* POST /api/progress — record a game result for the current user
 * Body: { gameLevelId, score, timeSec }
 * Logic (honest, deterministic):
 *  - increments attempts
 *  - updates highScore if score > current
 *  - updates bestTimeSec if timeSec better
 *  - if score >= targetScore AND not previously completed → mark completed, award rewardPoints ONCE
 */
export async function POST(req: Request) {
  const me = await getUserFromRequest(req)
  if (!me) return NextResponse.json({ error: 'Wajib login' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  // SECURITY: scores currently originate from the client (including iframe postMessage
  // and demo/manual input). A browser-controlled score is not proof of gameplay.
  // Fail closed until a server-verifiable game result/signature is implemented.
  return NextResponse.json(
    { error: 'Pengiriman skor dan hadiah poin sementara dinonaktifkan sampai hasil permainan dapat diverifikasi oleh server.' },
    { status: 503 }
  )

  const gameLevelId = String(body.gameLevelId || '')
  const score = Math.max(0, Number(body.score) || 0)
  const timeSec = Number.isFinite(Number(body.timeSec)) ? Number(body.timeSec) : null

  if (!gameLevelId) {
    return NextResponse.json({ error: 'gameLevelId wajib diisi' }, { status: 400 })
  }

  const level = await db.gameLevel.findUnique({
    where: { id: gameLevelId },
    include: { game: true },
  })
  if (!level) return NextResponse.json({ error: 'Level tidak ditemukan' }, { status: 404 })
  if (level.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Level terkunci' }, { status: 403 })
  }
  if (level.game.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Game tidak aktif' }, { status: 403 })
  }

  const existing = await db.userProgress.findUnique({
    where: { userId_gameLevelId: { userId: me.id, gameLevelId } },
  })

  const wasCompleted = existing?.completed ?? false
  const nowCompleted = score >= level.targetScore
  const shouldAward = nowCompleted && !wasCompleted

  const result = await db.$transaction(async (tx) => {
    const updated = await tx.userProgress.upsert({
      where: { userId_gameLevelId: { userId: me.id, gameLevelId } },
      update: {
        attempts: { increment: 1 },
        highScore: existing ? Math.max(existing.highScore, score) : score,
        bestTimeSec:
          timeSec != null
            ? existing?.bestTimeSec
              ? Math.min(existing.bestTimeSec, timeSec)
              : timeSec
            : existing?.bestTimeSec ?? null,
        completed: wasCompleted || nowCompleted,
        lastPlayedAt: new Date(),
      },
      create: {
        userId: me.id,
        gameLevelId,
        attempts: 1,
        highScore: score,
        bestTimeSec: timeSec ?? null,
        completed: nowCompleted,
        lastPlayedAt: new Date(),
      },
    })

    let awarded = 0
    if (shouldAward) {
      awarded = level.rewardPoints
      await tx.user.update({
        where: { id: me.id },
        data: { points: { increment: awarded } },
      })
      await tx.pointsLedger.create({
        data: {
          userId: me.id,
          amount: awarded,
          reason: 'GAME_REWARD',
          reference: level.id,
        },
      })
    }

    return { updated, awarded }
  })

  const freshUser = await db.user.findUnique({ where: { id: me.id } })
  return NextResponse.json({
    progress: result.updated,
    awarded: result.awarded,
    points: freshUser?.points ?? 0,
    completed: result.updated.completed,
  })
}
