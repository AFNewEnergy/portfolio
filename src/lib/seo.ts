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
export function alternates(locale: Locale, path = '/'): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[LOCALE_TAGS[l]] = absUrl(l, path)
  languages['x-default'] = absUrl(DEFAULT_LOCALE, path)

  return { canonical: absUrl(locale, path), languages }
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
  noIndex?: boolean
}

/** Builds a complete, consistent Metadata object. Every page uses this — never inline. */
export function buildMetadata(input: MetaInput): Metadata {
  const { locale, path = '/', title, description, image, type = 'website', publishedTime, noIndex } = input
  const url = absUrl(locale, path)
  const img = image ?? `${site.url}/${locale}/opengraph-image`

  return {
    title,
    description,
    alternates: alternates(locale, path),
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: site.shortName,
      locale: LOCALE_TAGS[locale],
      images: [{ url: img, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [img] },
  }
}
