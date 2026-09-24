import { PARTNERS } from '@/config/partners'
import { Reveal } from '@/components/primitives/Reveal'

/**
 * A static bordered grid, not a scrolling ticker. Names sit as plain text
 * rather than logos: a logo wall reads as endorsement, and some of these
 * relationships are under NDA.
 */
export function PartnerGrid() {
  return (
    <Reveal className="partner-grid">
      {PARTNERS.map(name => <div key={name}>{name}</div>)}
    </Reveal>
  )
}
