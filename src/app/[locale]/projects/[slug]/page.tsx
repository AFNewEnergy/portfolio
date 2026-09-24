import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { projectSchema, breadcrumbSchema } from '@/lib/jsonld'
import { content } from '@/content'
import { capacityLabel } from '@/lib/format'
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
    for (const p of await src.getProjects(locale)) out.push({ locale, slug: p.slug })
  }
  return out
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const p = await (await content()).getProject(locale, slug)
  if (!p) return {}
  const cap = capacityLabel(p.capacityMW)
  return buildMetadata({
    locale, path: `/projects/${slug}`,
    title: cap ? `${cap} — ${p.title}` : p.title,
    description: p.summary, type: 'article',
    ...(p.cover ? { image: p.cover } : {}),
  })
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const src = await content()
  const project = await src.getProject(locale, slug)
  if (!project) notFound()

  const t = await getTranslations({ locale })
  const all = await src.getProjects(locale)
  const i = all.findIndex(p => p.slug === slug)
  const prev = i > 0 ? all[i - 1] : undefined
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : undefined

  const facts = [
    { k: t('register.col.capacity'), v: capacityLabel(project.capacityMW) },
    { k: t('project.technology'), v: project.technology.map(x => t(`tech.${x}`)).join(' · ') },
    { k: t('register.col.stage'), v: t(`register.stage.${project.stage}`) },
    { k: t('register.col.counterparty'), v: project.client ?? t('register.confidential') },
    { k: t('project.location'), v: project.location ?? '—' },
    { k: t('project.role'), v: project.role ?? '—' },
    { k: t('register.col.year'), v: project.year ? String(project.year) : '—' },
  ].filter(f => f.v)

  return (
    <>
      <article>
        <div className="border-b border-[var(--line)] pb-[clamp(30px,5vw,56px)] pt-[clamp(36px,6vw,72px)]">
          <div className="shell">
            <Reveal>
              <Link href="/projects" className="t-mono inline-flex items-center gap-2" style={{ color: 'var(--ink-3)' }}>
                <Icon name="arrow" strokeWidth={1.6} className="h-3 w-3 rotate-180 rtl:rotate-0" />
                {t('project.backToRegister')}
              </Link>
            </Reveal>
            <Reveal as="h1" className="t-hero mt-6 max-w-[20ch]" delay={40}>{project.title}</Reveal>
            <Reveal as="p" className="t-lede mt-5 max-w-[58ch]" delay={80}>{project.summary}</Reveal>
          </div>
        </div>

        <section className="py-[clamp(40px,6vw,80px)]">
          <div className="shell">
            <Reveal className="facts">
              {facts.map(f => (
                <div key={f.k} className="fact">
                  <span className="fact-key t-mono">{f.k}</span>
                  <span className="fact-value">{f.v}</span>
                </div>
              ))}
            </Reveal>

            {project.metrics.length > 0 && (
              <Reveal className="chips mt-6">{project.metrics.map(m => <span key={m}>{m}</span>)}</Reveal>
            )}

            {project.body
              ? <Reveal className="prose mt-[clamp(36px,5vw,64px)]" delay={60}>
                  <div dangerouslySetInnerHTML={{ __html: project.body }} />
                </Reveal>
              : <Reveal className="notice mt-[clamp(36px,5vw,64px)]">{t('project.detailPending')}</Reveal>}
          </div>
        </section>

        {(prev || next) && (
          <nav className="border-t border-[var(--line)]" aria-label={t('project.moreProjects')}>
            <div className="shell grid sm:grid-cols-2">
              {prev && (
                <Link href={`/projects/${prev.slug}`} className="group py-8 pe-6">
                  <span className="t-mono block" style={{ color: 'var(--ink-3)' }}>{t('project.previous')}</span>
                  <span className="t-sub mt-2 block transition-colors group-hover:text-[var(--accent)]">{prev.title}</span>
                </Link>
              )}
              {next && (
                <Link href={`/projects/${next.slug}`} className="group py-8 sm:text-end">
                  <span className="t-mono block" style={{ color: 'var(--ink-3)' }}>{t('project.next')}</span>
                  <span className="t-sub mt-2 block transition-colors group-hover:text-[var(--accent)]">{next.title}</span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </article>

      <CtaBand locale={locale} />
      <JsonLd data={[
        projectSchema(locale, project),
        breadcrumbSchema(locale, [
          { name: t('nav.home'), path: '/' },
          { name: t('nav.projects'), path: '/projects' },
          { name: project.title, path: `/projects/${slug}` },
        ]),
      ]} />
    </>
  )
}
