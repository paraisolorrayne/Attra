import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  sendNotification, 
  sendEmailNotification, 
  sendWhatsAppNotification,
  logNotificationEvent,
  NotificationType 
} from '@/lib/notifications'

// Schema for notification requests
const notificationSchema = z.object({
  type: z.enum([
    'contact_form',
    'lead_magnet', 
    'vehicle_alert',
    'vehicle_inquiry',
    'financing_inquiry',
    'trade_in_inquiry',
    'general_inquiry',
  ]),
  senderName: z.string().min(1),
  senderEmail: z.string().email(),
  senderPhone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  sourcePage: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  // Options for notification channels
  channels: z.object({
    email: z.boolean().optional().default(true),
    whatsapp: z.boolean().optional().default(true),
  }).optional(),
})

/**
 * POST /api/notifications
 * 
 * Unified endpoint for sending notifications via email and WhatsApp
 * 
 * Request body:
 * {
 *   type: NotificationType,
 *   senderName: string,
 *   senderEmail: string,
 *   senderPhone?: string,
 *   subject?: string,
 *   message?: string,
 *   sourcePage?: string,
 *   metadata?: Record<string, unknown>,
 *   channels?: { email?: boolean, whatsapp?: boolean }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authorization (optional - for internal use)
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.WEBHOOK_SECRET
    
    // If webhook secret is set, require authorization
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      // Allow requests without auth for now (internal API calls)
      // Uncomment below to enforce auth:
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = notificationSchema.parse(body)

    console.log(`[Notifications API] Received ${data.type} notification request`)

    const timestamp = new Date().toISOString()
    const notificationData = {
      type: data.type as NotificationType,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      senderPhone: data.senderPhone,
      subject: data.subject,
      message: data.message,
      sourcePage: data.sourcePage,
      metadata: data.metadata,
      timestamp,
    }

    const channels = data.channels || { email: true, whatsapp: true }
    
    // Send notifications based on channels config
    let emailResult = { success: false, error: 'Channel disabled' }
    let whatsappResult = { success: false, error: 'Channel disabled' }

    if (channels.email !== false) {
      emailResult = await sendEmailNotification(notificationData)
    }

    if (channels.whatsapp !== false) {
      whatsappResult = await sendWhatsAppNotification(notificationData)
    }

    // Log the notification event
    const overallSuccess = emailResult.success || whatsappResult.success
    logNotificationEvent(data.type as NotificationType, overallSuccess, {
      email: emailResult,
      whatsapp: whatsappResult,
      senderEmail: data.senderEmail,
      sourcePage: data.sourcePage,
    })

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess ? 'Notificação enviada com sucesso' : 'Falha ao enviar notificação',
      results: {
        email: emailResult,
        whatsapp: whatsappResult,
      },
      timestamp,
    })

  } catch (error) {
    console.error('[Notifications API] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erro interno ao processar notificação' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notifications
 * 
 * Health check endpoint for the notifications service
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'notifications',
    timestamp: new Date().toISOString(),
    config: {
      resendConfigured: !!process.env.RESEND_API_KEY,
      notificationEmail: process.env.NOTIFICATION_EMAIL || 'faleconosco@attraveiculos.com.br',
      whatsappWebhookConfigured: !!(process.env.WHATSAPP_NOTIFICATION_WEBHOOK_URL || process.env.NEXT_PUBLIC_LEADSTER_SDR_WEBHOOK_URL),
    },
  })
}

