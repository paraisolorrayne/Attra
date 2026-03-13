/**
 * Homepage Analytics Tracking
 * Tracks CTA clicks, scroll depth, and content consumption
 */

interface AnalyticsEvent {
  event_name: string
  section?: string
  cta_type?: string
  cta_position?: string
  scroll_depth?: string
  content_type?: string
  engagement_time?: number
}

/**
 * Track CTA clicks
 */
export function trackCtaClick(
  ctaType: 'whatsapp' | 'request_vehicle' | 'learn_more' | 'schedule_visit',
  section: string,
  position?: 'floating_bar' | 'section' | 'inline'
) {
  if (window.gtag) {
    window.gtag('event', 'cta_click', {
      cta_type: ctaType,
      section: section,
      cta_position: position || 'section',
      page_path: window.location.pathname,
    })
  }

  // Custom tracking for analytics dashboard
  if (window.fetch) {
    fetch('/api/analytics/cta-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'cta_click',
        cta_type: ctaType,
        section: section,
        cta_position: position || 'section',
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail if analytics endpoint is not available
    })
  }
}

/**
 * Track scroll depth per section
 */
export function trackSectionScroll(sectionId: string, scrollPercentage: number) {
  if (window.gtag) {
    window.gtag('event', 'scroll_section', {
      section_id: sectionId,
      scroll_percentage: Math.round(scrollPercentage),
    })
  }

  if (window.fetch) {
    fetch('/api/analytics/scroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'section_scroll',
        section_id: sectionId,
        scroll_percentage: scrollPercentage,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  }
}

/**
 * Track content consumption
 */
export function trackContentConsumption(
  contentType: 'article' | 'vehicle' | 'section',
  contentId: string,
  engagementTime: number // in seconds
) {
  if (window.gtag) {
    window.gtag('event', 'content_consumption', {
      content_type: contentType,
      content_id: contentId,
      engagement_time: Math.round(engagementTime),
    })
  }

  if (window.fetch) {
    fetch('/api/analytics/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'content_consumption',
        content_type: contentType,
        content_id: contentId,
        engagement_time: engagementTime,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {})
  }
}

/**
 * Setup scroll tracking for homepage sections
 */
export function setupSectionTraking() {
  const sections = document.querySelectorAll('[data-section]')

  if (!sections.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const section = entry.target as HTMLElement
        const sectionId = section.getAttribute('data-section')

        if (!sectionId) return

        if (entry.isIntersecting) {
          // Section entered viewport
          trackSectionScroll(sectionId, entry.intersectionRatio * 100)
        }
      })
    },
    { threshold: [0.25, 0.5, 0.75, 1.0] }
  )

  sections.forEach((section) => observer.observe(section))

  return observer
}

// Global type extensions for analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export {}
