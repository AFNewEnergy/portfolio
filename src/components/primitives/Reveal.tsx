'use client'

import { useEffect, useRef, type ReactNode, type ElementType, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

/**
 * Fade-and-rise on scroll.
 *
 * One IntersectionObserver is shared by every instance on the page and each
 * element unsubscribes the moment it is revealed — the work stays proportional
 * to what is visible, not to how much is on the page.
 */
let io: IntersectionObserver | null = null

function observer() {
  if (typeof window === 'undefined') return null
  io ??= new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io?.unobserve(e.target) }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -30px' },
  )
  return io
}

type Props = {
  children: ReactNode
  className?: string
  /** Stagger in ms. Keep under ~250 total or the page feels slow. */
  delay?: number
  as?: ElementType
  style?: CSSProperties
}

export function Reveal({ children, className, delay = 0, as: Tag = 'div', style }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Above the fold on first paint: show immediately rather than waiting for a scroll.
    if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); return }
    const o = observer()
    o?.observe(el)
    return () => o?.unobserve(el)
  }, [])

  return (
    <Tag ref={ref} className={cn('reveal', className)}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}>
      {children}
    </Tag>
  )
}
