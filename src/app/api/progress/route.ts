import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

/* GET /api/progress — current user's progress across all levels */
export async function GET(req: Request) {
  const me = await getUserFromRequest(req)
  if (!me) return NextResponse.json({ error: 'Wajib login' }, { status: 401 })

  const progress = await db.userProgress.findMany({
    where: { userId: me.id },
    include: { gameLevel: { include: { game: true } } },
  })
  return NextResponse.json({ progress })
}

/* POST /api/progress — disabled until server-verifiable game results are implemented.
 * Client-submitted scores (including iframe postMessage and demo/manual scores)
 * are not proof of gameplay and must not award points.
 */
export async function POST(req: Request) {
  const me = await getUserFromRequest(req)
  if (!me) {
    return NextResponse.json({ error: 'Wajib login' }, { status: 401 })
  }

  return NextResponse.json(
    {
      error:
        'Pengiriman skor dan hadiah poin sementara dinonaktifkan sampai hasil permainan dapat diverifikasi oleh server.',
    },
    { status: 503 }
  )
}
