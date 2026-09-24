import { cn } from '@/lib/cn'

/**
 * The system's signature motif: a small accent square, a label, and a hairline
 * running to the edge of the column. Used as every section's eyebrow.
 */
export function Rail({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rail t-mono', className)}>
      <span className="rail-tick" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
