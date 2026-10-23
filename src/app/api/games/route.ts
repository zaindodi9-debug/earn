import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { resolveGameEmbedUrl } from '@/lib/game-embeds'

const GAME_CATEGORIES = ['arcade', 'puzzle', 'card', 'sports', 'strategy'] as const
const GAME_STATUSES = ['DRAFT', 'ACTIVE', 'HIDDEN'] as const

function isSafeResourceUrl(value: string): boolean {
  if (value.startsWith('/')) return !value.startsWith('//') && !value.includes('\\')
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

/* GET /api/games — public: list active games (with levels) */
export async function GET(req: Request) {
  const me = await getUserFromRequest(req)
  const isAdmin = me?.role === 'ADMIN'
  const games = await db.game.findMany({
    where: isAdmin ? {} : { status: 'ACTIVE' },
    include: {
      levels: {
        where: isAdmin ? {} : { status: 'ACTIVE' },
        orderBy: { levelNumber: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({
    games: games.map((game) => ({
      ...game,
      embedUrl: resolveGameEmbedUrl(game.slug, game.embedUrl),
    })),
  })
}

/* POST /api/games — admin only: create game */
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

  const title = String(body.title || '').trim()
  if (!title || title.length > 120) {
    return NextResponse.json({ error: 'Judul wajib diisi dan maksimal 120 karakter.' }, { status: 400 })
  }

  const slug = String(body.slug || '').trim() || slugify(title)
  if (slug.length > 60 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.' }, { status: 400 })
  }
  const category = String(body.category || 'arcade')
  const status = String(body.status || 'DRAFT')
  const description = body.description === undefined || body.description === null ? null : String(body.description).trim()
  const thumbnailUrl = body.thumbnailUrl === undefined || body.thumbnailUrl === null ? null : String(body.thumbnailUrl).trim()
  const embedUrl = body.embedUrl === undefined || body.embedUrl === null ? null : String(body.embedUrl).trim()
  const sortOrder = body.sortOrder === undefined ? 0 : Number(body.sortOrder)

  if (!(GAME_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: 'Kategori game tidak valid.' }, { status: 400 })
  }
  if (!(GAME_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Status game tidak valid.' }, { status: 400 })
  }
  if (description && description.length > 2000) {
    return NextResponse.json({ error: 'Deskripsi maksimal 2000 karakter.' }, { status: 400 })
  }
  if (thumbnailUrl && (thumbnailUrl.length > 2048 || !isSafeResourceUrl(thumbnailUrl))) {
    return NextResponse.json({ error: 'URL thumbnail harus berupa path lokal atau URL HTTPS.' }, { status: 400 })
  }
  if (embedUrl && (embedUrl.length > 2048 || !isSafeResourceUrl(embedUrl))) {
    return NextResponse.json({ error: 'URL embed harus berupa path lokal atau URL HTTPS.' }, { status: 400 })
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) {
    return NextResponse.json({ error: 'Urutan harus bilangan bulat antara 0 dan 100000.' }, { status: 400 })
  }

  const existing = await db.game.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Slug sudah dipakai' }, { status: 409 })

  const game = await db.game.create({
    data: {
      title,
      slug,
      description,
      category,
      thumbnailUrl: thumbnailUrl || null,
      embedUrl: embedUrl || null,
      status,
      sortOrder,
    },
    include: { levels: true },
  })
  return NextResponse.json({ game }, { status: 201 })
}
