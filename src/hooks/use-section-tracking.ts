import { useEffect, useRef } from 'react'
import { trackSectionScroll, trackContentConsumption } from '@/lib/analytics-tracking'

/**
 * Hook para rastrear a visibilidade de uma seção
 * Dispara eventos de scroll e consumo de conteúdo quando a seção fica visível
 */
export function useSectionTracking(
  sectionId: string,
  contentType: 'article' | 'vehicle' | 'section' = 'section'
) {
  const sectionRef = useRef<HTMLElement>(null)
  const startTimeRef = useRef<number>(0)
  const hasTrackedRef = useRef<boolean>(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Section is visible
          if (!hasTrackedRef.current) {
            startTimeRef.current = Date.now()
            hasTrackedRef.current = true
            trackSectionScroll(sectionId, entry.intersectionRatio * 100)
          }

          // Track scroll depth as user scrolls through section
          const scrollPercentage = Math.round(entry.intersectionRatio * 100)
          if (scrollPercentage > 50 && !window.attra_section_50_tracked) {
            window.attra_section_50_tracked = true
            trackContentConsumption(contentType, sectionId, 10)
          }
        } else if (hasTrackedRef.current && startTimeRef.current > 0) {
          // User left the section
          const engagementTime = (Date.now() - startTimeRef.current) / 1000
          if (engagementTime > 2) {
            // Only track if spent more than 2 seconds
            trackContentConsumption(contentType, sectionId, engagementTime)
          }
          hasTrackedRef.current = false
        }
      },
      { threshold: [0.1, 0.25, 0.5, 0.75, 1.0] }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [sectionId, contentType])

  return sectionRef
}

// Declare global tracking properties
declare global {
  interface Window {
    attra_section_50_tracked?: boolean
  }
}
