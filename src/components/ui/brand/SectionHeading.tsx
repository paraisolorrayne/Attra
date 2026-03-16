import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  size?: 'xl' | 'lg' | 'md'
  subtitle?: string
}

const SectionHeading = forwardRef<HTMLHeadingElement, SectionHeadingProps>(
  ({ className, as: Tag = 'h2', size = 'lg', subtitle, children, ...props }, ref) => (
    <div>
      <Tag
        ref={ref}
        className={cn(
          {
            'type-display-xl': size === 'xl',
            'type-display-lg': size === 'lg',
            'type-display-md': size === 'md',
          },
          className
        )}
        {...props}
      >
        {children}
      </Tag>
      {subtitle && (
        <p className="type-body mt-3 max-w-2xl">{subtitle}</p>
      )}
    </div>
  )
)

SectionHeading.displayName = 'SectionHeading'

export { SectionHeading }

