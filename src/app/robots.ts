import type { MetadataRoute } from 'next'
import { site } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never be indexed — they would compete with production.
  const isPreview = process.env.VERCEL_ENV === 'preview'

  return {
    rules: isPreview
      ? { userAgent: '*', disallow: '/' }
      : { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
