import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { Icon, type IconName } from './Icon'
import { cn } from '@/lib/cn'

type Common = { children: ReactNode; variant?: 'primary' | 'outline'; icon?: IconName; iconAfter?: boolean; className?: string }
type AsLink = Common & { href: string; external?: boolean; type?: never }
type AsButton = Common & { href?: never; type?: 'button' | 'submit' }

export function Button(props: AsLink | AsButton) {
  const { children, variant = 'primary', icon, iconAfter = variant === 'primary', className } = props
  const cls = cn('btn', variant === 'primary' ? 'btn-a' : 'btn-o', className)

  const inner = (
    <>
      {icon && !iconAfter && <Icon name={icon} strokeWidth={1.5} />}
      <span>{children}</span>
      {icon && iconAfter && <Icon name={icon} strokeWidth={1.7} />}
    </>
  )

  if ('href' in props && props.href) {
    if (props.external) {
      return <a href={props.href} className={cls} target="_blank" rel="noopener noreferrer">{inner}</a>
    }
    return <Link href={props.href} className={cls}>{inner}</Link>
  }

  return <button type={(props as AsButton).type ?? 'button'} className={cls}>{inner}</button>
}
