import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/jsonld'
import { content } from '@/content'
import { PageTop } from '@/components/sections/SectionHead'
import { Register } from '@/components/sections/Register'
import { CtaBand } from '@/components/sections/CtaBand'
import { Reveal } from '@/components/primitives/Reveal'
import { JsonLd } from '@/components/seo/JsonLd'
import { Figure } from '@/components/primitives/Figure'
import { site } from '@/config/site'

export const revalidate = 300
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.projects' })
  return buildMetadata({ locale, path: '/projects', title: t('title'), description: t('description') })
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const projects = await (await content()).getProjects(locale)

  return (
    <>
      <PageTop title={t.rich('projects.title', { em: c => <em>{c}</em> })} lede={t('projects.lede')} />

      <section className="section">
        <div className="shell">
          <Register locale={locale} projects={projects} />
          {/* The photo sits inside the shell, not full-bleed: the source is
              763px wide, so a full-width strip would visibly upscale it. */}
          <div className="intro-split mt-[clamp(32px,5vw,56px)]">
            <Reveal className="notice">{t('projects.disclaimer')}</Reveal>
            <Figure
              photo={site.photos.projects}
              alt={t('projects.photoAlt')}
              className="is-wide"
              sizes="(max-width: 960px) 92vw, 420px"
              delay={80}
            />
          </div>
        </div>
      </section>
      <CtaBand locale={locale} />
      <JsonLd data={breadcrumbSchema(locale, [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.projects'), path: '/projects' },
      ])} />
    </>
  )
}
