/**
 * "Solar on government land: what the 2026 PPP guideline changes"
 *   → "solar-on-government-land-what-the-2026-ppp-guideline-changes"
 *
 * Accents are folded (é → e). Scripts with no Latin form (Bangla, Arabic,
 * Chinese) come out empty — callers fall back to an id.
 */
export function slugify(text: string, max = 72): string {
  const s = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const at = cut.lastIndexOf('-')
  return at > 24 ? cut.slice(0, at) : cut
}

/** Notion ids arrive with and without dashes — compare them without. */
export const bareId = (id: string) => id.replace(/-/g, '').toLowerCase()
