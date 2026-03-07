import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST - Public endpoint for newsletter subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailClean)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: emailClean,
        is_active: true,
        source: source || 'site',
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' })

    if (error) {
      console.error('Error subscribing:', error)
      return NextResponse.json({ error: 'Erro ao cadastrar' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/newsletter/subscribe:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

