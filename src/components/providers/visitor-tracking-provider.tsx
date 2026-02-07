'use client'

import { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  createVisitorFingerprint,
  collectDeviceData,
  collectUTMParams,
  collectIdentityFromURL,
  getPageType,
  getSessionId,
  getStoredVisitorId,
  setStoredVisitorId,
  getFingerprintDbId,
  setFingerprintDbId,
  getSessionDbId,
  setSessionDbId,
  type InteractionType,
} from '@/lib/visitor-tracking'

interface VisitorTrackingContextType {
  visitorId: string | null
  sessionId: string | null
  trackInteraction: (type: InteractionType, metadata?: Record<string, unknown>) => void
  identifyVisitor: (data: { email?: string; phone?: string; name?: string }) => void
}

const VisitorTrackingContext = createContext<VisitorTrackingContextType>({
  visitorId: null,
  sessionId: null,
  trackInteraction: () => {},
  identifyVisitor: () => {},
})

export const useVisitorTracking = () => useContext(VisitorTrackingContext)

interface Props {
  children: ReactNode
}

export function VisitorTrackingProvider({ children }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const visitorIdRef = useRef<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const fingerprintDbIdRef = useRef<string | null>(null)
  const sessionDbIdRef = useRef<string | null>(null)
  const lastPathRef = useRef<string>('')
  const pageStartTimeRef = useRef<number>(Date.now())
  const initialized = useRef(false)

  // Initialize fingerprint and session
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      // Get or create visitor ID (fingerprint)
      let visitorId = getStoredVisitorId()
      if (!visitorId) {
        visitorId = await createVisitorFingerprint()
        setStoredVisitorId(visitorId)
      }
      visitorIdRef.current = visitorId

      // Get session ID
      const sessionId = getSessionId()
      sessionIdRef.current = sessionId

      // Get stored DB IDs
      fingerprintDbIdRef.current = getFingerprintDbId()
      sessionDbIdRef.current = getSessionDbId()

      // Initialize session with API
      try {
        const deviceData = collectDeviceData()
        const utmParams = collectUTMParams()

        const response = await fetch('/api/tracking/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id: visitorId,
            session_id: sessionId,
            device_data: deviceData,
            utm_params: utmParams,
            referrer_url: document.referrer || null,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.fingerprint_db_id) {
            setFingerprintDbId(data.fingerprint_db_id)
            fingerprintDbIdRef.current = data.fingerprint_db_id
          }
          if (data.session_db_id) {
            setSessionDbId(data.session_db_id)
            sessionDbIdRef.current = data.session_db_id
          }
        }

        // Check for identity in URL params
        const identityFromURL = collectIdentityFromURL()
        if (identityFromURL) {
          await fetch('/api/tracking/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fingerprint_db_id: fingerprintDbIdRef.current,
              source: 'url_param',
              ...identityFromURL,
            }),
          })
        }
      } catch (error) {
        console.error('[VisitorTracking] Init error:', error)
      }
    }

    init()
  }, [])

  // Track page views on navigation
  useEffect(() => {
    if (!visitorIdRef.current || !sessionIdRef.current) return
    if (pathname === lastPathRef.current) return

    // Calculate time on previous page
    const timeOnPrevPage = lastPathRef.current
      ? Math.round((Date.now() - pageStartTimeRef.current) / 1000)
      : 0

    // Update previous page time if we have a previous path
    if (lastPathRef.current && timeOnPrevPage > 0) {
      fetch('/api/tracking/page-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_db_id: sessionDbIdRef.current,
          page_path: lastPathRef.current,
          time_on_page_seconds: timeOnPrevPage,
        }),
      }).catch(() => {})
    }

    // Track new page view
    const pageType = getPageType(pathname)

    fetch('/api/tracking/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint_db_id: fingerprintDbIdRef.current,
        session_db_id: sessionDbIdRef.current,
        page_url: window.location.href,
        page_path: pathname,
        page_title: document.title,
        page_type: pageType,
      }),
    }).catch(() => {})

    lastPathRef.current = pathname
    pageStartTimeRef.current = Date.now()
  }, [pathname, searchParams])

  // Track interactions (WhatsApp clicks, form submits, etc.)
  const trackInteraction = useCallback((type: InteractionType, metadata?: Record<string, unknown>) => {
    if (!fingerprintDbIdRef.current || !sessionDbIdRef.current) return

    fetch('/api/tracking/interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint_db_id: fingerprintDbIdRef.current,
        session_db_id: sessionDbIdRef.current,
        type,
        page_path: pathname,
        metadata,
      }),
    }).catch(() => {})
  }, [pathname])

  // Identify visitor with email/phone
  const identifyVisitor = useCallback((data: { email?: string; phone?: string; name?: string }) => {
    if (!fingerprintDbIdRef.current) return

    fetch('/api/tracking/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint_db_id: fingerprintDbIdRef.current,
        source: 'form',
        ...data,
      }),
    }).catch(() => {})
  }, [])

  return (
    <VisitorTrackingContext.Provider
      value={{
        visitorId: visitorIdRef.current,
        sessionId: sessionIdRef.current,
        trackInteraction,
        identifyVisitor,
      }}
    >
      {children}
    </VisitorTrackingContext.Provider>
  )
}
