import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { resolveGameEmbedUrl } from '@/lib/game-embeds'

const catalog = [
  {
    title: 'Balapan Senja',
    slug: 'sunset-rush',
    description: 'Balapan 3D melintasi gurun, hutan pinus, dan jalur kota. Hindari tabrakan, kumpulkan koin, dan gunakan nitro.',
    category: 'arcade',
    sortOrder: 1,
    embedUrl: '/games/sunset-rush.html',
    thumbnailUrl: '/images/game-sunset-rush.png',
  },
  {
    title: 'Bubble Pop',
    slug: 'bubble-pop',
    description: 'Bidik dan ledakkan gelembung warna-warni sebelum turun ke garis bawah.',
    category: 'puzzle',
    sortOrder: 2,
    embedUrl: '/games/bubble-pop.html',
    thumbnailUrl: '/images/game-bubble-pop.png',
  },
  {
    title: 'Flip Match',
    slug: 'flip-match',
    description: 'Balik kartu dan temukan pasangan yang sama sebelum waktu habis.',
    category: 'puzzle',
    sortOrder: 3,
    embedUrl: '/games/flip-match.html',
    thumbnailUrl: null,
  },
  {
    title: 'Ninja Jump',
    slug: 'ninja-jump',
    description: 'Lompati rintangan, hindari shuriken, dan ambil koin.',
    category: 'arcade',
    sortOrder: 4,
    embedUrl: '/games/ninja-jump.html',
    thumbnailUrl: '/images/game-ninja-jump.png',
  },
  {
    title: 'Tembak Sasaran',
    slug: 'tembak-sasaran',
    description: 'Bidik sasaran bergerak dengan presisi untuk mendapatkan skor tinggi.',
    category: 'arcade',
    sortOrder: 5,
    embedUrl: null,
    thumbnailUrl: null,
  },
  {
    title: 'Bola Pinball',
    slug: 'bola-pinball',
    description: 'Jaga bola tetap hidup dan kumpulkan poin dari bumper pinball.',
    category: 'arcade',
    sortOrder: 6,
    embedUrl: null,
    thumbnailUrl: null,
  },
  {
    title: 'Solitaire Cepat',
    slug: 'solitaire-cepat',
    description: 'Susun kartu dari As hingga Raja secepat mungkin.',
    category: 'card',
    sortOrder: 7,
    embedUrl: null,
    thumbnailUrl: null,
  },
  {
    title: 'Penalti Sepak Bola',
    slug: 'penalti-sepak-bola',
    description: 'Tendang ke sudut gawang dan coba kalahkan kiper.',
    category: 'sports',
    sortOrder: 8,
    embedUrl: '/games/penalti.html',
    thumbnailUrl: '/images/game-penalti.png',
  },
  {
    title: 'Tower Stack',
    slug: 'tower-stack',
    description: 'Tumpuk balok dengan timing yang tepat agar menara tetap berdiri.',
    category: 'arcade',
    sortOrder: 9,
    embedUrl: null,
    thumbnailUrl: null,
  },
  {
    title: 'Catur Kilat',
    slug: 'catur-kilat',
    description: 'Tunjukkan strategi terbaik dalam pertandingan catur bertimer.',
    category: 'strategy',
    sortOrder: 10,
    embedUrl: null,
    thumbnailUrl: null,
  },
  {
    title: 'Grand City Auto',
    slug: 'grand-city-auto',
    description: 'Jelajahi kota 3D, kemudikan mobil, dan selesaikan misi.',
    category: 'arcade',
    sortOrder: 11,
    embedUrl: '/games/grand-city-auto.html',
    thumbnailUrl: null,
  },
  {
    title: 'Honeypaw: Petualangan Beruang',
    slug: 'honeypaw',
    description: 'Petualangan platformer 3D di hutan fantasi. Kumpulkan madu, hindari lebah, aktifkan checkpoint, dan capai Sarang Agung.',
    category: 'arcade',
    sortOrder: 12,
    embedUrl: '/games/honeypaw.html',
    thumbnailUrl: '/images/game-honeypaw.svg',
  },
] as const

const levels = [
  { levelNumber: 1, name: 'Level 1', difficulty: 'EASY', targetScore: 100, timeLimitSec: 90, rewardPoints: 10 },
  { levelNumber: 2, name: 'Level 2', difficulty: 'MEDIUM', targetScore: 250, timeLimitSec: 75, rewardPoints: 25 },
  { levelNumber: 3, name: 'Level 3', difficulty: 'HARD', targetScore: 500, timeLimitSec: 60, rewardPoints: 50 },
] as const

async function main() {
  // Optional production admin bootstrap. Secrets are supplied through Vercel env vars,
  // never committed to the repository. This account is reconciled on each production build.
  const initialAdminEmail = (process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase()
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || ''
  if (initialAdminEmail || initialAdminPassword) {
    if (!initialAdminEmail || !initialAdminPassword) {
      throw new Error('INITIAL_ADMIN_EMAIL dan INITIAL_ADMIN_PASSWORD harus diisi bersama.')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(initialAdminEmail)) {
      throw new Error('INITIAL_ADMIN_EMAIL tidak memiliki format email yang valid.')
    }
    if (initialAdminPassword.length < 16) {
      throw new Error('INITIAL_ADMIN_PASSWORD harus minimal 16 karakter.')
    }
    await db.user.upsert({
      where: { email: initialAdminEmail },
      update: {
        passwordHash: hashPassword(initialAdminPassword),
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      create: {
        email: initialAdminEmail,
        name: 'Administrator',
        passwordHash: hashPassword(initialAdminPassword),
        role: 'ADMIN',
        status: 'ACTIVE',
        points: 0,
      },
    })
    console.log(`Akun administrator awal telah dipastikan tersedia: ${initialAdminEmail}`)
  } else {
    console.log('Bootstrap admin dilewati: INITIAL_ADMIN_EMAIL/PASSWORD belum disetel.')
  }

  const seeded = await db.$transaction(async (tx) => {
    const existingCount = await tx.game.count()
    if (existingCount > 0) {
      return { skipped: true, games: existingCount }
    }

    for (const item of catalog) {
      const game = await tx.game.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          ...item,
          embedUrl: resolveGameEmbedUrl(item.slug, item.embedUrl),
          status: 'ACTIVE',
        },
      })

      for (const level of levels) {
        await tx.gameLevel.upsert({
          where: {
            gameId_levelNumber: {
              gameId: game.id,
              levelNumber: level.levelNumber,
            },
          },
          update: {},
          create: {
            ...level,
            gameId: game.id,
            name: `${item.title} ${level.name}`,
            status: 'ACTIVE',
          },
        })
      }
    }

    return { skipped: false, games: catalog.length }
  }, { maxWait: 10_000, timeout: 60_000 })

  if (seeded.skipped) {
    console.log(`Katalog game tidak diubah: database sudah memiliki ${seeded.games} game.`)
  } else {
    console.log(`Katalog awal berhasil dibuat: ${seeded.games} game dengan ${seeded.games * levels.length} level aktif.`)
  }
}

main()
  .catch((error) => {
    console.error('Gagal menyiapkan katalog game:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
