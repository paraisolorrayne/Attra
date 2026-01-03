'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VehiclePaginationProps {
  currentPage: number
  totalPages: number
}

export function VehiclePagination({ currentPage, totalPages }: VehiclePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('pagina', page.toString())
    } else {
      params.delete('pagina')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      if (showEllipsisStart) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (showEllipsisEnd) {
        pages.push('...')
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Paginação">
      {/* Previous */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage === 1
            ? 'text-foreground-secondary cursor-not-allowed opacity-50'
            : 'text-foreground hover:bg-background-card'
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={cn(
                'min-w-10 h-10 px-3 rounded-lg font-medium transition-colors',
                page === currentPage
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-background-card'
              )}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-foreground-secondary"
            >
              {page}
            </span>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage === totalPages
            ? 'text-foreground-secondary cursor-not-allowed opacity-50'
            : 'text-foreground hover:bg-background-card'
        )}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  )
}

