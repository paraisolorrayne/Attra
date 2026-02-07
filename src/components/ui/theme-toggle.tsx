'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  iconClassName?: string
}

export function ThemeToggle({ className, iconClassName }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Default styles when no className is provided (for admin panel, etc.)
  const defaultStyles = 'bg-background-card hover:bg-border text-foreground'
  const hasCustomStyles = className && className.includes('bg-')

  if (!mounted) {
    return (
      <button
        className={cn(
          'p-2 rounded-xl transition-colors',
          !hasCustomStyles && defaultStyles,
          className
        )}
        aria-label="Alternar tema"
      >
        <div className="w-5 h-5 sm:w-5 sm:h-5" />
      </button>
    )
  }

  // Use resolvedTheme to get the actual current theme (handles 'system' correctly)
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'p-2 rounded-xl transition-colors',
        !hasCustomStyles && defaultStyles,
        className
      )}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? (
        <Sun className={cn('w-5 h-5', iconClassName || 'text-current')} strokeWidth={2.5} />
      ) : (
        <Moon className={cn('w-5 h-5', iconClassName || 'text-current')} strokeWidth={2.5} />
      )}
    </button>
  )
}

