/**
 * In-memory fixed-window limiter for the contact route.
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

export function rateLimit(key: string): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const hit = buckets.get(key)

  if (!hit || now > hit.resetAt) {
    const fresh: Entry = { count: 1, resetAt: now + WINDOW_MS }
    buckets.set(key, fresh)
    // Opportunistic cleanup so the Map cannot grow without bound.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
    }
    return { ok: true, remaining: MAX - 1, resetAt: fresh.resetAt }
  }

  hit.count += 1
  return { ok: hit.count <= MAX, remaining: Math.max(0, MAX - hit.count), resetAt: hit.resetAt }
}

export function clientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
