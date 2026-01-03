'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BlogCategoriesProps {
  categories: string[]
  activeCategory: string
}

export function BlogCategories({ categories, activeCategory }: BlogCategoriesProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => (
        <Link
          key={category}
          href={category === 'Todos' ? '/blog' : `/blog/categoria/${category.toLowerCase()}`}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            category === activeCategory
              ? 'bg-primary text-white'
              : 'bg-background border border-border text-foreground hover:border-primary hover:text-primary'
          )}
        >
          {category}
        </Link>
      ))}
    </div>
  )
}

