'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Car, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InventoryStatusBarProps {
  totalVehicles: number
  newArrivals?: number
  className?: string
}

export function InventoryStatusBar({
  totalVehicles,
  newArrivals = 0,
  className = '',
}: InventoryStatusBarProps) {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Total Vehicles */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalVehicles}</p>
            <p className="text-xs text-foreground-secondary">veículos em estoque</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-border" />

        {/* New Arrivals */}
        {newArrivals > 0 && (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">+{newArrivals}</p>
                <p className="text-xs text-foreground-secondary">novos esta semana</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
          </>
        )}

        {/* Market Trend */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Alta demanda</p>
            <p className="text-xs text-foreground-secondary">mercado aquecido</p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-12 bg-border" />

        {/* Last Update */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-lg border border-border">
            <Clock className="w-5 h-5 text-foreground-secondary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Atualizado</p>
            <p className="text-xs text-foreground-secondary">
              {currentTime || 'agora'} • em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

