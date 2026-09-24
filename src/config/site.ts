/**
 * Single source of truth for everything site-wide.
 * Change a value here and it propagates to metadata, sitemap, JSON-LD,
 * the header, the footer and the contact page. Nothing is hard-coded twice.
 *
 * Source: Revised CV — Abdullah Bin Hossain, 08/08/2026 (Europass).
 */
export const LOCALES = ['en', 'zh', 'ar', 'tr', 'de', 'fr'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

/** Locales that render right-to-left. */
export const RTL_LOCALES: readonly Locale[] = ['ar']
export const isRtl = (l: Locale) => RTL_LOCALES.includes(l)

/** Native names for the language switcher — never translate these. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ar: 'العربية',
  tr: 'Türkçe',
  de: 'Deutsch',
  fr: 'Français',
}

/** BCP-47 tags for hreflang and <html lang>. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-Hans',
  ar: 'ar',
  tr: 'tr',
  de: 'de',
  fr: 'fr',
}

/**
 * Normalises whatever is in NEXT_PUBLIC_SITE_URL into a valid absolute origin.
 *
 * `new URL()` in the root layout's metadataBase throws on a bare domain, and
 * Next reports that as an opaque "error occurred in the Server Components
 * render" on a random page — one of the least debuggable failures there is.
 * So we repair the three mistakes people actually make instead:
 *
 *   abdullahfaisal.com        → https://abdullahfaisal.com
 *   https://site.com/         → https://site.com     (trailing slash)
 *   HTTPS://Site.com          → https://site.com     (case)
 *
 * Anything genuinely unparseable throws here, at config load, with a message
 * that names the variable.
 */
function resolveSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`

  try {
    return new URL(withScheme).origin
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SITE_URL: "${raw}". ` +
        'Use a full origin including the scheme, e.g. https://abdullahfaisal.com',
    )
  }
}

export const site = {
  name: 'Abdullah Bin Hossain',
  shortName: 'Abdullah Faisal',
  nickname: 'Faisal',
  jobTitle: 'Power Business Professional',
  region: 'APAC',

  url: resolveSiteUrl(),

  email: 'faisal473345@gmail.com',

  /** Mobile — for tel: links. */
  phone: '+8801719473385',
  phoneDisplay: '+880 1719 473385',

  /** WhatsApp is a DIFFERENT number from the mobile. Confirmed in the 2026 CV. */
  whatsapp: '8801700683566',
  whatsappDisplay: '+880 1700 683566',

  location: { city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', timezone: 'GMT+6' },

  /** Sunday–Thursday is the Bangladeshi working week. */
  consultationHours: 'Sunday – Thursday, 10:00–19:00 (GMT+6)',

  socials: {
    linkedin: 'https://www.linkedin.com/in/abdullah-faisal/',
    facebook: 'https://www.facebook.com/Faisal.Lunatic',
  },

  /**
   * Headline figures.
   *
   * `proposalsMW` is the strongest number on the CV because it is precise and
   * defensible: "authored winning proposals and tender documents for over
   * 1,500 MW of solar projects". Prefer it over the aggregate.
   *
   * ⚠ `capacityGW` sums every project engaged at any stage — feasibility,
   * bidding, development, supervision — not capacity built and energised.
   * Confirm the wording with Faisal before publishing. See README.
   */
  stats: {
    years: 13,
    proposalsMW: 1500,
    projects: 30,
    partners: 10,
    capacityGW: 20,
  },

  /**
   * Photography. One image per page, used sparingly — this design language
   * leans on typography and rules, so a photo on every section would fight it.
   *
   * Intrinsic dimensions are declared here so next/image never needs to guess
   * and no page can cause layout shift. Update both together if you swap a file.
   */
  photos: {
    hero: { src: '/photos/portrait.jpg', width: 762, height: 1017 },
    about: { src: '/photos/standing.jpg', width: 546, height: 787 },
    services: { src: '/photos/boardroom.jpg', width: 1111, height: 596 },
    projects: { src: '/photos/desk-wide.jpg', width: 763, height: 399 },
    contact: { src: '/photos/window.jpg', width: 760, height: 610 },
    /** Unused alternate, kept for swapping in: /photos/desk-portrait.jpg */
  },
} as const

export type Photo = (typeof site.photos)[keyof typeof site.photos]

export const NAV = ['home', 'about', 'services', 'projects', 'insights', 'contact'] as const
export type NavKey = (typeof NAV)[number]

/** Route path per nav key. `home` is the locale root. */
export const NAV_PATH: Record<NavKey, string> = {
  home: '/',
  about: '/about',
  services: '/services',
  projects: '/projects',
  insights: '/insights',
  contact: '/contact',
}
