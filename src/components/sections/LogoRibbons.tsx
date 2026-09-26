import type { CSSProperties } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { ORGANISATIONS, ORG_GROUPS, type Organisation } from '@/config/organisations'
import { Reveal } from '@/components/primitives/Reveal'
import { RibbonPause } from './RibbonPause'
import { RibbonLoader } from './RibbonLoader'

/*
 * Three slowly moving logo ribbons — government, private, factory audits.
 *
 * Pure CSS motion: each ribbon holds its logos twice and slides left by 50%,
 * so the loop is seamless and nothing runs on the main thread. Sizes are in
 * CSS variables (`--logo-h`, `--logo-gap` in globals.css) so the same markup
 * shrinks for tablet and phone. Dark theme shows the white monochrome file,
 * light theme the colour one; only the visible one is downloaded
 * (RibbonLoader fetches it just before the section comes into view).
 */

/** Desktop logo height and gap, in px — must match --logo-h / --logo-gap. */
const BASE_H = 56
const BASE_GAP = 64
/** Desktop scroll speed in px per second. Smaller screens move proportionally slower. */
const SPEED = 34

/** Wide wordmarks get less height than square badges so both read at a similar weight. */
function scale(ratio: number) {
  return Math.min(1, Math.max(0.5, ratio ** -0.42))
}

function Logo({ org, copy }: { org: Organisation; copy?: boolean }) {
  const f = scale(org.ratio)
  const h = Math.round(BASE_H * f)
  const w = Math.round(BASE_H * f * org.ratio)
  const alt = copy ? '' : org.name
  return (
    <li className="logo" style={{ '--f': f.toFixed(3), '--r': org.ratio } as CSSProperties}>
      <img className="logo-c" src={`/logos/${org.id}-c.webp`} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      <img className="logo-m" src={`/logos/${org.id}-m.webp`} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      <span className="logo-name t-mono" aria-hidden="true">{org.name}</span>
    </li>
  )
}

export async function LogoRibbons({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'organisations' })

  return (
    <Reveal className="ribbons">
      <RibbonLoader />
      {ORG_GROUPS.map(group => {
        const list = ORGANISATIONS.filter(o => o.group === group)
        const setWidth = list.reduce((sum, o) => sum + BASE_H * scale(o.ratio) * o.ratio + BASE_GAP, 0)
        const duration = `${(setWidth / SPEED).toFixed(1)}s`
        const label = t(`groups.${group}.label`)

        return (
          <div key={group} className={`ribbon ribbon--${group}`}>
            <div className="ribbon-head">
              <span className="ribbon-mk" aria-hidden="true" />
              <h3 className="ribbon-label t-mono">{label}</h3>
              <p className="ribbon-count">
                <span className="ribbon-num">{list.length}</span>
                <span>{t(`groups.${group}.unit`)}</span>
              </p>
            </div>

            <div className="ribbon-vp" role="region" aria-label={label}>
              <div className="ribbon-track" style={{ '--dur': duration } as CSSProperties}>
                <ul className="ribbon-set">
                  {list.map(o => <Logo key={o.id} org={o} />)}
                </ul>
                <ul className="ribbon-set ribbon-dup" aria-hidden="true">
                  {list.map(o => <Logo key={o.id} org={o} copy />)}
                </ul>
              </div>
            </div>
          </div>
        )
      })}

      <div className="ribbons-foot">
        <span className="ribbons-hint t-mono">{t('hint')}</span>
        <RibbonPause
          pause={t('pause')}
          play={t('play')}
          pauseLabel={t('pauseLabel')}
          playLabel={t('playLabel')}
        />
      </div>
    </Reveal>
  )
}
