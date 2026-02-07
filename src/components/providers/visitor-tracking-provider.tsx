'use client'

import { createContext, useContext, useEffect, useRef, useCallback, ReactNode, useState } from 'react'
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
import {
  pushSessionStartEvent,
  pushVisitorIdentifiedEvent,
  setGA4UserProperties,
  type VisitorContext,
} from '@/hooks/use-analytics'
import { identifyClarityUser, setClarityTag } from '@/components/analytics/microsoft-clarity'

// Geolocation data type
interface GeolocationData {
  city: string
  region: string
  country: string
}

interface VisitorTrackingContextType {
  visitorId: string | null
  sessionId: string | null
  geolocation: GeolocationData | null
  deviceData: ReturnType<typeof collectDeviceData> | null
  utmParams: Record<string, string | null> | null
  getVisitorContext: () => VisitorContext
  trackInteraction: (type: InteractionType, metadata?: Record<string, unknown>) => void
  identifyVisitor: (data: { email?: string; phone?: string; name?: string }) => void
}

const VisitorTrackingContext = createContext<VisitorTrackingContextType>({
  visitorId: null,
  sessionId: null,
  geolocation: null,
  deviceData: null,
  utmParams: null,
  getVisitorContext: () => ({}),
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

  // State for enriched data (exposed via context)
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null)
  const [deviceData, setDeviceData] = useState<ReturnType<typeof collectDeviceData> | null>(null)
  const [utmParams, setUtmParams] = useState<Record<string, string | null> | null>(null)
  const referrerRef = useRef<string | null>(null)
  const landingPageRef = useRef<string | null>(null)

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
      console.log('[VisitorTracking] Initial fingerprintDbId from localStorage:', fingerprintDbIdRef.current)

      // Collect device data and UTM params
      const collectedDeviceData = collectDeviceData()
      const collectedUtmParams = collectUTMParams()
      setDeviceData(collectedDeviceData)
      setUtmParams(collectedUtmParams)
      referrerRef.current = document.referrer || null
      landingPageRef.current = window.location.pathname

      // Fetch geolocation
      let geoData: GeolocationData | null = null
      try {
        const geoResponse = await fetch('/api/geolocation')
        if (geoResponse.ok) {
          geoData = await geoResponse.json()
          setGeolocation(geoData)
        }
      } catch (e) {
        console.error('[VisitorTracking] Geolocation fetch error:', e)
      }

      // Initialize session with API
      try {
        const response = await fetch('/api/tracking/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id: visitorId,
            session_id: sessionId,
            device_data: collectedDeviceData,
            utm_params: collectedUtmParams,
            referrer_url: document.referrer || null,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('[VisitorTracking] Session API response:', data)
          if (data.fingerprint_db_id) {
            setFingerprintDbId(data.fingerprint_db_id)
            fingerprintDbIdRef.current = data.fingerprint_db_id
            console.log('[VisitorTracking] fingerprintDbId set:', data.fingerprint_db_id)
          }
          if (data.session_db_id) {
            setSessionDbId(data.session_db_id)
            sessionDbIdRef.current = data.session_db_id
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('[VisitorTracking] Session API error:', response.status, errorData)
        }

        // Push session_start event to dataLayer with all collected data
        pushSessionStartEvent(
          visitorId,
          sessionId,
          collectedDeviceData ? {
            device_type: collectedDeviceData.device_type,
            browser_name: collectedDeviceData.browser_name,
            os_name: collectedDeviceData.os_name,
            screen_resolution: collectedDeviceData.screen_resolution,
          } : undefined,
          collectedUtmParams,
          geoData ? {
            city: geoData.city,
            region: geoData.region,
            country: geoData.country,
          } : undefined
        )

        // Set Clarity tags for segmentation
        if (collectedDeviceData?.device_type) {
          setClarityTag('device_type', collectedDeviceData.device_type)
        }
        if (geoData?.city) {
          setClarityTag('user_city', geoData.city)
        }
        if (collectedUtmParams?.utm_source) {
          setClarityTag('utm_source', collectedUtmParams.utm_source)
        }

        // Identify visitor in Clarity with anonymous ID
        identifyClarityUser(visitorId, sessionId)

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

          // Push visitor_identified event to dataLayer
          pushVisitorIdentifiedEvent(
            'url_param',
            !!identityFromURL.email,
            !!identityFromURL.phone,
            false,
            {
              visitorId,
              sessionId,
              geolocation: geoData ? {
                city: geoData.city,
                region: geoData.region,
                country: geoData.country,
              } : undefined,
            }
          )

          // Set GA4 user properties (hashed for privacy)
          setGA4UserProperties({
            user_identified: true,
            identification_source: 'url_param',
            user_city: geoData?.city || 'unknown',
            user_region: geoData?.region || 'unknown',
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

  // Get current visitor context for enriching analytics events
  const getVisitorContext = useCallback((): VisitorContext => {
    return {
      visitorId: visitorIdRef.current || undefined,
      sessionId: sessionIdRef.current || undefined,
      fingerprintDbId: fingerprintDbIdRef.current || undefined,
      geolocation: geolocation ? {
        city: geolocation.city,
        region: geolocation.region,
        country: geolocation.country,
      } : undefined,
      device: deviceData ? {
        type: deviceData.device_type,
        browser: deviceData.browser_name,
        os: deviceData.os_name,
        screenResolution: deviceData.screen_resolution,
      } : undefined,
      traffic: {
        utmSource: utmParams?.utm_source || undefined,
        utmMedium: utmParams?.utm_medium || undefined,
        utmCampaign: utmParams?.utm_campaign || undefined,
        utmContent: utmParams?.utm_content || undefined,
        utmTerm: utmParams?.utm_term || undefined,
        referrer: referrerRef.current || undefined,
        landingPage: landingPageRef.current || undefined,
      },
    }
  }, [geolocation, deviceData, utmParams])

  // Track interactions (WhatsApp clicks, form submits, etc.)
  // Also pushes to dataLayer for analytics sync
  const trackInteraction = useCallback((type: InteractionType, metadata?: Record<string, unknown>) => {
    if (!fingerprintDbIdRef.current || !sessionDbIdRef.current) return

    // Send to internal tracking API
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

    // Map interaction type to analytics event and push to dataLayer
    // This syncs visitor tracking with GTM/GA4
    const analyticsEventMap: Record<InteractionType, string> = {
      'whatsapp_click': 'interaction_whatsapp',
      'phone_click': 'interaction_phone',
      'form_click': 'interaction_form_click',
      'form_submit': 'interaction_form_submit',
      'engine_sound_play': 'interaction_engine_sound',
      'calculator_use': 'interaction_calculator',
      'video_play': 'interaction_video',
      'gallery_view': 'interaction_gallery',
    }

    const analyticsEvent = analyticsEventMap[type]
    if (analyticsEvent && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: analyticsEvent,
        interaction_type: type,
        page_path: pathname,
        visitor_id: visitorIdRef.current,
        session_id: sessionIdRef.current,
        // Include geolocation for lead events
        ...(geolocation && {
          user_city: geolocation.city,
          user_region: geolocation.region,
          user_country: geolocation.country,
        }),
        // Include metadata
        ...metadata,
      })
    }
  }, [pathname, geolocation])

  // Identify visitor with email/phone - integrates with GA4 and Clarity
  const identifyVisitor = useCallback((data: { email?: string; phone?: string; name?: string }) => {
    console.log('[VisitorTracking] identifyVisitor called', {
      fingerprintDbId: fingerprintDbIdRef.current,
      hasEmail: !!data.email,
      hasPhone: !!data.phone,
      hasName: !!data.name,
    })

    if (!fingerprintDbIdRef.current) {
      console.warn('[VisitorTracking] Cannot identify: fingerprintDbId is null. Session may not be initialized yet.')
      return
    }

    // Send to internal tracking API
    fetch('/api/tracking/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint_db_id: fingerprintDbIdRef.current,
        source: 'form',
        ...data,
      }),
    })
      .then(async (res) => {
        const responseData = await res.json()
        if (res.ok) {
          console.log('[VisitorTracking] Identify success:', responseData)
        } else {
          console.error('[VisitorTracking] Identify API error:', responseData)
        }
      })
      .catch((err) => {
        console.error('[VisitorTracking] Identify fetch error:', err)
      })

    // Push visitor_identified event to dataLayer
    pushVisitorIdentifiedEvent(
      'form',
      !!data.email,
      !!data.phone,
      !!data.name,
      {
        visitorId: visitorIdRef.current || undefined,
        sessionId: sessionIdRef.current || undefined,
        geolocation: geolocation ? {
          city: geolocation.city,
          region: geolocation.region,
          country: geolocation.country,
        } : undefined,
      }
    )

    // Set GA4 user properties (LGPD: only status, not actual data)
    setGA4UserProperties({
      user_identified: true,
      identification_source: 'form',
      has_email: !!data.email,
      has_phone: !!data.phone,
      has_name: !!data.name,
      user_city: geolocation?.city || 'unknown',
      user_region: geolocation?.region || 'unknown',
    })

    // Set Clarity tags for identified user
    setClarityTag('user_identified', 'true')
    if (data.name) {
      // Only first name initial for privacy
      setClarityTag('user_initial', data.name.charAt(0).toUpperCase())
    }
  }, [geolocation])

  return (
    <VisitorTrackingContext.Provider
      value={{
        visitorId: visitorIdRef.current,
        sessionId: sessionIdRef.current,
        geolocation,
        deviceData,
        utmParams,
        getVisitorContext,
        trackInteraction,
        identifyVisitor,
      }}
    >
      {children}
    </VisitorTrackingContext.Provider>
  )
}
