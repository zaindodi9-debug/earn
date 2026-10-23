import { db } from '@/lib/db'
import { resolveGameEmbedUrl } from '@/lib/game-embeds'

/** Sinkronisasi idempoten Empat Sejajar 3D pada database produksi. */
const gameData = {
  title: 'Empat Sejajar 3D',
  slug: 'empat-sejajar-3d',
  description: 'Permainan strategi papan 3D. Letakkan bidak pada papan bertingkat dan jadilah pemain pertama yang menyusun empat bidak segaris.',
  category: 'strategy',
  sortOrder: 13,
  thumbnailUrl: '/images/game-empat-sejajar-3d.svg',
  embedUrl: '/games/empat-sejajar-3d.html',
  status: 'ACTIVE',
}
const levels = [
  { levelNumber: 1, name: 'Pemula', difficulty: 'EASY', targetScore: 100, timeLimitSec: 180, rewardPoints: 10 },
  { levelNumber: 2, name: 'Menengah', difficulty: 'MEDIUM', targetScore: 250, timeLimitSec: 150, rewardPoints: 25 },
  { levelNumber: 3, name: 'Mahir', difficulty: 'HARD', targetScore: 500, timeLimitSec: 120, rewardPoints: 50 },
]
async function main() {
  const game = await db.game.upsert({
    where: { slug: gameData.slug },
    update: {
      title: gameData.title, description: gameData.description, category: gameData.category,
      sortOrder: gameData.sortOrder, thumbnailUrl: gameData.thumbnailUrl,
      embedUrl: resolveGameEmbedUrl(gameData.slug, gameData.embedUrl), status: gameData.status,
    },
    create: { ...gameData, embedUrl: resolveGameEmbedUrl(gameData.slug, gameData.embedUrl) },
  })
  for (const level of levels) {
    await db.gameLevel.upsert({
      where: { gameId_levelNumber: { gameId: game.id, levelNumber: level.levelNumber } },
      update: {
        name: level.name, difficulty: level.difficulty, targetScore: level.targetScore,
        timeLimitSec: level.timeLimitSec, rewardPoints: level.rewardPoints, status: 'ACTIVE',
      },
      create: { ...level, gameId: game.id, status: 'ACTIVE' },
    })
  }
  console.log('Empat Sejajar 3D tersinkronisasi: 1 game aktif, 3 level aktif.')
}
main().catch((error) => {
  console.error('Gagal menyinkronkan Empat Sejajar 3D:', error)
  process.exitCode = 1
}).finally(async () => { await db.$disconnect() })
