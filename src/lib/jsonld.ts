import { site, type Locale } from '@/config/site'
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

export function articleSchema(locale: Locale, post: Insight) {
  return {
    '@context': 'https://schema.org',
    '@type': post.type === 'Video' ? 'VideoObject' : 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date ?? undefined,
    author: { '@id': `${site.url}/#person` },
    publisher: { '@id': `${site.url}/#person` },
    mainEntityOfPage: absUrl(locale, `/insights/${post.slug}`),
    ...(post.cover ? { image: post.cover } : {}),
    ...(post.type === 'Video' && post.videoUrl ? { contentUrl: post.videoUrl, uploadDate: post.date ?? undefined } : {}),
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
