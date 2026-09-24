import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/config/site'
import { TECHNOLOGIES, type Technology, type Project } from '@/content/types'
import { capacityParts } from '@/lib/format'
import { Reveal } from '@/components/primitives/Reveal'

/**
 * Portfolio by technology.
 *
 * Replaces the old icon-tile "Coverage" grid, which was decorative — seven
 * boxes that said nothing a reader could weigh. This shows the actual shape of
 * the portfolio: how many projects and how much capacity sit behind each
 * technology, with bar length carrying the magnitude.
 *
 * Every number is derived from the register at render time, so the two can
 * never disagree.
 *
 * Honesty note: a project tagged Solar PV + BESS is counted under both, so the
 * rows deliberately do NOT sum to a portfolio total — the footnote says so.
 * Rows with no megawatt figure (transmission tenders, measured in kV) show the
 * project count and an em dash rather than a misleading zero-length bar.
 */
type Row = {
  tech: Technology
  projects: number
  mw: number
  /** 0–1, relative to the largest row. Drives bar width only. */
  share: number
}

function summarise(projects: Project[]): Row[] {
  const counts = new Map<Technology, { projects: number; mw: number }>()

  for (const p of projects) {
    for (const tech of p.technology) {
      const entry = counts.get(tech) ?? { projects: 0, mw: 0 }
      entry.projects += 1
      entry.mw += p.capacityMW ?? 0
      counts.set(tech, entry)
    }
  }

  const rows = TECHNOLOGIES.flatMap(tech => {
    const e = counts.get(tech)
    return e ? [{ tech, projects: e.projects, mw: e.mw, share: 0 }] : []
  })

  const max = Math.max(...rows.map(r => r.mw), 1)
  return rows
    .map(r => ({ ...r, share: r.mw / max }))
    .sort((a, b) => b.mw - a.mw || b.projects - a.projects)
}

export async function Portfolio({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const t = await getTranslations({ locale })
  const rows = summarise(projects)

  return (
    <div>
      <div className="pf-head t-mono">
        <span>{t('portfolio.col.technology')}</span>
        <span>{t('portfolio.col.projects')}</span>
        <span className="justify-self-end">{t('portfolio.col.capacity')}</span>
        <span />
      </div>

      {rows.map((r, i) => {
        const cap = capacityParts(r.mw || null)
        return (
          <Reveal key={r.tech} delay={Math.min(i, 7) * 40}>
            <Link href="/projects" className="pf-row">
              <span className="pf-tech">{t(`tech.${r.tech}`)}</span>

              <span className="pf-count t-mono">
                {t('portfolio.projectCount', { count: r.projects })}
              </span>

              <span className="pf-mw">
                {r.mw > 0 ? (
                  <>
                    {cap.value}
                    <sub>{cap.unit}</sub>
                  </>
                ) : (
                  <span className="pf-dash" aria-label={t('portfolio.notMeasuredInMW')}>—</span>
                )}
              </span>

              {/* Bar length is the only magnitude encoding; colour is constant. */}
              <span className="pf-track" aria-hidden="true">
                <span className="pf-bar" style={{ width: `${Math.max(r.share * 100, r.mw > 0 ? 2 : 0)}%` }} />
              </span>
            </Link>
          </Reveal>
        )
      })}

      <Reveal as="p" className="pf-note t-mono">{t('portfolio.footnote')}</Reveal>
    </div>
  )
}
