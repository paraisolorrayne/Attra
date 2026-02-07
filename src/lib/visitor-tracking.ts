/**
 * Visitor Tracking & Fingerprinting Library
 * Captures visitor data for lead intelligence
 */

// Session storage keys
const VISITOR_ID_KEY = 'attra_visitor_id'
const SESSION_ID_KEY = 'attra_session_id'
const FINGERPRINT_DB_ID_KEY = 'attra_fingerprint_db_id'
const SESSION_DB_ID_KEY = 'attra_session_db_id'

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Get or create session ID (resets after 30 min inactivity)
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  const existing = sessionStorage.getItem(SESSION_ID_KEY)
  if (existing) return existing

  const newSessionId = generateId()
  sessionStorage.setItem(SESSION_ID_KEY, newSessionId)
  return newSessionId
}

// Get stored DB IDs
export function getFingerprintDbId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(FINGERPRINT_DB_ID_KEY)
}

export function getSessionDbId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(SESSION_DB_ID_KEY)
}

export function setFingerprintDbId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FINGERPRINT_DB_ID_KEY, id)
}

export function setSessionDbId(id: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_DB_ID_KEY, id)
}

// Get stored visitor ID
export function getStoredVisitorId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VISITOR_ID_KEY)
}

export function setStoredVisitorId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(VISITOR_ID_KEY, id)
}

// Collect device data for fingerprinting
export function collectDeviceData() {
  if (typeof window === 'undefined') return null

  const nav = navigator
  const screen = window.screen

  return {
    // Browser info
    browser_name: getBrowserName(),
    browser_version: getBrowserVersion(),

    // OS info
    os_name: getOSName(),
    os_version: getOSVersion(),

    // Device info
    device_type: getDeviceType(),
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: nav.language,

    // Additional fingerprint components
    color_depth: screen.colorDepth,
    pixel_ratio: window.devicePixelRatio,
    touch_support: 'ontouchstart' in window,
    cookies_enabled: nav.cookieEnabled,
    do_not_track: nav.doNotTrack === '1',
    hardware_concurrency: nav.hardwareConcurrency || null,
    platform: nav.platform,
  }
}

// Collect UTM parameters from URL
export function collectUTMParams(): Record<string, string | null> {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)

  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  }
}

// Check for identity params in URL (email, phone, etc.)
export function collectIdentityFromURL(): { email?: string; phone?: string } | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const result: { email?: string; phone?: string } = {}

  // Common email parameter names
  const emailParams = ['email', 'e', 'mail', 'em']
  for (const param of emailParams) {
    const value = params.get(param)
    if (value && value.includes('@')) {
      result.email = decodeURIComponent(value)
      break
    }
  }

  // Common phone parameter names
  const phoneParams = ['phone', 'tel', 'telefone', 'celular', 'p']
  for (const param of phoneParams) {
    const value = params.get(param)
    if (value && /[\d\s\-\(\)]+/.test(value)) {
      result.phone = decodeURIComponent(value).replace(/\D/g, '')
      break
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

// Determine page type from URL
export function getPageType(pathname: string): string {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/veiculos/') && pathname.split('/').length > 2) return 'vehicle'
  if (pathname === '/veiculos') return 'vehicles'
  if (pathname.startsWith('/blog')) return 'blog'
  if (pathname.startsWith('/contato')) return 'contact'
  if (pathname.startsWith('/sobre') || pathname.startsWith('/quem-somos')) return 'about'
  return 'other'
}

// Helper functions for device detection
function getBrowserName(): string {
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return 'Unknown'
}

function getBrowserVersion(): string {
  const ua = navigator.userAgent
  const match = ua.match(/(Firefox|SamsungBrowser|Opera|OPR|Edg|Chrome|Safari|Version)\/(\d+(\.\d+)?)/)
  return match ? match[2] : 'Unknown'
}

function getOSName(): string {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS X') || ua.includes('Macintosh')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Unknown'
}

function getOSVersion(): string {
  const ua = navigator.userAgent

  // Windows
  const winMatch = ua.match(/Windows NT (\d+\.\d+)/)
  if (winMatch) {
    const versions: Record<string, string> = {
      '10.0': '10/11',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
    }
    return versions[winMatch[1]] || winMatch[1]
  }

  // macOS
  const macMatch = ua.match(/Mac OS X (\d+[._]\d+([._]\d+)?)/)
  if (macMatch) return macMatch[1].replace(/_/g, '.')

  // iOS
  const iosMatch = ua.match(/OS (\d+_\d+(_\d+)?)/)
  if (iosMatch) return iosMatch[1].replace(/_/g, '.')

  // Android
  const androidMatch = ua.match(/Android (\d+(\.\d+)?)/)
  if (androidMatch) return androidMatch[1]

  return 'Unknown'
}

function getDeviceType(): string {
  const ua = navigator.userAgent

  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile'
  return 'desktop'
}

// Create a simple hash for fingerprinting (no external dependencies)
export async function createVisitorFingerprint(): Promise<string> {
  const data = collectDeviceData()
  if (!data) return generateId()

  // Create fingerprint string from device characteristics
  const components = [
    data.browser_name,
    data.os_name,
    data.screen_resolution,
    data.timezone,
    data.language,
    data.color_depth,
    data.pixel_ratio,
    data.touch_support,
    data.hardware_concurrency,
    data.platform,
  ].filter(Boolean).join('|')

  // Create hash using SubtleCrypto if available
  if (window.crypto?.subtle) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(components)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback: simple hash
  let hash = 0
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// Track page view
export interface PageViewData {
  page_url: string
  page_path: string
  page_title: string
  page_type: string
  vehicle_id?: string
  vehicle_slug?: string
  vehicle_brand?: string
  vehicle_model?: string
  vehicle_price?: number
}

// Track interaction events
export type InteractionType =
  | 'whatsapp_click'
  | 'phone_click'
  | 'form_click'
  | 'form_submit'
  | 'engine_sound_play'
  | 'calculator_use'
  | 'video_play'
  | 'gallery_view'

export interface InteractionData {
  type: InteractionType
  page_path: string
  vehicle_id?: string
  metadata?: Record<string, unknown>
}
