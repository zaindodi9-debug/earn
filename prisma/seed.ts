import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { resolveGameEmbedUrl } from '@/lib/game-embeds'

async function main() {
  // Administrator bootstrap requires credentials supplied outside the repository.
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
    console.log(`Akun administrator awal disiapkan: ${initialAdminEmail}`)
  } else {
    console.log('Bootstrap administrator dilewati. Set INITIAL_ADMIN_EMAIL dan INITIAL_ADMIN_PASSWORD jika diperlukan.')
  }

  // Games catalog — SUNSET RUSH (real, playable) + several gamezop-style casual games (demo, awaiting embedUrl)
  const games = [
    {
      title: 'Balapan Senja',
      slug: 'sunset-rush',
      description: 'Balapan 3D layar lebar melintasi gurun, hutan pinus, hingga jalur kota. Hindari tabrakan, kumpulkan koin, dan aktifkan nitro untuk skor maksimal.',
      category: 'arcade',
      sortOrder: 1,
      embedUrl: '/games/sunset-rush.html',
      thumbnailUrl: '/images/game-sunset-rush.png',
      status: 'ACTIVE',
    },
    {
      title: 'Bubble Pop',
      slug: 'bubble-pop',
      description: 'Bidik dan ledakkan deretan gelembung warna-warni sebelum turun ke garis bawah. Game kasual santai ala gamezop.',
      category: 'puzzle',
      sortOrder: 2,
      thumbnailUrl: '/images/game-bubble-pop.png',
      embedUrl: '/games/bubble-pop.html',
      status: 'ACTIVE',
    },
    {
      title: 'Flip Match',
      slug: 'flip-match',
      description: 'Balik kartu dan temukan pasangan yang sama sebelum waktu habis. Latih ingatanmu di setiap level.',
      category: 'puzzle',
      sortOrder: 3,
      embedUrl: '/games/flip-match.html',
      status: 'ACTIVE',
    },
    {
      title: 'Ninja Jump',
      slug: 'ninja-jump',
      description: 'Lompati rintangan, hindari shuriken, dan ambil koin. Game ringan satu tombol yang adiktif.',
      category: 'arcade',
      sortOrder: 4,
      thumbnailUrl: '/images/game-ninja-jump.png',
      embedUrl: '/games/ninja-jump.html',
      status: 'ACTIVE',
    },
    {
      title: 'Tembak Sasaran',
      slug: 'tembak-sasaran',
      description: 'Bidik sasaran yang bergerak dengan presisi. Semakin cepat dan akurat, semakin tinggi skornya.',
      category: 'arcade',
      sortOrder: 5,
      status: 'ACTIVE',
    },
    {
      title: 'Bola Pinball',
      slug: 'bola-pinball',
      description: 'Klasik pinball dengan flipper. Jaga bola tetap hidup dan tumpuk combo bumper untuk skor besar.',
      category: 'arcade',
      sortOrder: 6,
      status: 'ACTIVE',
    },
    {
      title: 'Solitaire Cepat',
      slug: 'solitaire-cepat',
      description: 'Susun kartu dari As hingga Raja dengan cepat. Versi ringan dari kartu klasik untuk mengisi waktu.',
      category: 'card',
      sortOrder: 7,
      status: 'ACTIVE',
    },
    {
      title: 'Penalti Sepak Bola',
      slug: 'penalti-sepak-bola',
      description: 'Tendang ke sudut gawang dan tipu kiper. Pertandingan adu penalti singkat dan menegangkan.',
      category: 'sports',
      sortOrder: 8,
      thumbnailUrl: '/images/game-penalti.png',
      embedUrl: '/games/penalti.html',
      status: 'ACTIVE',
    },
    {
      title: 'Tower Stack',
      slug: 'tower-stack',
      description: 'Tumpuk balok setinggi mungkin dengan timing tepat. Satu salah perhitungan dan menara runtuh.',
      category: 'arcade',
      sortOrder: 9,
      status: 'ACTIVE',
    },
    {
      title: 'Catur Kilat',
      slug: 'catur-kilat',
      description: 'Catur dengan timer cepat. Tunjukkan strategimu melawan lawan dalam batas waktu singkat.',
      category: 'strategy',
      sortOrder: 10,
      status: 'ACTIVE',
    },
    {
      title: 'Grand City Auto',
      slug: 'grand-city-auto',
      description: 'Jelajahi kota 3D, kemudikan mobil, dan selesaikan misi untuk mendapatkan hadiah.',
      category: 'arcade',
      sortOrder: 11,
      embedUrl: '/games/grand-city-auto.html',
      status: 'ACTIVE',
    },
    {
      title: 'Honeypaw: Petualangan Beruang',
      slug: 'honeypaw',
      description: 'Petualangan platformer 3D di hutan fantasi. Kumpulkan madu, hindari lebah, aktifkan checkpoint, dan capai Sarang Agung.',
      category: 'arcade',
      sortOrder: 12,
      thumbnailUrl: '/images/game-honeypaw.svg',
      embedUrl: '/games/honeypaw.html',
      status: 'ACTIVE',
    },
    {
      title: 'Empat Sejajar 3D',
      slug: 'empat-sejajar-3d',
      description: 'Permainan strategi papan 3D. Letakkan bidak pada papan bertingkat dan jadilah pemain pertama yang menyusun empat bidak segaris.',
      category: 'strategy',
      sortOrder: 13,
      thumbnailUrl: '/images/game-empat-sejajar-3d.svg',
      embedUrl: '/games/empat-sejajar-3d.html',
      status: 'ACTIVE',
    },
  ]

  for (const g of games) {
    const game = await db.game.upsert({
      where: { slug: g.slug },
      update: {
        embedUrl: resolveGameEmbedUrl(g.slug, g.embedUrl ?? null),
        thumbnailUrl: g.thumbnailUrl ?? null,
        status: g.status,
      },
      create: {
        title: g.title,
        slug: g.slug,
        description: g.description,
        category: g.category,
        sortOrder: g.sortOrder,
        embedUrl: resolveGameEmbedUrl(g.slug, g.embedUrl ?? null),
        thumbnailUrl: g.thumbnailUrl ?? null,
        status: g.status,
      },
    })

    // 3 levels per game
    const levels = [
      { levelNumber: 1, name: `Level 1`, difficulty: 'EASY', targetScore: 100, timeLimitSec: 90, rewardPoints: 10 },
      { levelNumber: 2, name: `Level 2`, difficulty: 'MEDIUM', targetScore: 250, timeLimitSec: 75, rewardPoints: 25 },
      { levelNumber: 3, name: `Level 3`, difficulty: 'HARD', targetScore: 500, timeLimitSec: 60, rewardPoints: 50 },
    ]
    for (const lv of levels) {
      await db.gameLevel.upsert({
        where: { gameId_levelNumber: { gameId: game.id, levelNumber: lv.levelNumber } },
        update: {},
        create: { ...lv, gameId: game.id, name: `${g.title} ${lv.name}` },
      })
    }
  }

  console.log('Seed selesai: katalog game dan level telah disinkronkan.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
