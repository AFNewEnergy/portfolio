import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { site, type Locale } from '@/config/site'
import { buildMetadata } from '@/lib/seo'
import { Reveal } from '@/components/primitives/Reveal'
import { Rail } from '@/components/primitives/Rail'
import { Icon } from '@/components/primitives/Icon'

/**
 * Copyright & disclaimer.
 *
 * English on every language version, by choice: the wording is a legal
 * notice and is kept in one language so there is only one text to rely on.
 * Every language address therefore points search engines at the English page.
 * Linked from the footer on every page and from the end of every article.
 */
export const revalidate = 86400

const UPDATED = '6 October 2026'
const TITLE = 'Copyright & disclaimer'
const DESCRIPTION = `Who owns the content on ${site.company.domain}, how it may and may not be used, and how to ask for permission.`

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale, path: '/copyright', title: TITLE, description: DESCRIPTION,
    languages: ['en'], canonicalLocale: 'en',
  })
}

const SECTIONS: Array<{ id: string; title: string; body: string[] }> = [
  {
    id: 'ownership',
    title: 'Who owns the content',
    body: [
      `All content on this website, including the text, articles and analysis, photographs of ${site.name}, the project register, and the design and layout, is the property of ${site.name} and ${site.company.name}, unless it is credited to someone else.`,
      'This information is personal and professional material. Publishing it here does not place it in the public domain.',
    ],
  },
  {
    id: 'use',
    title: 'Use without permission is not allowed',
    body: [
      'You may not copy, republish, distribute, adapt or otherwise use any of this content, in whole or in part, for any commercial or public purpose without prior written permission.',
      'You are welcome to link to any page, to read and print pages for your own reference, and to quote a short passage with a clear credit and a link back to the source.',
    ],
  },
  {
    id: 'legal-action',
    title: 'Unauthorised use',
    body: [
      'Copying or using this content without permission may lead to legal action under applicable copyright law, including a request to remove the material and a claim for damages.',
    ],
  },
  {
    id: 'permission',
    title: 'How to ask for permission',
    body: [
      `Write to ${site.email} and say what you would like to use, where it will appear and for what purpose. Requests are usually answered within one working day.`,
    ],
  },
  {
    id: 'third-party',
    title: 'Content that belongs to others',
    body: [
      'Photographs credited to Unsplash or to another source belong to their creators and are used under their licences.',
      'Organisation names and logos belong to their owners. They are shown only to describe past work and do not mean that any organisation endorses this website.',
      'Facts, figures and policies quoted from public sources remain public. What is protected is the way they are written, selected and analysed here.',
    ],
  },
  {
    id: 'not-advice',
    title: 'Not professional advice',
    body: [
      'The information on this website is general. It is based on public sources at the time of writing and may change without notice.',
      'It is not legal, financial, investment or technical advice, and it should not be relied on to make a decision without advice on your own situation. Project stages show the point reached during my involvement, not necessarily the status today.',
    ],
  },
]

export default async function CopyrightPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div lang="en" dir="ltr">
      <div className="border-b border-[var(--line)] pb-[clamp(30px,5vw,56px)] pt-[clamp(44px,7vw,88px)]">
        <div className="shell">
          <Reveal as="h1" className="t-hero max-w-[18ch]">Copyright &amp; <em>disclaimer.</em></Reveal>
          <Reveal as="p" className="t-lede mt-6 max-w-[58ch]" delay={60}>
            Everything on this website is personal and professional material. Please ask before you use any of it.
          </Reveal>
        </div>
      </div>

      <section className="section">
        <div className="shell legal">
          <aside className="legal-aside">
            <Reveal className="legal-card">
              <span className="t-mono legal-card-eyebrow">In short</span>
              <p className="legal-card-text">
                © {new Date().getFullYear()} {site.name} · {site.company.name}. All rights reserved.
                No copying or reuse without written permission.
              </p>
              <a href={`mailto:${site.email}?subject=${encodeURIComponent('Permission to use content from ' + site.company.domain)}`}
                className="btn btn--primary legal-card-btn">
                <span>Request permission</span><Icon name="mail" />
              </a>
              <span className="t-mono legal-card-updated">Last updated {UPDATED}</span>
            </Reveal>
          </aside>

          <div className="legal-body">
            {SECTIONS.map((s, i) => (
              <Reveal key={s.id} className="legal-sec" delay={Math.min(i, 4) * 40}>
                <h2 id={s.id} className="legal-h">
                  <span className="legal-n t-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.title}</span>
                </h2>
                {s.body.map(p => <p key={p} className="legal-p">{p}</p>)}
              </Reveal>
            ))}
            <Reveal className="legal-foot">
              <Rail>Contact</Rail>
              <a href={`mailto:${site.email}`} className="cta-mail mt-4">{site.email}</a>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
