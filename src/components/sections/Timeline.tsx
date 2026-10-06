import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { CAREER } from '@/content/local/career'
import { Reveal } from '@/components/primitives/Reveal'

/**
 * Career history as an accordion: one native <details> per role.
 *
 * Closed, a role shows its dates, organisation, title and a few brief lines.
 * Clicking anywhere on it opens the full CV detail in its place (the brief
 * lines hide), and clicking again closes it, so the page stays short.
 *
 * <details> needs no JavaScript, works with the keyboard and screen readers,
 * and the browser's "Find in page" still finds text inside a closed entry.
 * The data lives in src/content/local/career.ts. Detail lines are English on
 * every language version, so each one keeps its own direction (dir="auto"):
 * on the Arabic pages a line like "1,000 MW + 20% BESS" still reads correctly.
 */
export async function Timeline({ locale }: { locale: Locale }) {
  const tr = await getTranslations({ locale, namespace: 'about.roles' })
  const tc = await getTranslations({ locale, namespace: 'about.career' })

  return (
    <ol className="tl">
      {CAREER.map((r, i) => (
        <Reveal as="li" key={r.key} className="tl-item" delay={Math.min(i, 6) * 40}>
          <details className="tl-d" id={`career-${r.key}`}>
            <summary className="tl-sum">
              <span className="tl-when t-mono">{r.when}</span>
              <span className="tl-main">
                <span className="tl-org">{r.org}</span>
                <span className="tl-role">{tr(r.key)}</span>
                {/* A preview of the detail below; hidden from screen readers, which get the full list on opening. */}
                <span className="tl-brief" aria-hidden="true">
                  {r.brief.map(line => <span key={line} className="tl-li"><span dir="auto">{line}</span></span>)}
                </span>
              </span>
              <span className="tl-toggle" aria-hidden="true">
                <span className="tl-toggle-text t-mono">
                  <span className="tl-more">{tc('more')}</span>
                  <span className="tl-less">{tc('less')}</span>
                </span>
                <span className="tl-plus" />
              </span>
            </summary>

            <div className="tl-detail">
              {r.note && <p className="tl-note" dir="auto">{r.note}</p>}
              <div className="tl-groups">
                {r.groups.map(g => (
                  <section key={g.group} className="tl-group">
                    <p className="tl-group-h t-mono">
                      {tc(`groups.${g.group}`)}
                      <span className="tl-group-n" aria-hidden="true">{String(g.items.length).padStart(2, '0')}</span>
                    </p>
                    <ul className="tl-list">
                      {g.items.map(item => <li key={item}><span dir="auto">{item}</span></li>)}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </details>
        </Reveal>
      ))}
    </ol>
  )
}
