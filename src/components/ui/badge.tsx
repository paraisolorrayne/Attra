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
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-background-card text-foreground': variant === 'default',
          'bg-primary text-white': variant === 'primary',
          'bg-foreground-secondary/20 text-foreground border border-border': variant === 'secondary',
          'bg-green-500/20 text-green-600 dark:text-green-400': variant === 'success',
          'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400': variant === 'warning',
          'bg-foreground-secondary/20 text-foreground-secondary': variant === 'sold',
        },
        className
      )}
      {...props}
    />
  )
)

Badge.displayName = 'Badge'

export { Badge }
