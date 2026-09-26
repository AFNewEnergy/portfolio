import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { site, isRtl, LOCALES, type Locale } from '@/config/site'
import { absUrl, buildMetadata } from '@/lib/seo'
import { absImage, articleSchema, breadcrumbSchema } from '@/lib/jsonld'
import { content, type Insight } from '@/content'
import { formatDay } from '@/lib/format'
import { imgAttrs } from '@/lib/img'
import { Link } from '@/i18n/navigation'
import { Icon } from '@/components/primitives/Icon'
import { JsonLd } from '@/components/seo/JsonLd'
import { ArticleToc, ReferenceTabs, ShareBar, VideoFacade } from '@/components/insights/ArticleParts'
import { videoEmbedUrl } from '@/content/notion/render'

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
  const src = await content()
  const post = await src.getInsight(locale, slug)
  if (!post) return {}
  const image = absImage(post.cover)
  // Only the languages the article is really written in are alternates. Elsewhere the site shows the
  // original with translated navigation, so that page names the original as canonical rather than
  // competing with it as a duplicate.
  const written = (await Promise.all(LOCALES.map(async l => {
    const p = l === locale ? post : await src.getInsight(l, post.slug).catch(() => null)
    return p && p.lang === l && p.slug === post.slug ? l : null
  }))).filter((l): l is Locale => l !== null)
  const own = LOCALES.includes(post.lang as Locale) ? (post.lang as Locale) : 'en'
  return buildMetadata({
    locale, path: `/insights/${post.slug}`,
    title: post.title, description: post.excerpt, type: 'article',
    ...(post.date ? { publishedTime: post.date } : {}),
    ...(post.updated ? { modifiedTime: post.updated } : {}),
    ...(post.topic ? { section: post.topic } : {}),
    tags: post.tags,
    ...(image ? { image, imageAlt: post.coverCaption ?? post.title } : {}),
    ...(written.length ? { languages: written } : {}),
    ...(post.lang !== locale ? { canonicalLocale: own } : {}),
  })
}

/** "Abdullah Bin Hossain" → "Hossain, A. B." */
function citeName(name: string) {
  const parts = name.trim().split(/\s+/)
  const last = parts.pop() ?? name
  return `${last}, ${parts.map(p => `${p[0]}.`).join(' ')}`
}

function citation(post: Insight, locale: Locale) {
  const d = post.date ? new Date(`${post.date}T12:00:00Z`) : null
  const when = d
    ? `${d.getUTCFullYear()}, ${new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(d)} ${d.getUTCDate()}`
    : 'n.d.'
  const url = absUrl(locale, `/insights/${post.slug}`).replace(/^https?:\/\//, '')
  return `${citeName(site.name)} (${when}). ${post.title}. ${url}`
}

/** "Updated" is only worth showing for a real revision, not a same-day typo fix. */
function wasUpdated(post: Insight) {
  if (!post.updated || !post.date) return false
  return new Date(post.updated).getTime() - new Date(`${post.date}T23:59:59Z`).getTime() > 0
}

export default async function InsightPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const src = await content()
  const post = await src.getInsight(locale, slug)
  if (!post) notFound()
  if (post.slug !== decodeURIComponent(slug)) permanentRedirect(`/${locale}/insights/${post.slug}`)

  const t = await getTranslations({ locale })
  const ta = await getTranslations({ locale, namespace: 'insights.article' })
  const url = absUrl(locale, `/insights/${post.slug}`)
  const minutes = !post.readingMinutes ? '' : post.type === 'Video' ? t('insights.watch', { minutes: post.readingMinutes }) : t('insights.read', { minutes: post.readingMinutes })
  const updated = wasUpdated(post)
  const embed = post.type === 'Video' ? videoEmbedUrl(post.videoUrl) : null
  const dir = isRtl(post.lang as Locale) ? 'rtl' : 'ltr'

  const toc = post.references.length
    ? [...post.toc, { id: 'references', n: '', label: ta('references') }]
    : post.toc
  const tocMeta = [minutes, post.references.length ? ta('refCount', { count: post.references.length }) : ''].filter(Boolean).join(' · ')

  // "Continue reading" is a nice-to-have: if the list cannot be read, the article still shows.
  const all = await src.getInsights(locale).catch(() => [] as Insight[])
  const others = all.filter(p => p.slug !== post.slug)
  const more = [...others.filter(p => p.topic && p.topic === post.topic), ...others.filter(p => !p.topic || p.topic !== post.topic)].slice(0, 3)

  return (
    <>
      {/* The article reads in its own direction: an English article on the Arabic site is laid out left to right. */}
      <article className="art" dir={dir}>
        <header className="shell art-head">
          <Link href="/insights" className="art-back t-mono">
            <Icon name="arrow" strokeWidth={1.6} className="flip" />{t('insights.backToIndex')}
          </Link>
          <div className="art-kicker t-mono">
            {post.topic && <span className="ins-topic">{post.topic}</span>}
            <span>{t(`insights.type.${post.type}`)}</span>
            {post.tags.length > 0 && <span>{post.tags.slice(0, 3).join(' · ')}</span>}
          </div>
          <h1 className="art-title" lang={post.lang} dir={dir}>{post.title}</h1>
          {post.excerpt && <p className="art-dek" lang={post.lang} dir={dir}>{post.excerpt}</p>}

          <div className="art-byline">
            <div className="art-by">
              <div className="art-author">
                <img {...imgAttrs(site.photos.hero.src, '48px')} alt="" className="ins-avatar" />
                <span>
                  <span className="art-name">{site.name}</span>
                  <span className="art-role">{ta('authorRole')}</span>
                </span>
              </div>
              <dl className="art-facts">
                {post.date && <div><dt className="t-mono">{ta('published')}</dt><dd><time dateTime={post.date}>{formatDay(post.date, locale)}</time></dd></div>}
                {updated && <div><dt className="t-mono">{ta('updated')}</dt><dd><time dateTime={post.updated!}>{formatDay(post.updated, locale)}</time></dd></div>}
                {minutes && <div><dt className="t-mono">{ta('readingTime')}</dt><dd>{minutes}</dd></div>}
              </dl>
            </div>
            <ShareBar url={url} title={post.title} notionUrl={post.notionUrl} />
          </div>
        </header>

        {embed ? (
          <div className="shell art-cover"><VideoFacade embed={embed} cover={post.cover} title={post.title} /></div>
        ) : post.cover && (
          <figure className="shell art-cover">
            <div className="fig-frame">
              <img {...imgAttrs(post.cover, '(max-width: 1440px) 94vw, 1320px')} alt={post.coverCaption ?? post.title} fetchPriority="high" />
            </div>
            {(post.coverCaption || post.coverCredit) && (
              <figcaption className="fig-cap" lang={post.lang} dir={dir}>
                <span>{post.coverCaption}</span>
                {post.coverCredit && <span className="fig-credit">{post.coverCredit}</span>}
              </figcaption>
            )}
          </figure>
        )}

        {post.type === 'Video' && post.videoUrl && !embed && (
          <p className="shell art-watch">
            <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className="link-accent">
              {t('insights.watchVideo')}<Icon name="external" />
            </a>
          </p>
        )}

        <div className="shell art-layout" dir={dir}>
          <aside className="art-side">
            {toc.length > 1
              ? <ArticleToc items={toc} meta={tocMeta} variant="side" />
              : <p className="t-mono toc-meta toc-meta--solo">{tocMeta}</p>}
          </aside>
          <div className="art-main">
            {toc.length > 1 && <ArticleToc items={toc} variant="fold" />}
            <div className="article-body" lang={post.lang} dir={dir} dangerouslySetInnerHTML={{ __html: post.body }} />

            {post.references.length > 0 && (
              <div lang={post.lang} dir={dir}><ReferenceTabs refs={post.references} citation={citation(post, locale)} /></div>
            )}

            {post.tags.length > 0 && (
              <ul className="art-tags" aria-label={ta('tags')}>
                {[post.topic, ...post.tags].filter((x, i, a): x is string => Boolean(x) && a.indexOf(x) === i).map(tag => <li key={tag}>{tag}</li>)}
              </ul>
            )}

            <div className="art-edited">
              <span className="t-mono">
                {post.notionUrl || post.updated
                  ? ta('lastEdited', { date: formatDay(post.updated ?? post.date, locale) })
                  : ta('published') + ' · ' + formatDay(post.date, locale)}
              </span>
              {post.notionUrl && (
                <a href={post.notionUrl} target="_blank" rel="noopener noreferrer" className="link-accent">
                  {ta('readOriginal')}<Icon name="external" />
                </a>
              )}
            </div>

            <section className="author-card" aria-label={ta('aboutAuthor')}>
              <img {...imgAttrs(site.photos.hero.src, '120px')} alt={site.name} loading="lazy" />
              <div>
                <span className="t-mono author-eyebrow">{ta('aboutAuthor')}</span>
                <p className="author-name">{site.name}</p>
                <p className="author-bio">{ta('authorBio', { years: site.stats.years })}</p>
                <div className="btn-row">
                  <Link href="/contact" className="btn btn--primary"><span>{ta('book')}</span><Icon name="arrow" strokeWidth={1.6} /></Link>
                  <Link href="/insights" className="btn btn--ghost"><span>{ta('more')}</span></Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="shell art-more" aria-labelledby="more-head">
          <div className="rail t-mono"><span className="rail-tick" aria-hidden="true" /><span id="more-head">{ta('continueReading')}</span></div>
          <div className="ins-grid">
            {more.map(p => (
              <Link key={p.slug} href={`/insights/${p.slug}`} className="ins-card">
                <div className="ins-media" style={{ aspectRatio: '3 / 2' }}>
                  {p.cover
                    ? <img {...imgAttrs(p.cover, '(max-width: 720px) 92vw, 400px')} alt="" loading="lazy" decoding="async" />
                    : <span className="ins-media-blank" aria-hidden="true"><span className="t-mono">{p.topic}</span></span>}
                </div>
                {p.topic && <span className="ins-topic t-mono">{p.topic}</span>}
                <h3 className="ins-card-title" dir="auto">{p.title}</h3>
                <span className="ins-meta t-mono">
                  {[formatDay(p.date, locale), !p.readingMinutes ? '' : p.type === 'Video' ? t('insights.watch', { minutes: p.readingMinutes }) : t('insights.read', { minutes: p.readingMinutes })].filter(Boolean).join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <JsonLd data={[
        articleSchema(locale, post),
        breadcrumbSchema(locale, [
          { name: t('nav.home'), path: '/' },
          { name: t('nav.insights'), path: '/insights' },
          { name: post.title, path: `/insights/${post.slug}` },
        ]),
      ]} />
    </>
  )
}
