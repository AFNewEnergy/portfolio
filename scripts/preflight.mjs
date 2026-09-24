#!/usr/bin/env node
/**
 * Pre-build sanity check.  npm run preflight
 *
 * Catches the failures that otherwise surface as an opaque
 * "error occurred in the Server Components render" with a digest — which tells
 * you nothing about what actually broke.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'

const problems = []
const notes = []
const ok = m => console.log(`  \x1b[32m✓\x1b[0m ${m}`)
const bad = m => { problems.push(m); console.log(`  \x1b[31m✗\x1b[0m ${m}`) }
const warn = m => { notes.push(m); console.log(`  \x1b[33m!\x1b[0m ${m}`) }

console.log('\n\x1b[1mEnvironment\x1b[0m')

const url = process.env.NEXT_PUBLIC_SITE_URL?.trim()
if (!url) {
  warn('NEXT_PUBLIC_SITE_URL unset — canonical URLs will use the Vercel preview host')
} else {
  // Mirror resolveSiteUrl() in src/config/site.ts exactly.
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`
  try {
    const origin = new URL(withScheme).origin
    if (origin === 'null') throw new Error('no origin')
    if (withScheme !== url) warn(`NEXT_PUBLIC_SITE_URL "${url}" has no scheme — normalised to ${origin}`)
    else ok(`NEXT_PUBLIC_SITE_URL ${origin}`)
  } catch {
    bad(`NEXT_PUBLIC_SITE_URL "${url}" cannot be parsed as a URL — use e.g. https://abdullahfaisal.com`)
  }
}

const source = process.env.CONTENT_SOURCE ?? 'local'
if (source === 'notion') {
  for (const k of ['NOTION_TOKEN', 'NOTION_INSIGHTS_DS', 'NOTION_PROJECTS_DS']) {
    process.env[k] ? ok(`${k} set`) : bad(`CONTENT_SOURCE=notion but ${k} is missing`)
  }
} else {
  ok(`CONTENT_SOURCE=${source} — content comes from src/content/local`)
}

if (process.env.RESEND_API_KEY && !process.env.CONTACT_FROM_EMAIL) {
  warn('RESEND_API_KEY set but CONTACT_FROM_EMAIL is missing — the contact form will 503')
}

console.log('\n\x1b[1mTranslations\x1b[0m')

const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) =>
  v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [`${p}${k}`])

const dir = new URL('../src/messages/', import.meta.url)
const files = readdirSync(dir).filter(f => f.endsWith('.json'))
const loaded = {}
for (const f of files) {
  try { loaded[f.replace('.json', '')] = JSON.parse(readFileSync(new URL(f, dir), 'utf8')) }
  catch (e) { bad(`${f} is not valid JSON — ${e.message}`) }
}

const base = loaded.en ? flat(loaded.en).sort() : null
if (!base) bad('src/messages/en.json missing or unreadable')
else {
  for (const [loc, json] of Object.entries(loaded)) {
    const keys = flat(json).sort()
    const missing = base.filter(k => !keys.includes(k))
    const extra = keys.filter(k => !base.includes(k))
    if (missing.length) bad(`${loc}: ${missing.length} missing key(s) — ${missing.slice(0, 4).join(', ')}`)
    else if (extra.length) warn(`${loc}: ${extra.length} unused key(s) — ${extra.slice(0, 4).join(', ')}`)
    else ok(`${loc} — ${keys.length} keys, in parity with en`)
  }

  // Rich-text tags must be balanced, or t.rich throws at render time.
  for (const [loc, json] of Object.entries(loaded)) {
    for (const key of flat(json)) {
      const v = key.split('.').reduce((a, k) => a?.[k], json)
      if (typeof v !== 'string') continue
      for (const tag of ['em', 'br']) {
        const open = (v.match(new RegExp(`<${tag}>`, 'g')) ?? []).length
        const close = (v.match(new RegExp(`</${tag}>`, 'g')) ?? []).length
        if (open !== close) bad(`${loc} → ${key}: unbalanced <${tag}> (${open} open, ${close} close)`)
      }
    }
  }
}

console.log('\n\x1b[1mAssets\x1b[0m')
/* Photo paths are declared in src/config/site.ts — read them from there so
   this check can never drift from what the pages actually request. */
const cfg = readFileSync(new URL('../src/config/site.ts', import.meta.url), 'utf8')
const photos = [...cfg.matchAll(/src:\s*'(\/photos\/[^']+)'/g)].map(m => m[1])
for (const f of ['src/middleware.ts', ...photos.map(p => 'public' + p)]) {
  existsSync(new URL('../' + f, import.meta.url)) ? ok(f) : bad(`${f} is missing`)
}
if (!photos.length) warn('no photos found in site.config — check the photos map')

console.log(
  problems.length
    ? `\n\x1b[31m${problems.length} problem(s) — the build will likely fail\x1b[0m\n`
    : `\n\x1b[32mReady to build${notes.length ? ` (${notes.length} note${notes.length > 1 ? 's' : ''})` : ''}\x1b[0m\n`,
)
process.exit(problems.length ? 1 : 0)
