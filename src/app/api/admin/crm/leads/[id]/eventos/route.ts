import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { EventoLeadInsert } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/crm/leads/:id/eventos - List lead events
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: eventos, error } = await supabase
      .from('eventos_lead')
      .select('*')
      .eq('lead_id', id)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Lead events query error:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: eventos
    })
  } catch (error) {
    console.error('Lead events API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/crm/leads/:id/eventos - Create lead event
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.tipo) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const eventoData: EventoLeadInsert = {
      lead_id: id,
      tipo: body.tipo,
      descricao: body.descricao || null,
      proximo_contato_em: body.proximo_contato_em || null,
      responsavel: body.responsavel || 'Sistema',
      webhook_disparado: false
    }

    const { data: evento, error } = await supabase
      .from('eventos_lead')
      .insert(eventoData)
      .select()
      .single()

    if (error) {
      console.error('Lead event creation error:', error)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    // Update lead status if event type indicates status change
    if (body.tipo === 'ganho' || body.tipo === 'perdido') {
      await supabase
        .from('leads')
        .update({ status: body.tipo })
        .eq('id', id)
    } else if (body.tipo === 'contato_realizado') {
      await supabase
        .from('leads')
        .update({ status: 'em_atendimento' })
        .eq('id', id)
    }

    return NextResponse.json({
      success: true,
      data: evento
    }, { status: 201 })
  } catch (error) {
    console.error('Lead event creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

