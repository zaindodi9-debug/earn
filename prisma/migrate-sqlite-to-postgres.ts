/// <reference types="bun-types" />

import { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

type SqliteUser = {
  id: string
  email: string
  name: string | null
  passwordHash: string
  role: string
  status: string
  points: number
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

type SqliteGame = {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  thumbnailUrl: string | null
  embedUrl: string | null
  status: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

type SqliteLevel = {
  id: string
  gameId: string
  levelNumber: number
  name: string
  difficulty: string
  targetScore: number
  timeLimitSec: number
  rewardPoints: number
  status: string
  createdAt: string
  updatedAt: string
}

type SqliteProgress = {
  id: string
  userId: string
  gameLevelId: string
  highScore: number
  bestTimeSec: number | null
  attempts: number
  completed: number | boolean
  lastPlayedAt: string | null
  createdAt: string
  updatedAt: string
}

type SqliteLedger = {
  id: string
  userId: string
  amount: number
  reason: string
  reference: string | null
  createdAt: string
}

const sqlitePath = resolve(process.env.SQLITE_MIGRATION_PATH || 'db/custom.db')
if (!existsSync(sqlitePath)) {
  throw new Error(`SQLite source database not found: ${sqlitePath}`)
}

const source = new Database(sqlitePath, { readonly: true })
const readRows = <T>(table: string): T[] =>
  source.query(`SELECT * FROM "${table}"`).all() as T[]
const toDate = (value: string) => new Date(value)
const toNullableDate = (value: string | null) => (value ? toDate(value) : null)

async function main() {
  const users = readRows<SqliteUser>('User')
  const games = readRows<SqliteGame>('Game')
  const levels = readRows<SqliteLevel>('GameLevel')
  const progress = readRows<SqliteProgress>('UserProgress')
  const ledger = readRows<SqliteLedger>('PointsLedger')
  const counts = {
    users: users.length,
    games: games.length,
    levels: levels.length,
    progress: progress.length,
    ledger: ledger.length,
    sessions: source.query('SELECT COUNT(*) AS count FROM "Session"').get() as { count: number },
  }

  console.log(JSON.stringify({ source: sqlitePath, counts, mode: process.argv.includes('--apply') ? 'apply' : 'dry-run' }))
  if (!process.argv.includes('--apply')) {
    console.log('No rows copied. Review the counts, then rerun with --apply to import into an empty PostgreSQL database.')
    return
  }

  if (!process.env.DIRECT_URL?.startsWith('postgresql://')) {
    throw new Error('DIRECT_URL must be set to the rotated Neon direct connection string before applying.')
  }

  const target = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL } } })
  try {
    const existingCounts = await Promise.all([
      target.user.count(),
      target.game.count(),
      target.gameLevel.count(),
      target.userProgress.count(),
      target.pointsLedger.count(),
    ])
    if (existingCounts.some((count) => count > 0)) {
      throw new Error('PostgreSQL target is not empty. Import stopped without writing any data.')
    }

    await target.$transaction(async (tx) => {
      if (users.length) await tx.user.createMany({ data: users.map((row) => ({
        ...row,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      })) })

      if (games.length) await tx.game.createMany({ data: games.map((row) => ({
        ...row,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      })) })

      if (levels.length) await tx.gameLevel.createMany({ data: levels.map((row) => ({
        ...row,
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      })) })

      if (progress.length) await tx.userProgress.createMany({ data: progress.map((row) => ({
        ...row,
        completed: Boolean(row.completed),
        lastPlayedAt: toNullableDate(row.lastPlayedAt),
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      })) })

      if (ledger.length) await tx.pointsLedger.createMany({ data: ledger.map((row) => ({
        ...row,
        createdAt: toDate(row.createdAt),
      })) })
    })

    console.log('Import completed. Session rows were intentionally skipped; users must log in again.')
  } finally {
    await target.$disconnect()
  }
}

try {
  await main()
} finally {
  source.close()
}