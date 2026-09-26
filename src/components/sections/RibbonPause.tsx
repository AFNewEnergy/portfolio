'use client'

import { useEffect, useRef, useState } from 'react'

type Props = { pause: string; play: string; pauseLabel: string; playLabel: string }

/**
 * Stops and restarts every logo ribbon in the section. Moving content that
 * runs longer than five seconds needs a pause control (WCAG 2.2.2), and on
 * touch screens there is no hover to stop it.
 */
export function RibbonPause({ pause, play, pauseLabel, playLabel }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    ref.current?.closest('.ribbons')?.setAttribute('data-paused', String(paused))
  }, [paused])

  return (
    <button
      ref={ref}
      type="button"
      className="btn btn--ghost ribbon-toggle"
      aria-label={paused ? playLabel : pauseLabel}
      onClick={() => setPaused(p => !p)}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        {paused ? <path d="M4.5 2.8v10.4L13 8z" strokeLinejoin="round" /> : <path d="M5.5 3v10M10.5 3v10" strokeLinecap="round" />}
      </svg>
      <span>{paused ? play : pause}</span>
    </button>
  )
}
