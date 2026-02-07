import { Resend } from 'resend'
import { WHATSAPP_NUMBER } from './constants'

// Lazy-loaded Resend client instance to avoid build-time errors
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// Notification email destination
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'faleconosco@attraveiculos.com.br'

// N8N Webhook URL for WhatsApp notifications
const WHATSAPP_NOTIFICATION_WEBHOOK_URL = process.env.WHATSAPP_NOTIFICATION_WEBHOOK_URL ||
  process.env.NEXT_PUBLIC_LEADSTER_SDR_WEBHOOK_URL ||
  'https://webhook.dexidigital.com.br/webhook/leadster_sdr_attra'

// Email notification types
export type NotificationType = 
  | 'contact_form'
  | 'lead_magnet'
  | 'vehicle_alert'
  | 'vehicle_inquiry'
  | 'financing_inquiry'
  | 'trade_in_inquiry'
  | 'general_inquiry'

// Base notification data structure
export interface NotificationData {
  type: NotificationType
  senderName: string
  senderEmail: string
  senderPhone?: string
  subject?: string
  message?: string
  sourcePage?: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

// Email send result
export interface EmailResult {
  success: boolean
  emailId?: string
  error?: string
}

// WhatsApp notification result
export interface WhatsAppNotificationResult {
  success: boolean
  error?: string
}

// Combined notification result
export interface NotificationResult {
  email: EmailResult
  whatsapp: WhatsAppNotificationResult
}

/**
 * Generates email HTML template based on notification type
 */
function generateEmailTemplate(data: NotificationData): string {
  const timestamp = data.timestamp || new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  
  const typeLabels: Record<NotificationType, string> = {
    contact_form: '📩 Formulário de Contato',
    lead_magnet: '📚 Download de Material',
    vehicle_alert: '🔔 Alerta de Veículos',
    vehicle_inquiry: '🚗 Interesse em Veículo',
    financing_inquiry: '💳 Consulta de Financiamento',
    trade_in_inquiry: '🔄 Avaliação de Troca',
    general_inquiry: '💬 Consulta Geral',
  }

  const typeLabel = typeLabels[data.type] || '📬 Nova Notificação'
  
  // Build metadata section if present
  let metadataHtml = ''
  if (data.metadata && Object.keys(data.metadata).length > 0) {
    metadataHtml = `
      <tr>
        <td style="padding: 20px 0 10px 0; border-top: 1px solid #eee;">
          <strong style="color: #333;">Informações Adicionais:</strong>
        </td>
      </tr>
      ${Object.entries(data.metadata).map(([key, value]) => `
        <tr>
          <td style="padding: 5px 0; color: #666;">
            <strong>${formatMetadataKey(key)}:</strong> ${value}
          </td>
        </tr>
      `).join('')}
    `
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${typeLabel}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #C9A55C; margin: 0; font-size: 24px;">${typeLabel}</h1>
    <p style="color: #ccc; margin: 10px 0 0 0; font-size: 14px;">Attra Veículos - Nova Notificação</p>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0;">
          <strong style="color: #333;">Nome:</strong>
          <span style="color: #666; margin-left: 10px;">${data.senderName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0;">
          <strong style="color: #333;">E-mail:</strong>
          <a href="mailto:${data.senderEmail}" style="color: #C9A55C; margin-left: 10px;">${data.senderEmail}</a>
        </td>
      </tr>
      ${data.senderPhone ? `
      <tr>
        <td style="padding: 10px 0;">
          <strong style="color: #333;">Telefone:</strong>
          <a href="tel:${data.senderPhone}" style="color: #C9A55C; margin-left: 10px;">${data.senderPhone}</a>
        </td>
      </tr>
      ` : ''}
      ${data.subject ? `
      <tr>
        <td style="padding: 10px 0;">
          <strong style="color: #333;">Assunto:</strong>
          <span style="color: #666; margin-left: 10px;">${data.subject}</span>
        </td>
      </tr>
      ` : ''}
      ${data.message ? `
      <tr>
        <td style="padding: 20px 0 10px 0; border-top: 1px solid #eee;">
          <strong style="color: #333;">Mensagem:</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 15px; background: #f9f9f9; border-radius: 8px; color: #555;">
          ${data.message.replace(/\n/g, '<br>')}
        </td>
      </tr>
      ` : ''}
      ${metadataHtml}
    </table>
  </div>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="margin: 0; color: #888; font-size: 12px;">
      📍 Origem: ${data.sourcePage || 'Site'} | 🕐 ${timestamp}
    </p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Formats metadata keys for display
 */
function formatMetadataKey(key: string): string {
  const keyMap: Record<string, string> = {
    vehicleValue: 'Valor do Veículo',
    downPayment: 'Entrada',
    installments: 'Parcelas',
    brand: 'Marca',
    model: 'Modelo',
    year: 'Ano',
    mileage: 'Quilometragem',
    condition: 'Condição',
    yearMin: 'Ano Mínimo',
    yearMax: 'Ano Máximo',
    budgetMax: 'Orçamento Máximo',
    details: 'Detalhes',
    brands: 'Marcas de Interesse',
  }
  return keyMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

/**
 * Generates email subject based on notification type
 */
function generateEmailSubject(data: NotificationData): string {
  const typeSubjects: Record<NotificationType, string> = {
    contact_form: `📩 Contato: ${data.subject || 'Novo contato via site'}`,
    lead_magnet: `📚 Download: ${data.senderName} baixou material`,
    vehicle_alert: `🔔 Alerta: ${data.senderName} ativou alertas de veículos`,
    vehicle_inquiry: `🚗 Interesse: ${data.senderName} quer saber sobre veículo`,
    financing_inquiry: `💳 Financiamento: Consulta de ${data.senderName}`,
    trade_in_inquiry: `🔄 Troca: ${data.senderName} quer avaliar veículo`,
    general_inquiry: `💬 Consulta: ${data.senderName}`,
  }
  return typeSubjects[data.type] || `Nova notificação: ${data.senderName}`
}

/**
 * Sends email notification via Resend API
 */
export async function sendEmailNotification(data: NotificationData): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not configured, skipping email')
      return { success: false, error: 'RESEND_API_KEY not configured' }
    }

    const subject = generateEmailSubject(data)
    const html = generateEmailTemplate(data)
    const timestamp = data.timestamp || new Date().toISOString()

    console.log(`[Email] Sending ${data.type} notification to ${NOTIFICATION_EMAIL}`)

    const { data: result, error } = await getResendClient().emails.send({
      from: 'Attra Veículos <notificacoes@attraveiculos.com.br>',
      to: [NOTIFICATION_EMAIL],
      replyTo: data.senderEmail,
      subject,
      html,
      tags: [
        { name: 'type', value: data.type },
        { name: 'source', value: data.sourcePage || 'unknown' },
      ],
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log(`[Email] Successfully sent, ID: ${result?.id}`)
    return { success: true, emailId: result?.id }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email] Error sending notification:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Sends WhatsApp notification via N8N webhook
 */
export async function sendWhatsAppNotification(data: NotificationData): Promise<WhatsAppNotificationResult> {
  try {
    const timestamp = data.timestamp || new Date().toISOString()
    const localTimestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    const typeLabels: Record<NotificationType, string> = {
      contact_form: 'Formulário de Contato',
      lead_magnet: 'Download de Material',
      vehicle_alert: 'Alerta de Veículos',
      vehicle_inquiry: 'Interesse em Veículo',
      financing_inquiry: 'Consulta de Financiamento',
      trade_in_inquiry: 'Avaliação de Troca',
      general_inquiry: 'Consulta Geral',
    }

    const payload = {
      eventType: 'email_notification',
      notificationType: data.type,
      notificationLabel: typeLabels[data.type] || data.type,
      whatsappNumber: WHATSAPP_NUMBER,
      sourcePage: data.sourcePage || 'site',
      timestamp,
      localTimestamp,
      sender: {
        name: data.senderName,
        email: data.senderEmail,
        phone: data.senderPhone,
      },
      subject: data.subject,
      message: data.message,
      metadata: data.metadata,
    }

    console.log(`[WhatsApp] Sending notification for ${data.type}`)

    const response = await fetch(WHATSAPP_NOTIFICATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET || '',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[WhatsApp] Webhook error:', response.status, errorText)
      return { success: false, error: `Webhook failed: ${response.status}` }
    }

    console.log('[WhatsApp] Successfully sent notification')
    return { success: true }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[WhatsApp] Error sending notification:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Sends both email and WhatsApp notifications
 * WhatsApp is triggered after successful email delivery
 */
export async function sendNotification(data: NotificationData): Promise<NotificationResult> {
  // Add timestamp if not present
  const notificationData: NotificationData = {
    ...data,
    timestamp: data.timestamp || new Date().toISOString(),
  }

  // Send email first
  const emailResult = await sendEmailNotification(notificationData)

  // Send WhatsApp notification after email (regardless of email success for redundancy)
  const whatsappResult = await sendWhatsAppNotification(notificationData)

  // Log combined result
  console.log(`[Notification] Complete - Email: ${emailResult.success}, WhatsApp: ${whatsappResult.success}`)

  return {
    email: emailResult,
    whatsapp: whatsappResult,
  }
}

/**
 * Logs notification event for monitoring
 */
export function logNotificationEvent(
  type: NotificationType,
  success: boolean,
  details: Record<string, unknown>
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    success,
    ...details,
  }

  if (success) {
    console.log('[Notification Event]', JSON.stringify(logEntry))
  } else {
    console.error('[Notification Event - Failed]', JSON.stringify(logEntry))
  }
}

