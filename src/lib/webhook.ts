import { WhatsAppWebhookPayload, WebhookResponse, GeoLocation } from '@/types'

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

  const location = geoLocation
    ? `${geoLocation.city}/${geoLocation.region}`
    : 'localização não identificada'

  return `Vim do site e tenho interesse no ${vehicle}, sou de ${location}.`
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
      message: 'Erro ao enviar mensagem. Por favor, tente novamente ou ligue para (34) 3256-3100.',
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

