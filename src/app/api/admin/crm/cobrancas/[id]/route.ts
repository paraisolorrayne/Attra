import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { BoletoUpdate, EventoBoletoTipo } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Map status changes to event types
const statusToEventType: Record<string, EventoBoletoTipo> = {
  'pago': 'pago',
  'cancelado': 'cancelado',
  'em_negociacao': 'renegociado'
}

// PATCH /api/admin/crm/cobrancas/:id - Update boleto status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const supabase = createAdminClient()

    // Get current boleto to check status change
    const { data: currentBoleto, error: fetchError } = await supabase
      .from('boletos')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError || !currentBoleto) {
      return NextResponse.json({ error: 'Boleto not found' }, { status: 404 })
    }

    // Validate allowed fields
    const allowedFields: (keyof BoletoUpdate)[] = [
      'status', 'data_pagamento', 'descricao'
    ]

    const updateData: BoletoUpdate = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = body[field]
      }
    }

    // If status is being changed to 'pago', auto-set payment date
    if (updateData.status === 'pago' && !updateData.data_pagamento) {
      updateData.data_pagamento = new Date().toISOString().split('T')[0]
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update boleto
    const { data: boleto, error } = await supabase
      .from('boletos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Boleto update error:', error)
      return NextResponse.json({ error: 'Failed to update boleto' }, { status: 500 })
    }

    // Create event if status changed
    if (updateData.status && updateData.status !== currentBoleto.status) {
      const eventType = statusToEventType[updateData.status]
      if (eventType) {
        await supabase
          .from('eventos_boleto')
          .insert({
            boleto_id: id,
            tipo: eventType,
            descricao: body.descricao_evento || `Status alterado para ${updateData.status}`,
            data_evento: new Date().toISOString()
          })
      }
    }

    return NextResponse.json({
      success: true,
      data: boleto
    })
  } catch (error) {
    console.error('Boleto update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/admin/crm/cobrancas/:id - Get boleto details with events
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: boleto, error } = await supabase
      .from('boletos')
      .select(`
        *,
        cliente:clientes(*),
        lead:leads(id, nome, status)
      `)
      .eq('id', id)
      .single()

    if (error || !boleto) {
      return NextResponse.json({ error: 'Boleto not found' }, { status: 404 })
    }

    // Get events
    const { data: eventos } = await supabase
      .from('eventos_boleto')
      .select('*')
      .eq('boleto_id', id)
      .order('data_evento', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        ...boleto,
        eventos: eventos || []
      }
    })
  } catch (error) {
    console.error('Boleto detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

