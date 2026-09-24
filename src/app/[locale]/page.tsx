import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { content } from '@/content'
import { Link } from '@/i18n/navigation'
import { Hero } from '@/components/sections/Hero'
import { Figures } from '@/components/sections/Figures'
import { SectionHead } from '@/components/sections/SectionHead'
import { Plates } from '@/components/sections/Plates'
import { Register } from '@/components/sections/Register'
import { PartnerGrid } from '@/components/sections/PartnerGrid'
import { Portfolio } from '@/components/sections/Portfolio'
import { PostList } from '@/components/sections/PostList'
import { CtaBand } from '@/components/sections/CtaBand'
import { Reveal } from '@/components/primitives/Reveal'
import { Rail } from '@/components/primitives/Rail'
import { Icon } from '@/components/primitives/Icon'

export const revalidate = 300
const FEATURED_COUNT = 6

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.home' })
  return buildMetadata({ locale, path: '/', title: t('title'), description: t('description') })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const src = await content()
  const [projects, posts] = await Promise.all([
    src.getProjects(locale),
    src.getInsights(locale, { limit: 3 }),
  ])
  const featured = projects.slice(0, FEATURED_COUNT)
  const t = await getTranslations({ locale })

  return (
    <>
      <Hero locale={locale} />
      <Figures locale={locale} />

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow={t('home.sections.capability')}
            title={t.rich('capabilities.title', { em: c => <em>{c}</em> })}
            lede={t('capabilities.lede')}
          />
          <Plates locale={locale} />
        </div>
      </section>

      <section className="section-tight">
        <div className="shell">
          <SectionHead
            eyebrow={t('home.sections.register')}
            title={t.rich('register.title', { em: c => <em>{c}</em> })}
            lede={t('register.lede')}
          />
          <Register locale={locale} projects={featured} />
          <Reveal className="reg-foot">
            <span className="t-mono" style={{ color: 'var(--ink-3)' }}>
              {t('register.showing', { shown: featured.length, total: projects.length })}
            </span>
            <Link href="/projects" className="link-accent">
              {t('register.openFull')}<Icon name="arrow" strokeWidth={1.6} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section-tight">
        <div className="shell">
          <Reveal className="mb-7"><Rail>{t('home.sections.partners')}</Rail></Reveal>
          <PartnerGrid />
        </div>
      </section>

      <section className="section-tight">
        <div className="shell">
          <SectionHead
            eyebrow={t('home.sections.portfolio')}
            title={t.rich('portfolio.title', { em: c => <em>{c}</em> })}
            lede={t('portfolio.lede')}
          />
          <Portfolio locale={locale} projects={projects} />
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section-tight">
          <div className="shell">
            <SectionHead
              eyebrow={t('home.sections.insights')}
              title={t.rich('insights.title', { em: c => <em>{c}</em> })}
              lede={t('insights.lede')}
            />
            <PostList locale={locale} posts={posts} />
          </div>
        </section>
      )}

      <CtaBand locale={locale} />
    </>
  )
}
