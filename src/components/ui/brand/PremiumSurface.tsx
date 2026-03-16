import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface PremiumSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'inventory' | 'editorial' | 'institutional'
  hover?: boolean
}

const PremiumSurface = forwardRef<HTMLDivElement, PremiumSurfaceProps>(
  ({ className, variant = 'inventory', hover = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card-base',
        {
          'inventory-card': variant === 'inventory',
          'editorial-card': variant === 'editorial',
          'institutional-card': variant === 'institutional',
        },
        hover && 'card-metallic-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

PremiumSurface.displayName = 'PremiumSurface'

export { PremiumSurface }

