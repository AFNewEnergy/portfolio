import type { SVGProps } from 'react'

/**
 * Inline icon paths — no icon package, so nothing to tree-shake and nothing
 * to break on a dependency bump. All glyphs are 24×24 on a 1.4 stroke.
 * Add a new one by adding a key here.
 */
export const ICONS = {
  arrow: 'M5 12h13M12.5 6l6 6-6 6',
  download: 'M12 3.5v12m0 0 4.6-4.6M12 15.5 7.4 10.9M4.5 19.5h15',
  mail: 'M20.5 5.5v13h-17v-13zM3.5 6.5 12 13l8.5-6.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.4 2.6 3.6 5.8 3.6 9S14.4 18.4 12 21c-2.4-2.6-3.6-5.8-3.6-9S9.6 5.6 12 3Z',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19',
  menu: 'M3.5 7.5h17M3.5 16.5h17',
  close: 'M6 6l12 12M18 6 6 18',
  chart: 'M3 20h18M6 20V9.5M11 20V5M16 20v-7.5M21 20V11',
  institution: 'M3 21h18M4.5 21V9.5M19.5 21V9.5M9 21V9.5M15 21V9.5M2.5 9.5 12 3.5l9.5 6',
  document: 'M14.5 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7.5L14.5 3ZM14 3v5h5M8.5 13h7M8.5 17h4.5',
  wrench: 'M10.6 6.4a4 4 0 1 0 5.6 5.6l4.4 4.4-2.2 2.2-4.4-4.4a4 4 0 1 0-5.6-5.6l2.6 2.6-1.4 1.4-2.6-2.6',
  solar: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19',
  battery: 'M18.5 7h-16v10h16zM21.5 10.5v3M6 10.5v3M9.5 12h3',
  tanker: 'M2.5 17.5h19M4.5 17.5V12l7.5-3 7.5 3v5.5M9 12v5.5M15 12v5.5M12 9V4.5',
  flame: 'M12 21c3.3 0 6-2.5 6-5.6 0-4-3.4-5.6-3.4-9.4-2 1-2.6 3-2.6 4.4 0 1-.8 1.6-1.5 1-.8-.7-1-1.9-1-2.9C7.6 9.6 6 12 6 15.4 6 18.5 8.7 21 12 21Z',
  plant: 'M4 20V9l4-5h8l4 5v11M8 20v-6h8v6M9.5 4v5M14.5 4v5',
  pylon: 'M12 2v20M6 6h12M5 10h14M4 21l8-9 8 9',
  recycle: 'M4.5 9.5 8 3.5h8l3.5 6M19.5 14.5 16 20.5H8l-3.5-6M8 12h8',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z',
  phone: 'M6.5 3h3l1.6 4-2 1.4a12 12 0 0 0 5.5 5.5l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5.2l3.2 2',
  person: 'M12 12.3a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8ZM4.4 20.2c0-4 3.4-6.4 7.6-6.4s7.6 2.4 7.6 6.4',
  check: 'M4.5 12.5 9.5 17.5 19.5 7',
  register: 'M4 5.5h16M4 12h16M4 18.5h16M7.5 3v19',
  clock2: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 12.5l2.4 2.4 4.6-5',
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, strokeWidth = 1.4, ...rest }: SVGProps<SVGSVGElement> & { name: IconName; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Brand mark: a bordered square holding an accent chevron. */
export function Sigil() {
  return <span className="sigil" aria-hidden="true"><i /></span>
}

export function SocialIcon({ name }: { name: 'linkedin' | 'facebook' | 'whatsapp' }) {
  const d = {
    linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9.5 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21h-4z',
    facebook: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z',
    whatsapp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.5-.3.3c-.1.1-.2.3 0 .5.1.3.6 1.1 1.4 1.8 1 .8 1.7 1.1 2 1.2.2.1.4 0 .5-.1l.8-.9c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z',
  }[name]
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
}
