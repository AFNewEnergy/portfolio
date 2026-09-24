import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { serviceSchema, breadcrumbSchema } from '@/lib/jsonld'
import { content } from '@/content'
import { PageTop, SectionHead } from '@/components/sections/SectionHead'
import { Plates } from '@/components/sections/Plates'
import { Portfolio } from '@/components/sections/Portfolio'
import { CtaBand } from '@/components/sections/CtaBand'
import { JsonLd } from '@/components/seo/JsonLd'
import { Figure } from '@/components/primitives/Figure'
import { site } from '@/config/site'

export const revalidate = 3600
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.services' })
  return buildMetadata({ locale, path: '/services', title: t('title'), description: t('description') })
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const projects = await (await content()).getProjects(locale)

  return (
    <>
      <PageTop title={t.rich('services.title', { em: c => <em>{c}</em> })} lede={t('services.lede')} />

      <section className="section">
        <div className="shell"><Plates locale={locale} showIcons /></div>
      </section>

      <div className="band">
        <Figure
          photo={site.photos.services}
          alt={t('services.photoAlt')}
          ratio="band"
          className="is-wide"
          sizes="100vw"
        />
      </div>

      <section className="section">
        <div className="shell">
          <SectionHead
            eyebrow={t('home.sections.portfolio')}
            title={t.rich('portfolio.title', { em: c => <em>{c}</em> })}
            lede={t('portfolio.lede')}
          />
          <Portfolio locale={locale} projects={projects} />
        </div>
      </section>

      <CtaBand locale={locale} />
      <JsonLd data={[
        serviceSchema(locale, t('services.title'), t('services.lede')),
        breadcrumbSchema(locale, [{ name: t('nav.home'), path: '/' }, { name: t('nav.services'), path: '/services' }]),
      ]} />
    </>
  )
}
