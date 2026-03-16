import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'
import { formatPrice } from '@/lib/utils'

interface PriceBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  price: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const PriceBlock = forwardRef<HTMLDivElement, PriceBlockProps>(
  ({ className, price, size = 'md', label, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {label && (
        <span className="type-label block mb-0.5">{label}</span>
      )}
      <span
        className={cn('type-price block', {
          'text-lg': size === 'sm',
          'type-price--md': size === 'md',
          'type-price--lg': size === 'lg',
        })}
      >
        {formatPrice(price)}
      </span>
    </div>
  )
)

PriceBlock.displayName = 'PriceBlock'

export { PriceBlock }

