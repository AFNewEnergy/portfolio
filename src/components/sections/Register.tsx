import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Project, Stage } from '@/content/types'
import { capacityParts } from '@/lib/format'
import { Reveal } from '@/components/primitives/Reveal'
import { cn } from '@/lib/cn'
import type { Locale } from '@/config/site'

/**
 * How loudly each stage reads. Early stages get a hollow marker, delivered
 * ones a filled marker — so the table is honest at a glance rather than
 * flattering everything equally.
 */
const STAGE_TONE: Record<Stage, 'off' | 'mid' | 'on'> = {
  Feasibility: 'off',
  Bidding: 'off',
  Development: 'mid',
  Approved: 'on',
  Construction: 'on',
  Operational: 'on',
}

export async function Register({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const t = await getTranslations({ locale, namespace: 'register' })

  return (
    <div className="register">
      <div className="reg-grid reg-head t-mono">
        <span>{t('col.capacity')}</span>
        <span>{t('col.project')}</span>
        <span>{t('col.counterparty')}</span>
        <span className="justify-self-end">{t('col.stage')}</span>
        <span className="justify-self-end">{t('col.year')}</span>
      </div>

      {projects.map((p, i) => {
        const cap = capacityParts(p.capacityMW)
        return (
          <Reveal key={p.slug} delay={Math.min(i, 8) * 30}>
            <Link href={`/projects/${p.slug}`} className={cn('reg-grid', 'reg-row')}>
              <span className="reg-capacity">
                {cap.value}
                {cap.unit && <sub>{cap.unit}</sub>}
              </span>
              <span className="reg-title">{p.title}</span>
              <span className="reg-client">{p.client ?? t('confidential')}</span>
              <span className="reg-stage t-mono" data-tone={STAGE_TONE[p.stage]}>
                <i aria-hidden="true" />
                <span>{t(`stage.${p.stage}`)}</span>
              </span>
              <span className="reg-year t-mono">{p.year ?? ''}</span>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
