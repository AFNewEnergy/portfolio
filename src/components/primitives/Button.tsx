import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { Icon, type IconName } from './Icon'
import { cn } from '@/lib/cn'

type Base = {
  children: ReactNode
  variant?: 'primary' | 'ghost'
  /** Leading icon (ghost default) or trailing icon (primary default). */
  icon?: IconName
  iconPosition?: 'leading' | 'trailing'
  className?: string
}
type LinkProps = Base & { href: string; external?: boolean; type?: never }
type BtnProps = Base & { href?: never; type?: 'button' | 'submit'; disabled?: boolean }

export function Button(props: LinkProps | BtnProps) {
  const { children, variant = 'primary', icon, className } = props
  const position = props.iconPosition ?? (variant === 'primary' ? 'trailing' : 'leading')
  const cls = cn('btn', variant === 'primary' ? 'btn--primary' : 'btn--ghost', className)

  const content = (
    <>
      {icon && position === 'leading' && <Icon name={icon} />}
      <span>{children}</span>
      {icon && position === 'trailing' && <Icon name={icon} strokeWidth={1.6} />}
    </>
  )

  if ('href' in props && props.href) {
    return props.external
      ? <a href={props.href} className={cls} target="_blank" rel="noopener noreferrer">{content}</a>
      : <Link href={props.href} className={cls}>{content}</Link>
  }
  return (
    <button type={(props as BtnProps).type ?? 'button'} disabled={(props as BtnProps).disabled} className={cls}>
      {content}
    </button>
  )
}
