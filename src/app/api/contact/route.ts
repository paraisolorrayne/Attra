import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendNotification, logNotificationEvent, NotificationType } from '@/lib/notifications'

const contactSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().optional(),
  message: z.string().optional(),
  sourcePage: z.string().optional(),
  formType: z.string().optional(), // To specify the type of form
  // Additional fields for specific forms
  vehicleValue: z.string().optional(),
  downPayment: z.string().optional(),
  installments: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  mileage: z.string().optional(),
  condition: z.string().optional(),
  yearMin: z.string().optional(),
  yearMax: z.string().optional(),
  budgetMax: z.string().optional(),
  details: z.string().optional(),
})

// Map form types to notification types
function getNotificationType(formType?: string, sourcePage?: string): NotificationType {
  if (formType) {
    const typeMap: Record<string, NotificationType> = {
      'contact': 'contact_form',
      'lead_magnet': 'lead_magnet',
      'vehicle_alert': 'vehicle_alert',
      'vehicle_inquiry': 'vehicle_inquiry',
      'financing': 'financing_inquiry',
      'trade_in': 'trade_in_inquiry',
      'general': 'general_inquiry',
    }
    return typeMap[formType] || 'contact_form'
  }

  // Infer from source page if formType not provided
  if (sourcePage) {
    if (sourcePage.includes('financiamento')) return 'financing_inquiry'
    if (sourcePage.includes('vender') || sourcePage.includes('troca')) return 'trade_in_inquiry'
    if (sourcePage.includes('veiculo') || sourcePage.includes('estoque')) return 'vehicle_inquiry'
    if (sourcePage.includes('lead_magnet') || sourcePage.includes('guia')) return 'lead_magnet'
    if (sourcePage.includes('alerta')) return 'vehicle_alert'
  }

  return 'contact_form'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    console.log('[Contact API] Form submission received:', data.name, data.email)

    // Determine notification type
    const notificationType = getNotificationType(data.formType, data.sourcePage)

    // Build metadata from additional fields
    const metadata: Record<string, unknown> = {}
    if (data.vehicleValue) metadata.vehicleValue = data.vehicleValue
    if (data.downPayment) metadata.downPayment = data.downPayment
    if (data.installments) metadata.installments = data.installments
    if (data.brand) metadata.brand = data.brand
    if (data.model) metadata.model = data.model
    if (data.year) metadata.year = data.year
    if (data.mileage) metadata.mileage = data.mileage
    if (data.condition) metadata.condition = data.condition
    if (data.yearMin) metadata.yearMin = data.yearMin
    if (data.yearMax) metadata.yearMax = data.yearMax
    if (data.budgetMax) metadata.budgetMax = data.budgetMax
    if (data.details) metadata.details = data.details

    // Send email and WhatsApp notifications
    const notificationResult = await sendNotification({
      type: notificationType,
      senderName: data.name,
      senderEmail: data.email,
      senderPhone: data.phone,
      subject: data.subject,
      message: data.message,
      sourcePage: data.sourcePage,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    })

    // Log notification event for monitoring
    logNotificationEvent(notificationType, notificationResult.email.success || notificationResult.whatsapp.success, {
      email: notificationResult.email,
      whatsapp: notificationResult.whatsapp,
      senderEmail: data.email,
      sourcePage: data.sourcePage,
    })

    // Also send to CRM webhook if configured
    const crmWebhookUrl = process.env.CRM_WEBHOOK_URL
    if (crmWebhookUrl) {
      try {
        await fetch(crmWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: notificationType,
            data: {
              ...data,
              timestamp: new Date().toISOString(),
              source: 'website',
            },
          }),
        })
      } catch (crmError) {
        console.error('[Contact API] CRM webhook error:', crmError)
        // Don't fail the request if CRM webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      notifications: {
        email: notificationResult.email.success,
        whatsapp: notificationResult.whatsapp.success,
      }
    })
  } catch (error) {
    console.error('[Contact API] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}

