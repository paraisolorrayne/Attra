import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { EventoBoletoTipo } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Map status changes to event types
const statusToEventType: Record<string, EventoBoletoTipo> = {
  'pago': 'pago',
  'cancelado': 'cancelado',
  'em_negociacao': 'renegociado'
}

// PATCH /api/admin/crm/cobrancas/:id - Update boleto status/fields
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
      .from('boletos' as any)
      .select('status')
      .eq('id', id)
      .single() as { data: { status: string } | null; error: unknown }

    if (fetchError || !currentBoleto) {
      return NextResponse.json({ error: 'Boleto not found' }, { status: 404 })
    }

    // Allowed update fields
    const allowedFields = [
      'status', 'data_pagamento', 'descricao', 'veiculo_descricao'
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
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
    const updateResult = await (supabase as any)
      .from('boletos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    const boleto = updateResult.data as Record<string, unknown> | null
    const updateError = updateResult.error as Error | null

    if (updateError) {
      console.error('Boleto update error:', updateError)
      return NextResponse.json({ error: 'Failed to update boleto' }, { status: 500 })
    }

    // Create event if status changed
    if (updateData.status && updateData.status !== currentBoleto.status) {
      const eventType = statusToEventType[updateData.status as string]
      if (eventType) {
        await (supabase as any)
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

    // Fetch boleto with plain select — no FK joins to avoid PGRST200
    const { data: boleto, error } = await supabase
      .from('boletos' as any)
      .select('*')
      .eq('id', id)
      .single() as { data: Record<string, unknown> | null; error: unknown }

    if (error || !boleto) {
      return NextResponse.json({ error: 'Boleto not found' }, { status: 404 })
    }

    // Fetch cliente separately (no FK dependency)
    let cliente = null
    if (boleto.cliente_id) {
      const { data } = await supabase
        .from('clientes' as any)
        .select('*')
        .eq('id', boleto.cliente_id as string)
        .single() as { data: Record<string, unknown> | null }
      cliente = data
    }

    // Fetch lead separately
    let lead = null
    if (boleto.lead_id) {
      const { data } = await supabase
        .from('leads' as any)
        .select('id, nome, status, etapa_funil')
        .eq('id', boleto.lead_id as string)
        .single() as { data: Record<string, unknown> | null }
      lead = data
    }

    // Get boleto events
    const { data: eventos } = await supabase
      .from('eventos_boleto' as any)
      .select('*')
      .eq('boleto_id', id)
      .order('data_evento', { ascending: false }) as { data: unknown[] | null }

    return NextResponse.json({
      success: true,
      data: {
        ...boleto,
        cliente,
        lead,
        eventos: eventos || []
      }
    })
  } catch (error) {
    console.error('Boleto detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
