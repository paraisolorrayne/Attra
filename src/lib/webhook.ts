import { WhatsAppWebhookPayload, WebhookResponse, GeoLocation } from '@/types'
import {
  collectBehavioralSignals,
  getFingerprintDbId,
  getSessionDbId,
  collectClickIds,
  collectUTMParams,
} from '@/lib/visitor-tracking'

// N8N Webhook URL (environment variable with fallback)
const WEBHOOK_URL = process.env.NEXT_PUBLIC_LEADSTER_SDR_WEBHOOK_URL ||
  'https://webhook.dexidigital.com.br/webhook/leadster_sdr_attra'

// Leadster Webhook URLs
const LEADSTER_WEBHOOK_URL = process.env.NEXT_PUBLIC_LEADSTER_WEBHOOK_URL ||
  'https://webhook.dexidigital.com.br/webhook/leadster_attra'
const LEADSTER_AI_WEBHOOK_URL = process.env.NEXT_PUBLIC_LEADSTER_AI_WEBHOOK_URL ||
  'https://webhook.dexidigital.com.br/webhook/leadster_ia_attra'

// Cache for geolocation to avoid multiple API calls
let cachedGeoLocation: GeoLocation | null = null

/**
 * Fetches user's geolocation using internal API route
 * This avoids CORS issues by making the request server-side
 */
export async function getGeoLocation(): Promise<GeoLocation | null> {
  // Return cached result if available
  if (cachedGeoLocation) {
    return cachedGeoLocation
  }

  try {
    // Use internal API route to fetch geolocation server-side
    const response = await fetch('/api/geolocation', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[GeoLocation] Failed to fetch:', response.status)
      return null
    }

    const data = await response.json()

    cachedGeoLocation = {
      city: data.city || 'Não identificada',
      region: data.region || 'Não identificada',
      country: data.country || 'Brasil',
      ip: data.ip || '',
    }

    console.log('[GeoLocation] Successfully fetched:', cachedGeoLocation.city, cachedGeoLocation.region)
    return cachedGeoLocation
  } catch (error) {
    console.error('[GeoLocation] Error fetching location:', error)
    return null
  }
}

/**
 * Generates formatted message with vehicle info and location
 * Gracefully handles cases where geolocation is unavailable or has invalid data
 */
export function generateVehicleMessage(
  vehicleBrand?: string,
  vehicleModel?: string,
  vehicleYear?: string | number,
  geoLocation?: GeoLocation | null
): string {
  const vehicle = vehicleBrand && vehicleModel
    ? `${vehicleBrand} ${vehicleModel}${vehicleYear ? ` ${vehicleYear}` : ''}`
    : 'um veículo'

  // Check if we have valid geolocation data
  // Gracefully omit location if city/region are undefined, empty, or "Não identificada"
  const hasValidLocation = geoLocation &&
    geoLocation.city &&
    geoLocation.region &&
    geoLocation.city !== 'Não identificada' &&
    geoLocation.region !== 'Não identificada'

  if (hasValidLocation) {
    return `Vim do site e tenho interesse no ${vehicle}, sou de ${geoLocation.city}/${geoLocation.region}.`
  }

  // Omit location entirely when unavailable for cleaner message
  return `Vim do site e tenho interesse no ${vehicle}.`
}

/**
 * Sends lead data to N8N webhook for automated SDR processing
 * Includes geolocation data and formatted message
 */
export async function sendWhatsAppWebhook(
  payload: Omit<WhatsAppWebhookPayload, 'timestamp' | 'sessionId' | 'pageUrl' | 'userAgent' | 'localTimestamp' | 'geoLocation'>,
  geoLocation?: GeoLocation | null
): Promise<WebhookResponse> {
  try {
    const sessionId = getSessionId()
    const now = new Date()

    // Generate formatted message with vehicle and location info
    const formattedMessage = generateVehicleMessage(
      payload.context.vehicleBrand,
      payload.context.vehicleModel,
      payload.context.vehicleYear,
      geoLocation
    )

    // Enhanced payload with additional context for N8N agent
    const enhancedPayload: WhatsAppWebhookPayload = {
      ...payload,
      context: {
        ...payload.context,
        userMessage: formattedMessage, // Override with formatted message
      },
      sessionId,
      timestamp: now.toISOString(),
      localTimestamp: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      geoLocation: geoLocation || undefined,
    }

    console.log('[Webhook] Sending to N8N:', enhancedPayload.eventType, enhancedPayload.sourcePage)
    console.log('[Webhook] Message:', formattedMessage)
    console.log('[Webhook] GeoLocation:', geoLocation?.city, geoLocation?.region)

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancedPayload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Webhook] N8N response error:', response.status, errorText)
      throw new Error(`Webhook failed: ${response.status}`)
    }

    console.log('[Webhook] Successfully sent to N8N')

    return {
      success: true,
      message: 'Mensagem enviada! Nossa equipe entrará em contato em breve.',
    }
  } catch (error) {
    console.error('[Webhook] Error sending to N8N:', error)

    return {
      success: false,
      message: 'Erro ao enviar mensagem. Por favor, tente novamente ou ligue para (34) 3014-3232.',
    }
  }
}

/**
 * Gets or creates a unique session ID for tracking user journey
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('attra_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem('attra_session_id', sessionId)
  }
  return sessionId
}

/**
 * Sends lead data to Leadster WITHOUT AI processing
 * Used for estoque page - redirects to WhatsApp after
 */
export async function sendToLeadsterWithoutAI(
  payload: Omit<WhatsAppWebhookPayload, 'timestamp' | 'sessionId' | 'pageUrl' | 'userAgent' | 'localTimestamp'>
): Promise<WebhookResponse> {
  try {
    const sessionId = getSessionId()
    const now = new Date()

    const enhancedPayload: WhatsAppWebhookPayload = {
      ...payload,
      sessionId,
      timestamp: now.toISOString(),
      localTimestamp: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    }

    console.log('[Leadster] Sending to Leadster (no AI):', enhancedPayload.eventType, enhancedPayload.sourcePage)

    const response = await fetch(LEADSTER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancedPayload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Leadster] Response error:', response.status, errorText)
      throw new Error(`Leadster webhook failed: ${response.status}`)
    }

    console.log('[Leadster] Successfully sent (no AI)')

    return {
      success: true,
      message: 'Conectando você ao WhatsApp...',
    }
  } catch (error) {
    console.error('[Leadster] Error sending (no AI):', error)

    return {
      success: false,
      message: 'Erro ao conectar. Redirecionando para WhatsApp...',
    }
  }
}

/**
 * Sends lead data to Leadster WITH AI processing
 * Used for general pages - opens chat widget on site
 */
export async function sendToLeadsterWithAI(
  payload: Omit<WhatsAppWebhookPayload, 'timestamp' | 'sessionId' | 'pageUrl' | 'userAgent' | 'localTimestamp'>
): Promise<WebhookResponse> {
  try {
    const sessionId = getSessionId()
    const now = new Date()

    const enhancedPayload: WhatsAppWebhookPayload = {
      ...payload,
      sessionId,
      timestamp: now.toISOString(),
      localTimestamp: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    }

    console.log('[Leadster AI] Sending to Leadster with AI:', enhancedPayload.eventType, enhancedPayload.sourcePage)

    const response = await fetch(LEADSTER_AI_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancedPayload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Leadster AI] Response error:', response.status, errorText)
      throw new Error(`Leadster AI webhook failed: ${response.status}`)
    }

    console.log('[Leadster AI] Successfully sent with AI')

    return {
      success: true,
      message: 'Chat iniciado! Como posso ajudar?',
    }
  } catch (error) {
    console.error('[Leadster AI] Error sending:', error)

    return {
      success: false,
      message: 'Erro ao iniciar chat. Por favor, tente novamente.',
    }
  }
}

/**
 * Chat message type for conversation history
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Chat response from AI
 */
export interface ChatResponse {
  success: boolean
  response: string
  fallback?: boolean
  error?: boolean
}

/**
 * Sends a chat message and gets AI response
 * Uses internal API route to avoid CORS issues
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  context?: { sourcePage?: string; vehicleInfo?: string }
): Promise<ChatResponse> {
  try {
    const sessionId = getSessionId()

    console.log('[Chat] Sending message:', message.substring(0, 50))

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        history,
        context,
      }),
    })

    if (!response.ok) {
      throw new Error(`Chat API failed: ${response.status}`)
    }

    const data = await response.json()

    console.log('[Chat] Response received:', data.response?.substring(0, 50))

    return {
      success: true,
      response: data.response || 'Como posso ajudar?',
      fallback: data.fallback,
      error: data.error,
    }
  } catch (error) {
    console.error('[Chat] Error:', error)

    return {
      success: false,
      response: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
      error: true,
    }
  }
}



/**
 * Sends abandoned lead data to the server-side API route using sendBeacon.
 * This ensures the request completes even during page unload (exit intent / tab close).
 *
 * The server route validates identifiable data, logs the event, and forwards to N8N.
 *
 * @param reason - 'exit_intent' | 'beforeunload'
 * @param geolocation - Cached geolocation data
 */
export function sendAbandonedLeadWebhook(
  reason: 'exit_intent' | 'beforeunload',
  geolocation?: GeoLocation | null,
): boolean {
  if (typeof window === 'undefined') return false

  const fingerprintDbId = getFingerprintDbId()
  const sessionDbId = getSessionDbId()

  if (!fingerprintDbId) {
    console.log('[Abandoned] No fingerprint_db_id, skipping')
    return false
  }

  const payload = JSON.stringify({
    fingerprint_db_id: fingerprintDbId,
    session_db_id: sessionDbId,
    reason,
    behavioral_signals: collectBehavioralSignals(),
    geolocation: geolocation || null,
    utm_params: collectUTMParams(),
    click_ids: collectClickIds(),
  })

  // Use sendBeacon for reliable delivery during page unload
  // Falls back to fetch with keepalive if sendBeacon is unavailable
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' })
    const sent = navigator.sendBeacon('/api/tracking/abandoned', blob)
    console.log('[Abandoned] sendBeacon result:', sent, 'reason:', reason)
    return sent
  }

  // Fallback: fetch with keepalive (still reliable during unload)
  fetch('/api/tracking/abandoned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(err => console.error('[Abandoned] Fetch fallback error:', err))

  console.log('[Abandoned] Sent via fetch keepalive, reason:', reason)
  return true
}