import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

const GAME_CATEGORIES = ['arcade', 'puzzle', 'card', 'sports', 'strategy'] as const
const GAME_STATUSES = ['DRAFT', 'ACTIVE', 'HIDDEN'] as const

function isSafeResourceUrl(value: string): boolean {
  if (value.startsWith('/')) return !value.startsWith('//') && !value.includes('\\')
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

/* PATCH /api/games/[id] — admin only */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  const { id } = await params
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body harus berupa objek JSON' }, { status: 400 })
  }

  const data: any = {}
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 120) {
      return NextResponse.json({ error: 'Judul wajib diisi dan maksimal 120 karakter.' }, { status: 400 })
    }
    data.title = body.title.trim()
  }
  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string' || body.slug.length > 60 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
      return NextResponse.json({ error: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.' }, { status: 400 })
    }
    data.slug = body.slug
  }
  if (body.description !== undefined) {
    if (body.description !== null && (typeof body.description !== 'string' || body.description.length > 2000)) {
      return NextResponse.json({ error: 'Deskripsi maksimal 2000 karakter.' }, { status: 400 })
    }
    data.description = typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null
  }
  if (body.category !== undefined) {
    if (!(GAME_CATEGORIES as readonly unknown[]).includes(body.category)) {
      return NextResponse.json({ error: 'Kategori game tidak valid.' }, { status: 400 })
    }
    data.category = body.category
  }
  if (body.status !== undefined) {
    if (!(GAME_STATUSES as readonly unknown[]).includes(body.status)) {
      return NextResponse.json({ error: 'Status game tidak valid.' }, { status: 400 })
    }
    data.status = body.status
  }
  for (const key of ['thumbnailUrl', 'embedUrl'] as const) {
    if (body[key] === undefined) continue
    if (body[key] !== null && typeof body[key] !== 'string') {
      return NextResponse.json({ error: `${key} harus berupa string URL.` }, { status: 400 })
    }
    const value = typeof body[key] === 'string' ? body[key].trim() : ''
    if (value && (value.length > 2048 || !isSafeResourceUrl(value))) {
      return NextResponse.json({ error: `${key} harus berupa path lokal atau URL HTTPS.` }, { status: 400 })
    }
    data[key] = value || null
  }
  if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder)
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) {
      return NextResponse.json({ error: 'Urutan harus bilangan bulat antara 0 dan 100000.' }, { status: 400 })
    }
    data.sortOrder = sortOrder
  }

  if (data.slug) {
    const conflict = await db.game.findUnique({ where: { slug: data.slug } })
    if (conflict && conflict.id !== id) {
      return NextResponse.json({ error: 'Slug sudah dipakai' }, { status: 409 })
    }
  }

  const game = await db.game.update({ where: { id }, data, include: { levels: true } })
  return NextResponse.json({ game })
}

/* DELETE /api/games/[id] — admin only */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getUserFromRequest(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 })
  }
  const { id } = await params
  await db.game.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
