import type { Insight } from '../types'
import { SAMPLE_ARTICLES } from '../samples/articles'
import { toReadShape } from '../samples/dsl'
import { renderArticle } from '../notion/render'
import { splitCredit, readingMinutes } from '../shared'

/**
 * The sample articles, rendered through the same Notion renderer the live
 * articles use. This is what the site shows until the Insights database
 * exists in Notion — and exactly what the setup route copies there.
 */
export const insights: Insight[] = SAMPLE_ARTICLES.filter(a => a.published).map((a, i) => {
  const edited = `${a.date}T09:00:00.000Z`
  const r = renderArticle(toReadShape(a.blocks, `local-${i}-`, edited))
  const [coverCaption, coverCredit] = splitCredit(a.coverCaption)
  return {
    id: `local-${a.slug}`,
    slug: a.slug,
    lang: 'en',
    title: a.title,
    excerpt: a.subtitle,
    topic: a.topic,
    type: 'Article',
    videoUrl: null,
    cover: a.cover,
    coverCaption,
    coverCredit,
    tags: a.tags,
    date: a.date,
    updated: null,
    readingMinutes: readingMinutes(r.words),
    notionUrl: null,
    body: r.html,
    toc: r.toc,
    references: r.references,
  }
})
