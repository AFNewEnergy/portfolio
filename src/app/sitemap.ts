import type { MetadataRoute } from 'next'
import { LOCALES, LOCALE_TAGS, DEFAULT_LOCALE, NAV_PATH, NAV, type Locale } from '@/config/site'
import { absUrl } from '@/lib/seo'
import { absImage } from '@/lib/jsonld'
import { content } from '@/content'
import type { Insight } from '@/content/types'

/** Rebuilt hourly, so articles published in Notion reach search engines without a redeploy. */
export const revalidate = 3600

/**
 * Every static page and every content page, each with the hreflang alternates Google expects.
 * Articles are listed only in the languages they are written in, with their real dates, because
 * the other language versions of an article page name the original as canonical.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const src = await content()
  const entries: MetadataRoute.Sitemap = []

  const alt = (path: string, langs: readonly Locale[] = LOCALES) => {
    const languages: Record<string, string> = {}
    for (const l of langs) languages[LOCALE_TAGS[l]] = absUrl(l, path)
    languages['x-default'] = absUrl(langs.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : langs[0]!, path)
    return languages
  }

  type Freq = MetadataRoute.Sitemap[number]['changeFrequency']
  const add = (path: string, priority: number, changeFrequency: Freq, extra: { langs?: readonly Locale[]; lastModified?: string; images?: string[] } = {}) => {
    const langs = extra.langs ?? LOCALES
    for (const locale of langs) {
      entries.push({
        url: absUrl(locale, path),
        ...(extra.lastModified ? { lastModified: extra.lastModified } : {}),
        changeFrequency,
        priority: locale === DEFAULT_LOCALE ? priority : Math.round(priority * 90) / 100,
        alternates: { languages: alt(path, langs) },
        ...(extra.images?.length ? { images: extra.images } : {}),
      })
    }
  }

  // Articles per language, keyed by slug, keeping only the ones written in that language.
  const byLocale = await Promise.all(LOCALES.map(async l => [l, await src.getInsights(l)] as const))
  const written = new Map<string, Map<Locale, Insight>>()
  for (const [l, posts] of byLocale) {
    for (const p of posts) {
      if (p.lang !== l) continue
      const e = written.get(p.slug) ?? new Map<Locale, Insight>()
      e.set(l, p)
      written.set(p.slug, e)
    }
  }
  const stamp = (p: Insight) => p.updated ?? p.date ?? undefined
  const newest = [...written.values()].flatMap(e => [...e.values()]).map(stamp).filter(Boolean).sort().pop()

  for (const key of NAV) {
    const path = NAV_PATH[key]
    const fresh = path === '/' || path === '/insights' ? newest : undefined
    add(path, path === '/' ? 1 : path === '/contact' ? 0.7 : 0.8, path === '/' || path === '/insights' ? 'weekly' : 'monthly',
      fresh ? { lastModified: fresh } : {})
  }

  for (const p of await src.getProjects(DEFAULT_LOCALE)) add(`/projects/${p.slug}`, 0.6, 'monthly')
  // One entry per language the article is written in, each with that version's own date and cover.
  for (const [slug, versions] of written) {
    const langs = [...versions.keys()]
    for (const [l, post] of versions) {
      const image = absImage(post.cover)
      const lastModified = stamp(post)
      entries.push({
        url: absUrl(l, `/insights/${slug}`),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly',
        priority: l === DEFAULT_LOCALE ? 0.7 : 0.63,
        alternates: { languages: alt(`/insights/${slug}`, langs) },
        ...(image ? { images: [image] } : {}),
      })
    }
  }

  return entries
}
