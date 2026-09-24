import type { ReactNode } from 'react'
import { Reveal } from '@/components/primitives/Reveal'
import { Rail } from '@/components/primitives/Rail'

/** Standard two-column section opener: rail on the left, title + lede on the right. */
export function SectionHead({ eyebrow, title, lede }: { eyebrow: string; title: ReactNode; lede?: string }) {
  return (
    <Reveal className="sec-head">
      <Rail>{eyebrow}</Rail>
      <div>
        <h2 className="t-title">{title}</h2>
        {lede && <p className="t-lede mt-[18px]">{lede}</p>}
      </div>
    </Reveal>
  )
}

/** Inner-page hero. */
export function PageTop({ title, lede }: { title: ReactNode; lede: string }) {
  return (
    <div className="border-b border-[var(--line)] pb-[clamp(30px,5vw,56px)] pt-[clamp(44px,7vw,88px)]">
      <div className="shell">
        <Reveal as="h1" className="t-hero max-w-[18ch]">{title}</Reveal>
        <Reveal as="p" className="t-lede mt-6 max-w-[58ch]" delay={60}>{lede}</Reveal>
      </div>
    </div>
  )
}
