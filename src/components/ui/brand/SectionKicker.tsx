import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef, ReactNode } from 'react'

interface SectionKickerProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode
}

const SectionKicker = forwardRef<HTMLSpanElement, SectionKickerProps>(
  ({ className, icon, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('type-kicker inline-flex items-center gap-2', className)}
      {...props}
    >
      {icon && <span className="text-primary">{icon}</span>}
      {children}
    </span>
  )
)

SectionKicker.displayName = 'SectionKicker'

export { SectionKicker }

