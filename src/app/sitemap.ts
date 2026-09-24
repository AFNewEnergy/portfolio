import type { MetadataRoute } from 'next'
import { LOCALES, LOCALE_TAGS, DEFAULT_LOCALE, NAV_PATH, NAV } from '@/config/site'
import { absUrl } from '@/lib/seo'
import { content } from '@/content'

/**
 * Every static page and every content page, in every locale, each carrying
 * the full set of hreflang alternates Google expects.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const src = await content()
  const entries: MetadataRoute.Sitemap = []

  const alt = (path: string) => {
    const languages: Record<string, string> = {}
    for (const l of LOCALES) languages[LOCALE_TAGS[l]] = absUrl(l, path)
    languages['x-default'] = absUrl(DEFAULT_LOCALE, path)
    return languages
  }

  const add = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) => {
    for (const locale of LOCALES) {
      entries.push({
        url: absUrl(locale, path),
        lastModified: new Date(),
        changeFrequency,
        priority: locale === DEFAULT_LOCALE ? priority : priority * 0.9,
        alternates: { languages: alt(path) },
      })
    }
  }

  for (const key of NAV) {
    const path = NAV_PATH[key]
    add(path, path === '/' ? 1 : path === '/contact' ? 0.7 : 0.8, path === '/' ? 'weekly' : 'monthly')
  }

  const [projects, insights] = await Promise.all([
    src.getProjects(DEFAULT_LOCALE),
    src.getInsights(DEFAULT_LOCALE),
  ])
  for (const p of projects) add(`/projects/${p.slug}`, 0.6, 'monthly')
  for (const p of insights) add(`/insights/${p.slug}`, 0.6, 'monthly')

  return entries
}
