import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { EventoBoletoInsert, EventoBoletoTipo } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/crm/cobrancas/:id/eventos - List boleto events
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: eventos, error } = await supabase
      .from('eventos_boleto')
      .select('*')
      .eq('boleto_id', id)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Eventos fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch eventos' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: eventos
    })
  } catch (error) {
    console.error('Eventos API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/crm/cobrancas/:id/eventos - Create new boleto event
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Verify boleto exists
    const { data: boleto, error: boletoError } = await supabase
      .from('boletos')
      .select('id')
      .eq('id', id)
      .single()

    if (boletoError || !boleto) {
      return NextResponse.json({ error: 'Boleto not found' }, { status: 404 })
    }

    // Validate required fields
    if (!body.tipo || !body.descricao) {
      return NextResponse.json({ error: 'Tipo and descricao are required' }, { status: 400 })
    }

    // Create event
    const eventoData: EventoBoletoInsert = {
      boleto_id: id,
      tipo: body.tipo as EventoBoletoTipo,
      descricao: body.descricao,
      responsavel: body.responsavel || 'Admin',
      valor_negociado: body.valor_negociado || null
    }

    const { data: evento, error } = await supabase
      .from('eventos_boleto')
      .insert(eventoData)
      .select()
      .single()

    if (error) {
      console.error('Evento create error:', error)
      return NextResponse.json({ error: 'Failed to create evento' }, { status: 500 })
    }

    // If event type affects status, update boleto
    const statusUpdates: Record<EventoBoletoTipo, string | null> = {
      envio: null,
      lembrete: null,
      cobranca: null,
      promessa_pagamento: 'em_negociacao',
      pagamento_parcial: null,
      pagamento_total: 'pago',
      cancelamento: 'cancelado',
      negociacao: 'em_negociacao',
      observacao: null
    }

    const newStatus = statusUpdates[body.tipo as EventoBoletoTipo]
    if (newStatus) {
      await supabase
        .from('boletos')
        .update({ status: newStatus })
        .eq('id', id)
    }

    return NextResponse.json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.error('Evento create API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

