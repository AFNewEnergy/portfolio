'use client'

import { useEffect, useRef } from 'react'

/**
 * Loads the ribbon logos just before the section scrolls into view.
 *
 * The logos are `loading="lazy"`, but a lazy image inside an overflow-hidden
 * strip only starts downloading once it slides into the visible part — so each
 * logo would pop in blank. Once the section is within 600px of the screen this
 * switches the variant for the current theme (colour in light, monochrome in
 * dark) to eager, and does the same for the other variant if the theme changes.
 * The hidden variant is never fetched. Without JavaScript the lazy loading
 * still works, just with the pop-in.
 */
export function RibbonLoader() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = ref.current?.closest('.ribbons')
    if (!root) return

    const load = () => {
      const variant = document.documentElement.dataset.theme === 'dark' ? 'logo-m' : 'logo-c'
      root.querySelectorAll<HTMLImageElement>(`img.${variant}[loading="lazy"]`)
        .forEach(img => { img.loading = 'eager' })
    }

    let near = false
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { near = true; load(); io.disconnect() }
    }, { rootMargin: '600px 0px' })
    io.observe(root)

    const mo = new MutationObserver(() => { if (near) load() })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => { io.disconnect(); mo.disconnect() }
  }, [])

  return <span ref={ref} hidden />
}
