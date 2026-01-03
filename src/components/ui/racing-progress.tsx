'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface RacingProgressProps {
  className?: string
}

export function RacingProgress({ className }: RacingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleStart = () => {
      setIsVisible(true)
      setProgress(0)
    }

    const handleProgress = () => {
      setProgress((prev) => Math.min(prev + Math.random() * 30, 90))
    }

    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => {
        setIsVisible(false)
        setProgress(0)
      }, 300)
    }

    // Listen for route changes (Next.js navigation)
    const handleRouteChangeStart = () => handleStart()
    const handleRouteChangeComplete = () => handleComplete()

    // Simulate progress during navigation
    let interval: NodeJS.Timeout

    const startProgress = () => {
      handleStart()
      interval = setInterval(handleProgress, 200)
    }

    const stopProgress = () => {
      clearInterval(interval)
      handleComplete()
    }

    // Listen for clicks on internal links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        startProgress()
        // Stop after a reasonable time if navigation doesn't complete
        setTimeout(stopProgress, 3000)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      clearInterval(interval)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-[100] h-1', className)}>
      {/* Track background */}
      <div className="absolute inset-0 bg-foreground-secondary/20" />
      
      {/* Progress bar with racing stripe effect */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      >
        {/* Racing car indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
          <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse" />
        </div>
        
        {/* Speed lines effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
      
      {/* Checkered flag at end */}
      {progress > 95 && (
        <div className="absolute right-0 top-0 bottom-0 w-8 flex">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-foreground' : 'bg-background'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

