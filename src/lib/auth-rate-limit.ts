import crypto from 'node:crypto'
import { db } from '@/lib/db'

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds?: number
}

/** Use platform-populated IP headers; do not trust a client-supplied x-forwarded-for chain. */
export function getClientIp(req: Request): string {
  const vercelForwarded = req.headers.get('x-vercel-forwarded-for')
  if (vercelForwarded?.trim()) return vercelForwarded.split(',').at(-1)!.trim()

  const realIp = req.headers.get('x-real-ip')
  if (realIp?.trim()) return realIp.trim()

  // Do not fall back to x-forwarded-for: clients can sometimes inject its first entry.
  return 'unknown'
}

function rateLimitKey(scope: string, identity: string): string {
  return crypto.createHash('sha256').update(`${scope}:${identity.toLowerCase()}`).digest('hex')
}

/**
 * Counts authentication attempts atomically. PostgreSQL advisory locks prevent concurrent
 * requests from reading and overwriting the same counter.
 */
export async function consumeAuthAttempt(
  scope: string,
  identity: string,
  maxAttempts: number,
  windowMs: number,
  blockMs: number
): Promise<RateLimitResult> {
  const key = rateLimitKey(scope, identity)
  const now = new Date()

  const result = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key})::bigint)`

    const existing = await tx.authRateLimit.findUnique({ where: { key } })
    if (existing?.blockedUntil && existing.blockedUntil > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.blockedUntil.getTime() - now.getTime()) / 1000)),
      }
    }

    if (!existing) {
      await tx.authRateLimit.create({
        data: { key, attempts: 1, windowStartedAt: now },
      })
      return { allowed: true }
    }

    const windowExpired = existing.windowStartedAt.getTime() + windowMs <= now.getTime()
    const attempts = windowExpired ? 1 : existing.attempts + 1
    const blockedUntil = attempts >= maxAttempts ? new Date(now.getTime() + blockMs) : null

    await tx.authRateLimit.update({
      where: { key },
      data: {
        attempts,
        windowStartedAt: windowExpired ? now : existing.windowStartedAt,
        blockedUntil,
      },
    })

    return { allowed: true }
  }, { maxWait: 5_000, timeout: 10_000 })

  // Opportunistically remove stale hash-only counters.
  if (crypto.randomInt(0, 100) === 0) {
    await db.authRateLimit.deleteMany({
      where: { updatedAt: { lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) } },
    })
  }

  return result
}

export async function clearAuthAttempts(scope: string, identity: string): Promise<void> {
  const key = rateLimitKey(scope, identity)
  await db.authRateLimit.deleteMany({ where: { key } })
}
