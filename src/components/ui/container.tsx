import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        {
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md',
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
          'max-w-full': size === 'full',
        },
        className
      )}
      {...props}
    />
  )
)

Container.displayName = 'Container'

export { Container }

