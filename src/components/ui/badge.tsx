import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'sold'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm',
        {
          'bg-background-card/90 text-foreground': variant === 'default',
          'bg-primary/95 text-white shadow-primary/25': variant === 'primary',
          'bg-background-card/90 text-foreground border border-border/50': variant === 'secondary',
          'bg-emerald-500/90 text-white shadow-emerald-500/25': variant === 'success',
          'bg-amber-500/90 text-white shadow-amber-500/25': variant === 'warning',
          'bg-neutral-600/90 text-white': variant === 'sold',
        },
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'

export { Badge }
