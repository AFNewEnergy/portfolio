import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/jsonld'
import { content } from '@/content'
import { PageTop } from '@/components/sections/SectionHead'
import { PostList } from '@/components/sections/PostList'
import { CtaBand } from '@/components/sections/CtaBand'
import { JsonLd } from '@/components/seo/JsonLd'

export const revalidate = 300
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

  return (
    <>
      <PageTop title={t.rich('insights.pageTitle', { em: c => <em>{c}</em> })} lede={t('insights.pageLede')} />
      <section className="section">
        <div className="shell">
          {posts.length ? <PostList locale={locale} posts={posts} /> : <p className="notice">{t('insights.empty')}</p>}
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
