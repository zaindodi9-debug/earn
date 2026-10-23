import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { resolveGameEmbedUrl } from '@/lib/game-embeds'

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
  const title = String(body.title || '').trim()
  if (!title) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })

  const slug = String(body.slug || '').trim() || slugify(title)
  const existing = await db.game.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Slug sudah dipakai' }, { status: 409 })

  const game = await db.game.create({
    data: {
      title,
      slug,
      description: String(body.description || '').trim() || null,
      category: String(body.category || 'arcade'),
      thumbnailUrl: String(body.thumbnailUrl || '').trim() || null,
      embedUrl: String(body.embedUrl || '').trim() || null,
      status: String(body.status || 'DRAFT'),
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    },
    include: { levels: true },
  })
  return NextResponse.json({ game }, { status: 201 })
}
