import { site } from '@/config/site'
import { absUrl } from '@/lib/seo'
import { content } from '@/content'

/** RSS for the English articles, so readers and aggregators pick up new Notion posts. */
export const revalidate = 3600

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const rfc822 = (d: string | null) => (d ? new Date(d.length === 10 ? `${d}T09:00:00+06:00` : d).toUTCString() : '')

export async function GET() {
  const posts = (await (await content()).getInsights('en')).filter(p => p.lang === 'en').slice(0, 30)
  const self = `${site.url}/feed.xml`
  const items = posts.map(p => {
    const url = absUrl('en', `/insights/${p.slug}`)
    return [
      '<item>',
      `<title>${esc(p.title)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      p.date ? `<pubDate>${rfc822(p.date)}</pubDate>` : '',
      `<dc:creator>${esc(site.name)}</dc:creator>`,
      p.topic ? `<category>${esc(p.topic)}</category>` : '',
      `<description>${esc(p.excerpt)}</description>`,
      '</item>',
    ].filter(Boolean).join('')
  })
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${esc(`${site.company.name} Insights`)}</title>
<link>${absUrl('en', '/insights')}</link>
<atom:link href="${self}" rel="self" type="application/rss+xml"/>
<description>${esc(`Notes on Bangladesh’s power sector by ${site.name}.`)}</description>
<language>en</language>
${posts[0]?.date ? `<lastBuildDate>${rfc822(posts[0].updated ?? posts[0].date)}</lastBuildDate>` : ''}
${items.join('\n')}
</channel>
</rss>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
