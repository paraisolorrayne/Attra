import { WhatsAppWebhookPayload, WebhookResponse } from '@/types'

// N8N Webhook URL (environment variable with fallback)
const WEBHOOK_URL = process.env.NEXT_PUBLIC_LEADSTER_SDR_WEBHOOK_URL ||
  'https://webhook.dexidigital.com.br/webhook/leadster_sdr_attra'

/**
 * Sends lead data to N8N webhook for automated SDR processing
 * Maintains compatibility with existing component calls
 */
export async function sendWhatsAppWebhook(
  payload: Omit<WhatsAppWebhookPayload, 'timestamp' | 'sessionId' | 'pageUrl' | 'userAgent' | 'localTimestamp'>
): Promise<WebhookResponse> {
  try {
    const sessionId = getSessionId()
    const now = new Date()

    // Enhanced payload with additional context for N8N agent
    const enhancedPayload: WhatsAppWebhookPayload = {
      ...payload,
      sessionId,
      timestamp: now.toISOString(),
      localTimestamp: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    }

    console.log('[Webhook] Sending to N8N:', enhancedPayload.eventType, enhancedPayload.sourcePage)

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

