/** "Site visit, Rangunia | Photo: AF New Energy" → ["Site visit, Rangunia", "Photo: AF New Energy"] */
export function splitCredit(caption: string): [string | null, string | null] {
  const s = caption.trim()
  if (!s) return [null, null]
  const at = s.lastIndexOf(' | ')
  if (at < 0) return [s, null]
  return [s.slice(0, at).trim() || null, s.slice(at + 3).trim() || null]
}

/** About 200 words a minute, rounded up, never less than one. */
export const readingMinutes = (words: number) => Math.max(1, Math.ceil(words / 200))
