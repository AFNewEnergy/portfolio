import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/config/site'
import { Reveal } from '@/components/primitives/Reveal'

/**
 * Career history, dated from the Revised CV (08/08/2026).
 *
 * Job titles live in the message files (they translate); organisation names,
 * dates and project lines live here (they do not). To add a role, add an entry
 * plus an `about.roles.<key>` message in all six locales — `npm run preflight`
 * will tell you if you miss one.
 */
export const CAREER = [
  {
    key: 'mz_director',
    when: 'Dec 2024 — Present',
    org: 'MZ Consulting Services',
    lines: [
      '100 MW solar plant — approved by government (JV-NEPCS-BMSTAR)',
      '400 MW solar under PPP guideline — Feemac Solar Limited',
      'Strategy, external stakeholder relationships and business development',
    ],
  },
  {
    key: 'mz_consultant',
    when: 'Aug 2022 — Nov 2024',
    org: 'MZ Consulting Services',
    lines: [
      'Authored winning proposals and tender documents for over 1,500 MW of solar',
      '1,000 MWac + 20% BESS — Eleris Energy Global (Pacific Group, USA)',
      '100 MWac + 20% BESS — Sumitomo Corporation and East Coast Group',
      'Site selection, land acquisition, tariff negotiation and off-taker gap analysis',
    ],
  },
  {
    key: 'metito',
    when: 'Sep 2020 — Jul 2023',
    org: 'Consortium of Metito Utilities, Aljomaih Energy & Water, and Jinko Solar',
    lines: [
      'Local stakeholder engagement for the consortium on visits to Bangladesh',
      'Permits, licences, land and right of way for the transmission line',
      'Support through project agreement negotiations with BPDB',
    ],
  },
  {
    key: 'rangunia',
    when: 'Sep 2020 — Jul 2022',
    org: 'Rangunia Solar Limited',
    lines: [
      '55 MWac solar power plant, Rangunia, Chittagong',
      'Led financial close and the operating financial model for the SPC',
      'EPC and O&M contract supervision, board and PPA reporting',
    ],
  },
  {
    key: 'xsergy',
    when: 'Feb 2019 — Aug 2020',
    org: 'XSERGY Limited',
    lines: [
      'Clients: Power China, State Grid of China, Shangdong KERUI, XJ Group, Sterling & Wilson, General Electric, Sonatrach',
      '2,000 MWac phased solar (Chandpur) · 3,600 MW CCPP and LNG import terminal',
      'Transmission and pipeline tenders — 400 kV, 230 kV, GTCL, Jalalabad',
      'Petroleum products and LNG supply to the Government of Bangladesh (G2G)',
    ],
  },
  {
    key: 'reliance',
    when: 'Jan 2017 — Jan 2019',
    org: 'Reliance Bangladesh LNG & Power Limited',
    lines: [
      '750 MWac RLNG-fired combined cycle plant, Narayanganj',
      '500 mmscfd FSRU-based LNG terminal, Kutubdia Island',
      'Liaison with BPDB, PGCB, Petrobangla, Titas, GTCL, Power and Energy Divisions',
      'PPA, IA, GSA and LLA negotiation, vetting and management',
    ],
  },
  {
    key: 'symbior',
    when: 'Feb 2018 — Apr 2018',
    org: 'Symbior Solar Bangladesh Limited',
    lines: [
      '9.6 MWac and 10 MWac grid-tied solar plants, Tetulia and Moulvibazar',
      'Investor due diligence, RFPs and EPC offer evaluation',
      'ESG and EHS compliance process and reporting',
    ],
  },
  {
    key: 'om',
    when: 'Nov 2013 — Dec 2016',
    org: 'O&M Solutions Bangladesh Limited',
    lines: [
      'Feasibility, IEE, EIA and SIA across 1,320 MW, 350 MW and 225 MW studies',
      "Owner's engineer support — Ghorashal 365 MW and Bibiyana South 400 MW",
      'Financial modelling for solicited and unsolicited power projects',
    ],
  },
  {
    key: 'eclectic',
    when: 'May 2013 — Oct 2013',
    org: 'Eclectic Limited',
    lines: [
      'Electrical safety and energy audits across a dozen major RMG factories, organised by GIZ',
      'Audits to BNBC 2010, NEC, NFPA-70 and NFPA-70E',
      'Cleaner production audit under IFC-SEDF',
    ],
  },
  {
    key: 'aloron',
    when: 'Mar 2012 — Dec 2016',
    org: 'Aloron Technologies',
    lines: [
      'Founded and led the company — strategy, capital allocation, business development',
      'Inventory, educational institution and hospital management systems',
    ],
  },
] as const

export async function Timeline({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'about.roles' })

  return (
    <div>
      {CAREER.map((r, i) => (
        <Reveal key={r.key} className="tl-row" delay={Math.min(i, 6) * 40}>
          <span className="tl-when t-mono">{r.when}</span>
          <div>
            <div className="tl-org">{r.org}</div>
            <div className="tl-role">{t(r.key)}</div>
            <ul className="tl-list">
              {r.lines.map(l => <li key={l}>{l}</li>)}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
