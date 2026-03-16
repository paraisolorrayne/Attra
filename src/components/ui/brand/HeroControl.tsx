'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: 'prev' | 'next'
  variant?: 'side' | 'inline'
}

/**
 * Squared hero navigation button (not pill-shaped).
 * Uses hero-shell__controls semantic class.
 */
const HeroControl = forwardRef<HTMLButtonElement, HeroControlProps>(
  ({ className, direction, variant = 'side', ...props }, ref) => {
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight

    return (
      <button
        ref={ref}
        className={cn(
          'hero-shell__controls',
          variant === 'side'
            ? 'hero-shell__controls--side p-3'
            : 'p-1.5 md:p-2 rounded-md bg-foreground/10 hover:bg-foreground/20 hero-stats-text transition-colors',
          className
        )}
        aria-label={direction === 'prev' ? 'Slide anterior' : 'Próximo slide'}
        {...props}
      >
        <Icon className={cn(
          variant === 'side' ? 'w-6 h-6' : 'w-4 h-4',
          'transition-transform group-hover:scale-110'
        )} />
      </button>
    )
  }
)

HeroControl.displayName = 'HeroControl'

export { HeroControl }

