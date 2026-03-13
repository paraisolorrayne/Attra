import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        {
          'w-full': size === 'sm',
          'w-full': size === 'md',
          'w-full': size === 'lg',
          'w-full': size === 'xl',
          'w-4/5': size === '2xl',  // 80% of available width
          'w-full': size === 'full',
        },
        {
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md',
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
        },
        className
      )}
      {...props}
    />
  )
)

Container.displayName = 'Container'

export { Container }

