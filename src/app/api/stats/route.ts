import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

/* GET /api/stats — admin dashboard stats */
export async function GET(req: Request) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }

  const [totalUsers, totalGames, totalLevels, activeGames, suspendedUsers, totalPlays, totalPointsAwarded] =
    await Promise.all([
      db.user.count({ where: { role: 'USER' } }),
      db.game.count(),
      db.gameLevel.count(),
      db.game.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { status: 'SUSPENDED' } }),
      db.userProgress.aggregate({ _sum: { attempts: true } }),
      db.pointsLedger.aggregate({ _sum: { amount: true } }),
    ])

  // recent signups
  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, email: true, name: true, createdAt: true, points: true, status: true },
  })

  // top players by points
  const topPlayers = await db.user.findMany({
    where: { role: 'USER' },
    orderBy: { points: 'desc' },
    take: 5,
    select: { id: true, email: true, name: true, points: true },
  })

  return NextResponse.json({
    totalUsers,
    totalGames,
    totalLevels,
    activeGames,
    suspendedUsers,
    totalPlays: totalPlays._sum.attempts || 0,
    totalPointsAwarded: totalPointsAwarded._sum.amount || 0,
    recentUsers,
    topPlayers,
  })
}
