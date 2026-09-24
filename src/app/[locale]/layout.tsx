import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Newsreader, Inter, JetBrains_Mono, Noto_Sans_Arabic, Noto_Sans_SC } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { site, isRtl, LOCALE_TAGS, type Locale } from '@/config/site'
import { themeColors } from '@/config/theme'
import { buildMetadata } from '@/lib/seo'
import { personSchema } from '@/lib/jsonld'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeScript } from '@/components/layout/ThemeScript'
import { JsonLd } from '@/components/seo/JsonLd'

/* ── Type system ───────────────────────────────────────────────────────
   Newsreader (serif)  headings — editorial authority
   Inter      (sans)   body and UI
   JetBrains  (mono)   labels, capacities, dates
   Noto       (script) Arabic and Simplified Chinese
   All self-hosted by next/font: no render-blocking request, no CLS.     */
const serif = Newsreader({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-newsreader' })
const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--font-mono' })
const arabic = Noto_Sans_Arabic({ subsets: ['arabic'], display: 'swap', weight: ['300', '400', '600'], variable: '--font-arabic' })
const chinese = Noto_Sans_SC({ subsets: ['latin'], display: 'swap', weight: ['300', '400', '500'], variable: '--font-sc' })

const FONTS = [serif, sans, mono, arabic, chinese].map(f => f.variable).join(' ')

/** Pre-render all six locales at build time. */
export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themeColors.light.canvas },
    { media: '(prefers-color-scheme: dark)', color: themeColors.dark.canvas },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })

  return {
    ...buildMetadata({ locale, path: '/', title: t('home.title'), description: t('home.description') }),
    metadataBase: new URL(site.url),
    title: { default: t('home.title'), template: `%s — ${site.shortName}` },
    applicationName: site.shortName,
    authors: [{ name: site.name, url: site.socials.linkedin || site.url }],
    creator: site.name,
    keywords: t('keywords').split('|'),
    formatDetection: { telephone: true, address: false, email: true },
  }
}

export default async function LocaleLayout({
  children, params,
}: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)   // required for static rendering with next-intl
  const t = await getTranslations({ locale, namespace: 'meta' })

  return (
    <html
      lang={LOCALE_TAGS[locale]}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      data-theme="light"
      className={FONTS}
      suppressHydrationWarning
    >
      <head><ThemeScript /></head>
      <body>
        <NextIntlClientProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[300] focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--on-accent)]">
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
        <JsonLd data={personSchema(locale, t('home.description'))} />
      </body>
    </html>
  )
}
