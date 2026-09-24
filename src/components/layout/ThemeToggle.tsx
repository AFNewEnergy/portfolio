'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/primitives/Icon'

type Mode = 'light' | 'dark'

export function ThemeToggle() {
  const t = useTranslations('ui')
  const [mode, setMode] = useState<Mode>('light')

  // Read what ThemeScript already applied so the icon is correct on hydration.
  useEffect(() => { setMode((document.documentElement.dataset.theme as Mode) ?? 'light') }, [])

  function toggle() {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#0C1013' : '#FAF8F4')
    setMode(next)
  }

  return (
    <button className="icon-btn" onClick={toggle} aria-label={t('toggleTheme')}>
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}
