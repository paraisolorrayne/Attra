import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for incoming WhatsApp webhook events
const whatsappEventSchema = z.object({
  eventType: z.enum([
    'whatsapp_click',
    'vehicle_inquiry',
    'financing_inquiry',
    'trade_in_inquiry',
    'general_inquiry',
  ]),
  timestamp: z.string().optional(),
  sourcePage: z.string(),
  context: z.object({
    vehicleId: z.string().optional(),
    vehicleBrand: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehiclePrice: z.number().optional(),
    userMessage: z.string().optional(),
    // dados livres enviados a partir de formulários; chave string, valor qualquer
    formData: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = whatsappEventSchema.parse(body)

    // Add timestamp if not provided
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    }

    // Log the event
    console.log('WhatsApp webhook event:', eventData)

    // Send to external webhook (CRM, analytics, etc.)
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': process.env.WEBHOOK_SECRET || '',
          },
          body: JSON.stringify(eventData),
        })
      } catch (webhookError) {
        console.error('Failed to send to external webhook:', webhookError)
        // Don't fail the request if external webhook fails
      }
    }

    // Here you could also:
    // 1. Save to Supabase for analytics
    // 2. Trigger notifications
    // 3. Update CRM records

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid event data', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verification endpoint for webhook setup
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const verifyToken = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (verifyToken === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 403 })
}

