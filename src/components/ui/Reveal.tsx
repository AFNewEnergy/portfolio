'use client'

import { useEffect, useRef, type ReactNode, type ElementType, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

/**
 * Fade-and-rise on scroll via IntersectionObserver.
 *
 * One observer per instance is wasteful at scale, so a single shared observer
 * is created lazily and reused by every Reveal on the page. Elements
 * unsubscribe as soon as they have been revealed — the work is O(visible),
 * not O(total).
 */
let observer: IntersectionObserver | null = null

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined') return null
  observer ??= new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          observer?.unobserve(e.target)
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px' },
  )
  return observer
}

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
  style?: CSSProperties
}

export function Reveal({ children, className, delay = 0, as: Tag = 'div', style }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Already in view on first paint (above the fold) — reveal without waiting.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('in')
      return
    }
    const io = getObserver()
    io?.observe(el)
    return () => io?.unobserve(el)
  }, [])

  return (
    <Tag
      ref={ref}
      className={cn('rv', className)}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  )
}
