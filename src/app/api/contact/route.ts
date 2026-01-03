import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().optional(),
  message: z.string().optional(),
  sourcePage: z.string().optional(),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Here you would:
    // 1. Save to Supabase
    // 2. Send to CRM webhook
    // 3. Send email notification
    // 4. Trigger WhatsApp notification

    // For now, we'll just log and return success
    console.log('Contact form submission:', data)

    // Example: Send to CRM webhook
    const crmWebhookUrl = process.env.CRM_WEBHOOK_URL
    if (crmWebhookUrl) {
      await fetch(crmWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_form',
          data: {
            ...data,
            timestamp: new Date().toISOString(),
            source: 'website',
          },
        }),
      })
    }

    return NextResponse.json({ success: true, message: 'Mensagem enviada com sucesso!' })
  } catch (error) {
    console.error('Contact form error:', error)
    
    if (error instanceof z.ZodError) {
      // Zod v4 expõe os detalhes de validação em `issues`, não em `errors`
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

