import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { LeadUpdate } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/crm/leads/:id - Get lead details with events
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Get lead with cliente
    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .eq('id', id)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get lead events
    const { data: eventos } = await supabase
      .from('eventos_lead')
      .select('*')
      .eq('lead_id', id)
      .order('criado_em', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        ...lead,
        eventos: eventos || []
      }
    })
  } catch (error) {
    console.error('Lead detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/crm/leads/:id - Update lead
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json() as LeadUpdate

    // Validate allowed fields
    const allowedFields: (keyof LeadUpdate)[] = [
      'status', 'prioridade', 'cliente_id', 'interesse_tipo',
      'faixa_preco_interesse_min', 'faixa_preco_interesse_max',
      'categoria_interesse', 'marca_interesse', 'modelo_interesse'
    ]

    const updateData: LeadUpdate = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Lead update error:', error)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: lead
    })
  } catch (error) {
    console.error('Lead update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

