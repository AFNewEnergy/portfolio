/**
 * In-memory fixed-window limiter (contact form, Notion image relay).
 *
 * Scope: one serverless instance. That is deliberate — it stops a single
 * client hammering the form without adding a Redis dependency for a site
 * that receives a handful of enquiries a week. If volume ever justifies it,
 * swap the Map for Upstash; the call site does not change.
 */
type Entry = { count: number; resetAt: number }

const buckets = new Map<string, Entry>()
const WINDOW_MS = 60 * 60 * 1000
const MAX = 5

export function rateLimit(
  key: string, max = MAX, windowMs = WINDOW_MS,
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const hit = buckets.get(key)

  if (!hit || now > hit.resetAt) {
    const fresh: Entry = { count: 1, resetAt: now + windowMs }
    buckets.set(key, fresh)
    // Opportunistic cleanup so the Map cannot grow without bound.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
    }
    return { ok: true, remaining: max - 1, resetAt: fresh.resetAt }
  }

  hit.count += 1
  return { ok: hit.count <= max, remaining: Math.max(0, max - hit.count), resetAt: hit.resetAt }
}

/** Wrong-secret attempts: after 10 in an hour from one address, even the right secret waits. */
const SECRET_TRIES = 10
export function secretLocked(ip: string): boolean {
  const hit = buckets.get(`secret:${ip}`)
  return Boolean(hit && Date.now() <= hit.resetAt && hit.count >= SECRET_TRIES)
}
export function secretFailed(ip: string): void {
  rateLimit(`secret:${ip}`, SECRET_TRIES, WINDOW_MS)
}

export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
