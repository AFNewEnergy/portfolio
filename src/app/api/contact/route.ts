import { NextResponse, type NextRequest } from 'next/server'
import { Resend } from 'resend'
import { site } from '@/config/site'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const MAX = { name: 120, email: 200, company: 160, country: 80, projectType: 60, message: 4000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
/** Escapes user text before it is placed in the HTML email body. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function POST(req: NextRequest) {
  // 1 — throttle per IP before doing any work
  const { ok } = rateLimit(clientIp(req.headers))
  if (!ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  // 2 — parse
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // 3 — honeypot: a filled hidden field means a bot. Return 200 so it learns nothing.
  if (clean(body.website, 100)) return NextResponse.json({ ok: true })

  const name = clean(body.name, MAX.name)
  const email = clean(body.email, MAX.email)
  const company = clean(body.company, MAX.company)
  const country = clean(body.country, MAX.country)
  const projectType = clean(body.projectType, MAX.projectType)
  const message = clean(body.message, MAX.message)

  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ error: 'validation' }, { status: 422 })
  }

  // 4 — send
  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL ?? site.email
  const from = process.env.CONTACT_FROM_EMAIL

  if (!key || !from) {
    // Misconfiguration must be visible in logs but must not leak to the client.
    console.error('[contact] RESEND_API_KEY or CONTACT_FROM_EMAIL is not set')
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  const rows = [
    ['Name', name], ['Email', email], ['Company', company || '—'],
    ['Country', country || '—'], ['Project type', projectType || '—'],
  ]

  try {
    const resend = new Resend(key)
    const { error } = await resend.emails.send({
      from: `${site.shortName} Website <${from}>`,
      to: [to],
      replyTo: email,                                  // reply goes straight to the enquirer
      subject: `Enquiry — ${name}${company ? ` (${company})` : ''}`,
      text: [...rows.map(([k, v]) => `${k}: ${v}`), '', message].join('\n'),
      html: `
        <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
          <h2 style="margin:0 0 16px">New website enquiry</h2>
          <table style="border-collapse:collapse;margin-bottom:20px">
            ${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><strong>${esc(String(v))}</strong></td></tr>`).join('')}
          </table>
          <div style="white-space:pre-wrap;border-left:3px solid #CCFF00;padding-left:14px">${esc(message)}</div>
        </div>`,
    })

    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[contact] send failed', e)
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }
}
