import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { articleSchema, breadcrumbSchema } from '@/lib/jsonld'
import { content } from '@/content'
import { formatDate } from '@/lib/format'
import { Link } from '@/i18n/navigation'
import { CtaBand } from '@/components/sections/CtaBand'
import { Reveal } from '@/components/primitives/Reveal'
import { Icon } from '@/components/primitives/Icon'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300
export const dynamicParams = true

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  const src = await content()
  const out: Array<{ locale: string; slug: string }> = []
  for (const locale of routing.locales) {
    for (const p of await src.getInsights(locale)) out.push({ locale, slug: p.slug })
  }
  return out
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await (await content()).getInsight(locale, slug)
  if (!post) return {}
  return buildMetadata({
    locale, path: `/insights/${slug}`,
    title: post.title, description: post.excerpt, type: 'article',
    ...(post.date ? { publishedTime: post.date } : {}),
    ...(post.cover ? { image: post.cover } : {}),
  })
}

export default async function InsightPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await (await content()).getInsight(locale, slug)
  if (!post) notFound()
  const t = await getTranslations({ locale })

  return (
    <>
      <article>
        <div className="border-b border-[var(--line)] pb-[clamp(30px,5vw,56px)] pt-[clamp(36px,6vw,72px)]">
          <div className="shell">
            <Reveal>
              <Link href="/insights" className="t-mono inline-flex items-center gap-2" style={{ color: 'var(--ink-3)' }}>
                <Icon name="arrow" strokeWidth={1.6} className="h-3 w-3 rotate-180 rtl:rotate-0" />
                {t('insights.backToIndex')}
              </Link>
            </Reveal>
            <Reveal as="h1" className="t-hero mt-6 max-w-[22ch]" delay={40}>{post.title}</Reveal>
            <Reveal className="t-mono mt-6 flex flex-wrap gap-x-5 gap-y-2" style={{ color: 'var(--ink-3)' }} delay={80}>
              <span>{t(`insights.type.${post.type}`)}</span>
              {post.date && <time dateTime={post.date}>{formatDate(post.date, locale)}</time>}
              <span>
                {post.type === 'Video'
                  ? t('insights.watch', { minutes: post.readingMinutes })
                  : t('insights.read', { minutes: post.readingMinutes })}
              </span>
            </Reveal>
          </div>
        </div>

        <section className="py-[clamp(40px,6vw,80px)]">
          <div className="shell">
            {post.type === 'Video' && post.videoUrl && (
              /* Facade: no third-party iframe until the visitor asks for it —
                 keeps LCP fast and loads no tracking on page view. */
              <Reveal className="mb-10 aspect-video border border-[var(--line-strong)] bg-[var(--surface)]">
                <a href={post.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="t-mono grid h-full w-full place-items-center transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--ink-3)' }}>
                  {t('insights.playVideo')}
                </a>
              </Reveal>
            )}
            <Reveal className="prose">
              <div dangerouslySetInnerHTML={{ __html: post.body }} />
            </Reveal>
            {post.tags.length > 0 && (
              <Reveal className="chips mt-10">{post.tags.map(tag => <span key={tag}>{tag}</span>)}</Reveal>
            )}
          </div>
        </section>
      </article>

      <CtaBand locale={locale} />
      <JsonLd data={[
        articleSchema(locale, post),
        breadcrumbSchema(locale, [
          { name: t('nav.home'), path: '/' },
          { name: t('nav.insights'), path: '/insights' },
          { name: post.title, path: `/insights/${slug}` },
        ]),
      ]} />
    </>
  )
}
