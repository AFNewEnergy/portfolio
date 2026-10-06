import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/jsonld'
import { formatDay } from '@/lib/format'
import { content } from '@/content'
import { PageTop } from '@/components/sections/SectionHead'
import { InsightsIndex, type Card } from '@/components/insights/InsightsIndex'
import { CtaBand } from '@/components/sections/CtaBand'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 60
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.insights' })
  return buildMetadata({ locale, path: '/insights', title: t('title'), description: t('description') })
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const posts = await (await content()).getInsights(locale)

  const cards: Card[] = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    topic: p.topic,
    video: p.type === 'Video',
    cover: p.cover,
    date: formatDay(p.date, locale),
    len: !p.readingMinutes ? '' : p.type === 'Video' ? t('insights.watch', { minutes: p.readingMinutes }) : t('insights.read', { minutes: p.readingMinutes }),
  }))

  return (
    <>
      <PageTop title={t.rich('insights.pageTitle', { em: c => <em>{c}</em> })} lede={t('insights.pageLede')} />
      <section className="ins-section">
        <div className="shell">
          {cards.length
            ? <InsightsIndex cards={cards} author={{ name: site.name }} />
            : <p className="notice mt-12">{t('insights.empty')}</p>}
        </div>
      </section>
      <CtaBand locale={locale} />
      <JsonLd data={breadcrumbSchema(locale, [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.insights'), path: '/insights' },
      ])} />
    </>
  )
}
