import { site } from '@/config/site'

export type SocialName = 'linkedin' | 'facebook' | 'whatsapp'

/**
 * The social list, filtered to what actually exists. A blank URL in
 * site.config disappears rather than rendering a dead icon — which is why
 * Facebook can stay empty until Faisal sends it.
 */
export function socialLinks(): Array<{ name: SocialName; href: string; label: string }> {
  const all: Array<{ name: SocialName; href: string; label: string }> = []
  if (site.socials.linkedin) all.push({ name: 'linkedin', href: site.socials.linkedin, label: 'LinkedIn' })
  if (site.socials.facebook) all.push({ name: 'facebook', href: site.socials.facebook, label: 'Facebook' })
  all.push({ name: 'whatsapp', href: `https://wa.me/${site.whatsapp}`, label: 'WhatsApp' })
  return all
}
