import type { Metadata } from 'next'
import { site, LOCALES, LOCALE_TAGS, DEFAULT_LOCALE, type Locale } from '@/config/site'

/** Absolute URL for a locale + path. Guarantees no double slashes. */
export function absUrl(locale: Locale, path = '/'): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `${site.url}/${locale}${clean}`
}

/**
 * hreflang alternates for every locale plus x-default.
 * Google requires each page to point at every translated variant, including itself.
 */
export function alternates(locale: Locale, path = '/', only?: readonly Locale[], canonicalLocale?: Locale): Metadata['alternates'] {
  const langs = only?.length ? only : LOCALES
  const languages: Record<string, string> = {}
  for (const l of langs) languages[LOCALE_TAGS[l]] = absUrl(l, path)
  languages['x-default'] = absUrl(langs.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : langs[0]!, path)

  return {
    canonical: absUrl(canonicalLocale ?? locale, path),
    languages,
    types: { 'application/rss+xml': [{ url: `${site.url}/feed.xml`, title: `${site.company.name} Insights` }] },
  }
}

type MetaInput = {
  locale: Locale
  path?: string
  title: string
  description: string
  /** Absolute or root-relative image. Defaults to the generated OG image. */
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  section?: string
  imageAlt?: string
  /** Articles that exist only in some languages list just those, and point the rest at the original. */
  languages?: readonly Locale[]
  canonicalLocale?: Locale
  noIndex?: boolean
}

/** Builds a complete, consistent Metadata object. Every page uses this — never inline. */
export function buildMetadata(input: MetaInput): Metadata {
  const { locale, path = '/', title, description, image, type = 'website', publishedTime, modifiedTime, tags, section, imageAlt, languages, canonicalLocale, noIndex } = input
  const url = absUrl(canonicalLocale ?? locale, path)
  const img = image ?? `${site.url}/${locale}/opengraph-image`

  return {
    title,
    description,
    alternates: alternates(locale, path, languages, canonicalLocale),
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.company.name,
      locale: LOCALE_TAGS[locale],
      // The generated card is 1200×630; a cover keeps its own shape, so no size is claimed for it.
      images: [image ? { url: img, alt: imageAlt || title } : { url: img, width: 1200, height: 630, alt: imageAlt || title }],
      ...(type === 'article' ? {
        authors: [absUrl(locale, '/about')],
        ...(publishedTime ? { publishedTime } : {}),
        ...(modifiedTime ? { modifiedTime } : {}),
        ...(section ? { section } : {}),
        ...(tags?.length ? { tags } : {}),
      } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [img] },
  }
}
