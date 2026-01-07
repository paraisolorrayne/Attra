import { NextRequest, NextResponse } from 'next/server'

// N8N Webhook URL for AI chat
const LEADSTER_AI_CHAT_URL = process.env.NEXT_PUBLIC_LEADSTER_AI_WEBHOOK_URL ||
  'https://webhook.dexidigital.com.br/webhook/leadster_ia_attra'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  message: string
  sessionId: string
  history?: ChatMessage[]
  context?: {
    sourcePage?: string
    vehicleInfo?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, sessionId, history = [], context = {} } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Prepare payload for N8N webhook
    const payload = {
      eventType: 'chat_message',
      sessionId,
      message: message.trim(),
      history: history.slice(-10), // Last 10 messages for context
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        localTimestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      },
    }

    console.log('[Chat API] Sending to N8N:', { sessionId, messageLength: message.length })

    // Send to N8N webhook
    const response = await fetch(LEADSTER_AI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Chat API] N8N error:', response.status, errorText)
      
      // Return fallback response
      return NextResponse.json({
        success: true,
        response: 'Obrigado pela mensagem! Um consultor especializado entrará em contato em breve. Posso ajudar com mais alguma informação?',
        fallback: true,
      })
    }

    // Try to parse N8N response
    let aiResponse = ''
    try {
      const data = await response.json()
      aiResponse = data.response || data.message || data.output || data.text || ''
      
      // If N8N returns an array, get the first response
      if (Array.isArray(data) && data.length > 0) {
        aiResponse = data[0].response || data[0].message || data[0].output || JSON.stringify(data[0])
      }
    } catch {
      // If not JSON, try text
      aiResponse = await response.text()
    }

    // If no response, use fallback
    if (!aiResponse) {
      aiResponse = 'Obrigado pela sua mensagem! Como posso ajudar você com veículos hoje?'
    }

    console.log('[Chat API] AI response received:', aiResponse.substring(0, 100))

    return NextResponse.json({
      success: true,
      response: aiResponse,
    })

  } catch (error) {
    console.error('[Chat API] Error:', error)
    
    return NextResponse.json({
      success: true,
      response: 'Desculpe, tive um problema técnico. Um consultor entrará em contato em breve. Posso ajudar com algo mais?',
      error: true,
    })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'chat-api' })
}

