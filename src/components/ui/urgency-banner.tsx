'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Eye, TrendingUp, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UrgencyBannerProps {
  variant?: 'inventory' | 'views' | 'trending' | 'limited'
  count?: number
  vehicleName?: string
  className?: string
  dismissible?: boolean
}

export function UrgencyBanner({
  variant = 'inventory',
  count = 3,
  vehicleName,
  className = '',
  dismissible = true,
}: UrgencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [displayCount, setDisplayCount] = useState(count)

  // Simulate real-time view count updates
  useEffect(() => {
    if (variant === 'views') {
      const interval = setInterval(() => {
        setDisplayCount(prev => prev + Math.floor(Math.random() * 2))
      }, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [variant])

  if (!isVisible) return null

  const variants = {
    inventory: {
      icon: Clock,
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-700 dark:text-amber-400',
      message: `Apenas ${displayCount} unidades disponíveis em estoque`,
    },
    views: {
      icon: Eye,
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700 dark:text-blue-400',
      message: `${displayCount} pessoas visualizando este veículo agora`,
    },
    trending: {
      icon: TrendingUp,
      bgColor: 'bg-green-500/10 border-green-500/20',
      iconColor: 'text-green-600',
      textColor: 'text-green-700 dark:text-green-400',
      message: vehicleName ? `${vehicleName} está em alta demanda` : 'Este modelo está em alta demanda',
    },
    limited: {
      icon: Flame,
      bgColor: 'bg-primary/10 border-primary/20',
      iconColor: 'text-primary',
      textColor: 'text-primary',
      message: 'Edição limitada - Oportunidade única',
    },
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border',
        config.bgColor,
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={cn('w-4 h-4 shrink-0', config.iconColor)} />
        <span className={cn('text-sm font-medium', config.textColor)}>
          {config.message}
        </span>
      </div>
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-black/5 rounded transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-foreground-secondary" />
        </button>
      )}
    </div>
  )
}

// Compact badge version for vehicle cards
interface UrgencyBadgeProps {
  type: 'low-stock' | 'popular' | 'new' | 'reserved'
  className?: string
}

export function UrgencyBadge({ type, className = '' }: UrgencyBadgeProps) {
  const badges = {
    'low-stock': {
      label: 'Últimas unidades',
      bgColor: 'bg-amber-500',
      textColor: 'text-white',
    },
    popular: {
      label: 'Mais procurado',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    new: {
      label: 'Recém chegado',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    reserved: {
      label: 'Reservado',
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
    },
  }

  const config = badges[type]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
    </span>
  )
}

