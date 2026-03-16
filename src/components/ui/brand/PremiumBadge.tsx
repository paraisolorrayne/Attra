import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface PremiumBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'sold'
}

/**
 * Redesigned badge: squared shape, fixed height, optical padding,
 * stronger type weight, and consistent contrast per variant.
 * Replaces generic pill-shaped badges.
 */
const PremiumBadge = forwardRef<HTMLSpanElement, PremiumBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        // Fixed height, squared radius, stronger typography
        'inline-flex items-center h-7 px-2.5 rounded-md text-[0.6875rem] font-bold tracking-wide uppercase',
        'backdrop-blur-sm shadow-sm',
        {
          'bg-background-card/95 text-foreground border border-border/60': variant === 'default',
          'bg-primary text-white shadow-primary/20': variant === 'primary',
          'bg-emerald-600 text-white shadow-emerald-600/20': variant === 'success',
          'bg-amber-500 text-white shadow-amber-500/20': variant === 'warning',
          'bg-neutral-700 text-white/90': variant === 'sold',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)

PremiumBadge.displayName = 'PremiumBadge'

export { PremiumBadge }

