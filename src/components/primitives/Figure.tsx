import Image from 'next/image'
import { type Photo } from '@/config/site'
import { Reveal } from './Reveal'
import { cn } from '@/lib/cn'

type Props = {
  photo: Photo
  alt: string
  /** Small mono caption rendered in the plate's bottom bar. */
  caption?: [left: string, right: string]
  /**
   * Crop shape.
   *   native   — the file's own ratio; safest for a new photo
   *   portrait — 3:4
   *   wide     — 16:9
   *   band     — height set by CSS (.band), so a full-bleed strip cannot grow
   *              tall enough to upscale the source past what it can carry
   */
  ratio?: 'native' | 'portrait' | 'wide' | 'band'
  priority?: boolean
  className?: string
  /** Responsive sizes hint. Set it — the default assumes a half-width column. */
  sizes?: string
  delay?: number
}

const RATIO: Record<NonNullable<Props['ratio']>, string | undefined> = {
  native: undefined,
  portrait: '3 / 4',
  wide: '16 / 9',
  band: undefined,
}

/**
 * A photograph in a bordered plate, matching the register and portfolio tables.
 *
 * Photos are framed rather than bled to the edge: a hairline border is the
 * system's whole vocabulary for "this is a distinct object", so an unframed
 * image would read as a mistake.
 */
export function Figure({
  photo, alt, caption, ratio = 'native', priority = false, className, sizes, delay = 0,
}: Props) {
  const aspect = ratio === 'band' ? undefined : (RATIO[ratio] ?? `${photo.width} / ${photo.height}`)

  return (
    <Reveal
      className={cn('figure-plate', ratio === 'band' && 'is-band', className)}
      delay={delay}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      <Image
        src={photo.src}
        alt={alt}
        width={photo.width}
        height={photo.height}
        priority={priority}
        quality={88}
        sizes={sizes ?? '(max-width: 960px) 92vw, 46vw'}
        className="figure-img"
      />
      {caption && (
        <div className="figure-caption t-mono">
          <span>{caption[0]}</span>
          <span>{caption[1]}</span>
        </div>
      )}
    </Reveal>
  )
}
