'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  endDate: Date
  title?: string
  subtitle?: string
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  onExpire?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(endDate: Date): TimeLeft | null {
  const difference = endDate.getTime() - new Date().getTime()
  
  if (difference <= 0) return null
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export function CountdownTimer({
  endDate,
  title = 'Oferta termina em',
  subtitle,
  className = '',
  variant = 'default',
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft(endDate))

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endDate)
      setTimeLeft(newTimeLeft)
      
      if (!newTimeLeft && onExpire) {
        onExpire()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, onExpire])

  if (!mounted || !timeLeft) return null

  const timeUnits = [
    { value: timeLeft.days, label: 'dias' },
    { value: timeLeft.hours, label: 'horas' },
    { value: timeLeft.minutes, label: 'min' },
    { value: timeLeft.seconds, label: 'seg' },
  ]

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-foreground-secondary">{title}:</span>
        <span className="font-semibold text-foreground">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Clock className="w-5 h-5 text-primary" />
        <div className="flex gap-2">
          {timeUnits.map((unit, i) => (
            <div key={unit.label} className="text-center">
              <span className="text-lg font-bold text-foreground">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-xs text-foreground-secondary ml-0.5">{unit.label}</span>
              {i < timeUnits.length - 1 && <span className="text-foreground-secondary ml-2">:</span>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('bg-primary/5 border border-primary/20 rounded-xl p-5', className)}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{title}</span>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-3">
        {timeUnits.map((unit) => (
          <div key={unit.label} className="text-center">
            <div className="bg-background rounded-lg py-3 px-2 border border-border">
              <span className="text-2xl lg:text-3xl font-bold text-primary">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-foreground-secondary mt-1.5 block">{unit.label}</span>
          </div>
        ))}
      </div>

      {subtitle && (
        <p className="text-sm text-foreground-secondary text-center mt-4">{subtitle}</p>
      )}
    </div>
  )
}

