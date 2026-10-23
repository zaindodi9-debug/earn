import { db } from '@/lib/db'
import { resolveGameEmbedUrl } from '@/lib/game-embeds'

/** Ensure HONEYPAW is present in non-empty production databases too. */
const gameData = {
  title: 'Honeypaw: Petualangan Beruang',
  slug: 'honeypaw',
  description: 'Petualangan platformer 3D di hutan fantasi. Kumpulkan madu, hindari lebah, aktifkan checkpoint, dan capai Sarang Agung.',
  category: 'arcade',
  sortOrder: 12,
  thumbnailUrl: '/images/game-honeypaw.svg',
  embedUrl: '/games/honeypaw.html',
  status: 'ACTIVE',
}

const levels = [
  { levelNumber: 1, name: 'Honeypaw · Level 1', difficulty: 'EASY', targetScore: 100, timeLimitSec: 90, rewardPoints: 10 },
  { levelNumber: 2, name: 'Honeypaw · Level 2', difficulty: 'MEDIUM', targetScore: 250, timeLimitSec: 75, rewardPoints: 25 },
  { levelNumber: 3, name: 'Honeypaw · Level 3', difficulty: 'HARD', targetScore: 500, timeLimitSec: 60, rewardPoints: 50 },
] as const

async function main() {
  const game = await db.game.upsert({
    where: { slug: gameData.slug },
    update: {
      title: gameData.title,
      description: gameData.description,
      category: gameData.category,
      sortOrder: gameData.sortOrder,
      thumbnailUrl: gameData.thumbnailUrl,
      embedUrl: resolveGameEmbedUrl(gameData.slug, gameData.embedUrl),
      status: gameData.status,
    },
    create: {
      ...gameData,
      embedUrl: resolveGameEmbedUrl(gameData.slug, gameData.embedUrl),
    },
  })

  for (const level of levels) {
    await db.gameLevel.upsert({
      where: { gameId_levelNumber: { gameId: game.id, levelNumber: level.levelNumber } },
      update: {
        name: level.name,
        difficulty: level.difficulty,
        targetScore: level.targetScore,
        timeLimitSec: level.timeLimitSec,
        rewardPoints: level.rewardPoints,
        status: 'ACTIVE',
      },
      create: { ...level, gameId: game.id, status: 'ACTIVE' },
    })
  }

  console.log('Honeypaw tersinkronisasi: 1 game aktif, 3 level aktif.')
}

main()
  .catch((error) => {
    console.error('Gagal menyinkronkan Honeypaw:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
