import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import type { LeadInsert, ClienteInsert, EventoLeadInsert, OrigemLead, InteresseTipo } from '@/types/database'

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
    vehicleCategory: z.string().optional(),
    userMessage: z.string().optional(),
    // Contact info from forms
    userName: z.string().optional(),
    userPhone: z.string().optional(),
    userEmail: z.string().optional(),
    // dados livres enviados a partir de formulários; chave string, valor qualquer
    formData: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
})

// Map event types to lead origins
const eventTypeToOrigem: Record<string, OrigemLead> = {
  'whatsapp_click': 'whatsapp',
  'vehicle_inquiry': 'site',
  'financing_inquiry': 'site',
  'trade_in_inquiry': 'site',
  'general_inquiry': 'site',
}

// Map event types to interest types
const eventTypeToInteresse: Record<string, InteresseTipo> = {
  'vehicle_inquiry': 'comprar',
  'financing_inquiry': 'comprar',
  'trade_in_inquiry': 'vender',
  'general_inquiry': 'comprar',
  'whatsapp_click': 'comprar',
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret for authentication
    const authHeader = request.headers.get('authorization') || request.headers.get('x-webhook-secret')
    const webhookSecret = process.env.WEBHOOK_SECRET

    if (!webhookSecret) {
      // In production, webhook secret must be configured
      if (process.env.NODE_ENV === 'production') {
        console.error('[WhatsApp Webhook] WEBHOOK_SECRET not configured in production')
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
      }
    } else if (authHeader !== `Bearer ${webhookSecret}` && authHeader !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = whatsappEventSchema.parse(body)

    // Add timestamp if not provided
    const eventData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    }

    // Log the event
    console.log('WhatsApp webhook event:', eventData)

    // Create lead in CRM
    const supabase = createAdminClient()
    let leadId: string | null = null
    let clienteId: string | null = null

    const context = data.context || {}
    const formData = context.formData || {}

    // Extract contact info from context or formData
    const userName = context.userName || formData.nome as string || formData.name as string || 'Lead WhatsApp'
    const userPhone = context.userPhone || formData.telefone as string || formData.phone as string || null
    const userEmail = context.userEmail || formData.email as string || null

    // Try to find or create cliente if we have contact info
    if (userPhone || userEmail) {
      // Check if cliente exists
      let existingCliente = null

      if (userPhone) {
        const { data: byPhone } = await supabase
          .from('clientes')
          .select('id')
          .eq('telefone', userPhone)
          .single()
        existingCliente = byPhone
      }

      if (!existingCliente && userEmail) {
        const { data: byEmail } = await supabase
          .from('clientes')
          .select('id')
          .eq('email', userEmail)
          .single()
        existingCliente = byEmail
      }

      if (existingCliente) {
        clienteId = existingCliente.id
      } else {
        // Create new cliente
        const clienteData: ClienteInsert = {
          nome: userName,
          telefone: userPhone,
          email: userEmail,
          origem_principal: eventTypeToOrigem[data.eventType] || 'whatsapp'
        }

        const { data: newCliente, error: clienteError } = await supabase
          .from('clientes')
          .insert(clienteData)
          .select('id')
          .single()

        if (!clienteError && newCliente) {
          clienteId = newCliente.id
        }
      }
    }

    // Create lead
    const leadData: LeadInsert = {
      nome: userName,
      telefone: userPhone,
      email: userEmail,
      origem: eventTypeToOrigem[data.eventType] || 'whatsapp',
      status: 'novo',
      prioridade: context.vehiclePrice && context.vehiclePrice > 500000 ? 'alta' : 'media',
      cliente_id: clienteId,
      interesse_tipo: eventTypeToInteresse[data.eventType] || 'comprar',
      marca_interesse: context.vehicleBrand || null,
      modelo_interesse: context.vehicleModel || null,
      categoria_interesse: context.vehicleCategory || null,
      faixa_preco_interesse_min: context.vehiclePrice ? context.vehiclePrice * 0.8 : null,
      faixa_preco_interesse_max: context.vehiclePrice ? context.vehiclePrice * 1.2 : null,
    }

    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select('id')
      .single()

    if (!leadError && newLead) {
      leadId = newLead.id

      // Create initial event
      const eventoData: EventoLeadInsert = {
        lead_id: leadId,
        tipo: 'primeiro_contato',
        descricao: `Lead criado via ${data.eventType} na página ${data.sourcePage}${context.userMessage ? `. Mensagem: ${context.userMessage}` : ''}`,
        responsavel: 'Sistema',
        webhook_disparado: true
      }

      await supabase.from('eventos_lead').insert(eventoData)
    }

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
          body: JSON.stringify({
            ...eventData,
            leadId,
            clienteId
          }),
        })
      } catch (webhookError) {
        console.error('Failed to send to external webhook:', webhookError)
        // Don't fail the request if external webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      received: true,
      leadId,
      clienteId
    })
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

