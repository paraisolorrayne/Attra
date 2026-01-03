import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { BreadcrumbItem } from '@/types'
import { cn } from '@/lib/utils'

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  /** Whether the breadcrumb is positioned after a full-height hero (needs less top margin) */
  afterHero?: boolean
}

export function Breadcrumb({ items, className, afterHero = false }: BreadcrumbProps) {
  const allItems = [{ label: 'Início', href: '/' }, ...items]

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'py-4',
        // No extra margin needed - parent sections should handle spacing from header
        className
      )}
    >
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {allItems.map((item, index) => (
          <li key={item.href || `breadcrumb-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-foreground-secondary" />
            )}
            {index === allItems.length - 1 || !item.href ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-foreground-secondary hover:text-primary transition-colors flex items-center"
              >
                {index === 0 && <Home className="w-4 h-4 mr-1" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Generate JSON-LD structured data for breadcrumbs
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[], baseUrl: string) {
  const allItems = [{ label: 'Início', href: '/' }, ...items]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  }
}

