import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  /**
   * `/` must be listed explicitly — a single negative-lookahead pattern does
   * not reliably match the bare root, which leaves `/` un-redirected and
   * returning 404 in production. That is the exact symptom this fixes.
   *
   * Then: every locale-prefixed path, and finally everything else except
   * API routes, Next internals and files with an extension.
   */
  matcher: [
    '/',
    '/(en|zh|ar|tr|de|fr)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
