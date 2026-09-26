import { site, LOCALES, LOCALE_TAGS, type Locale } from '@/config/site'
import { videoEmbedUrl } from '@/content/notion/render'
import { absUrl } from './seo'
import type { Project, Insight } from '@/content/types'

/** Schema.org Person — the primary entity for a personal professional site. */
export function personSchema(locale: Locale, description: string) {
  const sameAs = [site.socials.linkedin, site.socials.facebook].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}/#person`,
    name: site.name,
    alternateName: site.shortName,
    url: absUrl(locale),
    email: `mailto:${site.email}`,
    telephone: site.phone,
    jobTitle: site.jobTitle,
    worksFor: { '@id': `${site.url}/#org` },
    description,
    ...(sameAs.length ? { sameAs } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location.city,
      addressCountry: site.location.countryCode,
    },
    knowsAbout: [
      'Utility-scale solar power development',
      'Battery energy storage systems',
      'LNG and FSRU projects',
      'Combined cycle power plants',
      'Power purchase agreement negotiation',
      'Energy regulatory affairs in Bangladesh',
    ],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'American International University-Bangladesh' },
  }
}

/** The site itself, named after the domain so search results show "AF New Energy". */
export function websiteSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.company.name,
    alternateName: [site.company.domain, site.name],
    url: `${site.url}/`,
    inLanguage: LOCALE_TAGS[locale],
    publisher: { '@id': `${site.url}/#org` },
  }
}

/** His company. The site is its home, so the Organization and the Person point at each other. */
export function organizationSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site.url}/#org`,
    name: site.company.name,
    url: absUrl(locale),
    logo: `${site.url}/logo.png`,
    email: `mailto:${site.email}`,
    address: { '@type': 'PostalAddress', addressLocality: site.location.city, addressCountry: site.location.countryCode },
  }
}

/** ProfessionalService — makes the services page eligible for richer results. */
export function serviceSchema(locale: Locale, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#service`,
    name,
    description,
    url: absUrl(locale, '/services'),
    provider: { '@id': `${site.url}/#person` },
    areaServed: [
      { '@type': 'Country', name: 'Bangladesh' },
      { '@type': 'Place', name: 'Asia-Pacific' },
    ],
    availableLanguage: ['en', 'bn'],
  }
}

/** An absolute URL for a cover — search engines and link previews need one. */
export function absImage(src: string | null): string | undefined {
  if (!src) return undefined
  if (src.startsWith('/api/notion/img/')) return `${site.url}${src}/1200/jpg`
  if (src.startsWith('/')) return `${site.url}${src}`
  return src
}

export function articleSchema(locale: Locale, post: Insight) {
  const image = absImage(post.cover)
  // An untranslated article shown on another language's site belongs to its original page.
  const home = (LOCALES as readonly string[]).includes(post.lang) ? (post.lang as Locale) : locale
  const embed = post.type === 'Video' ? videoEmbedUrl(post.videoUrl) : null
  const ytId = embed?.match(/youtube-nocookie\.com\/embed\/([\w-]{11})/)?.[1]
  const thumb = image ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : `${site.url}/${home}/opengraph-image`)
  return {
    '@context': 'https://schema.org',
    '@type': post.type === 'Video' ? 'VideoObject' : 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    inLanguage: post.lang,
    datePublished: post.date ?? undefined,
    dateModified: post.updated ?? post.date ?? undefined,
    // Named in full so the article stands on its own when a crawler reads only this node.
    author: { '@type': 'Person', '@id': `${site.url}/#person`, name: site.name, url: absUrl(locale, '/about') },
    publisher: { '@type': 'Organization', '@id': `${site.url}/#org`, name: site.company.name, url: absUrl(locale), logo: { '@type': 'ImageObject', url: `${site.url}/logo.png` } },
    mainEntityOfPage: absUrl(home, `/insights/${post.slug}`),
    ...(image ? { image } : {}),
    ...(post.tags.length ? { keywords: post.tags.join(', ') } : {}),
    ...(post.type === 'Video' && post.videoUrl ? {
      name: post.title,
      uploadDate: post.date ?? undefined,
      thumbnailUrl: thumb,
      // A YouTube or Vimeo address is a player, not the video file itself.
      ...(embed ? { embedUrl: embed } : { contentUrl: post.videoUrl }),
    } : {}),
  }
}

export function projectSchema(locale: Locale, p: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.summary,
    url: absUrl(locale, `/projects/${p.slug}`),
    creator: { '@id': `${site.url}/#person` },
    about: p.technology.join(', '),
    ...(p.year ? { dateCreated: String(p.year) } : {}),
  }
}

export function breadcrumbSchema(locale: Locale, trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: absUrl(locale, t.path),
    })),
  }
}
