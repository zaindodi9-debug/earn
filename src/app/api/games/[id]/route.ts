import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

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

  const data: any = {}
  for (const k of ['title', 'description', 'category', 'thumbnailUrl', 'embedUrl', 'status', 'sortOrder', 'slug']) {
    if (body[k] !== undefined) {
      if (k === 'sortOrder') data[k] = Number(body[k]) || 0
      else data[k] = body[k] === '' ? null : String(body[k])
    }
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
