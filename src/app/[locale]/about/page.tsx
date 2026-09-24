import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/jsonld'
import { PageTop, SectionHead } from '@/components/sections/SectionHead'
import { Rail } from '@/components/primitives/Rail'
import { Timeline } from '@/components/sections/Timeline'
import { Figures } from '@/components/sections/Figures'
import { CtaBand } from '@/components/sections/CtaBand'
import { Reveal } from '@/components/primitives/Reveal'
import { Icon, type IconName } from '@/components/primitives/Icon'
import { JsonLd } from '@/components/seo/JsonLd'
import { Figure } from '@/components/primitives/Figure'
import { site } from '@/config/site'

export const revalidate = 3600
type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.about' })
  return buildMetadata({ locale, path: '/about', title: t('title'), description: t('description') })
}

/** Add a credential block by adding a key here plus `about.<key>.*` messages. */
const CREDENTIALS = [
  { key: 'education', icon: 'document' },
  { key: 'languages', icon: 'person' },
] as const satisfies ReadonlyArray<{ key: string; icon: IconName }>

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })

  return (
    <>
      <PageTop title={t.rich('about.title', { em: c => <em>{c}</em> })} lede={t('about.lede')} />

      <section className="section">
        <div className="shell">
          <div className="intro-split mb-[clamp(40px,6vw,72px)]">
            <div>
              <Rail>{t('about.sections.career')}</Rail>
              <h2 className="t-title mt-5">{t('about.careerTitle')}</h2>
              <p className="t-lede mt-5">{t('about.introBody')}</p>
            </div>
            <Figure
              photo={site.photos.about}
              alt={`${site.name} — ${site.jobTitle}`}
              caption={[site.location.city, 'Bangladesh']}
              sizes="(max-width: 960px) 80vw, 420px"
              delay={80}
            />
          </div>
          <Timeline locale={locale} />
        </div>
      </section>

      <section className="section-tight">
        <div className="shell">
          <SectionHead eyebrow={t('about.sections.credentials')} title={t('about.credentialsTitle')} />
          <div className="plates">
            {CREDENTIALS.map((c, i) => (
              <Reveal key={c.key} className="plate" delay={i * 70}>
                <Icon name={c.icon} className="mb-5 h-6 w-6" style={{ color: 'var(--accent)' }} />
                <h3 className="t-sub">{t(`about.${c.key}.title`)}</h3>
                <ul className="tl-list mt-4">
                  {t(`about.${c.key}.items`).split('|').map(item => <li key={item}>{item}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Figures locale={locale} />
      <CtaBand locale={locale} />
      <JsonLd data={breadcrumbSchema(locale, [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.about'), path: '/about' },
      ])} />
    </>
  )
}
