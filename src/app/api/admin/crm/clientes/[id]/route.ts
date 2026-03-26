import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/crm/clientes/:id - Get customer details with history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Get cliente
    const clienteResult = await (supabase as any)
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    const cliente = clienteResult.data as Record<string, unknown> | null
    const clienteError = clienteResult.error

    if (clienteError || !cliente) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get purchase history
    const comprasResult = await (supabase as any)
      .from('historico_compras')
      .select('*')
      .eq('cliente_id', id)
      .order('data_compra', { ascending: false })
    const compras = (comprasResult.data || []) as Record<string, unknown>[]

    // Get leads
    const leadsResult = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('cliente_id', id)
      .order('criado_em', { ascending: false })
    const leads = (leadsResult.data || []) as Record<string, unknown>[]

    // Get eventos_lead for all leads of this contato (interações/follow-ups)
    const leadIds = leads.map(l => l.id as string)
    let eventos: Record<string, unknown>[] = []
    if (leadIds.length > 0) {
      const eventosResult = await (supabase as any)
        .from('eventos_lead')
        .select('*')
        .in('lead_id', leadIds)
        .order('criado_em', { ascending: false })
      eventos = (eventosResult.data || []) as Record<string, unknown>[]
    }

    // Get boletos
    const boletosResult = await (supabase as any)
      .from('boletos')
      .select('*')
      .eq('cliente_id', id)
      .order('data_vencimento', { ascending: false })
    const boletos = (boletosResult.data || []) as Record<string, unknown>[]

    // Calculate stats
    const totalSpent = compras.reduce((sum, c) => sum + ((c.valor_compra as number) || 0), 0)
    const pendingBoletos = boletos.filter(b =>
      ['pendente', 'vencido', 'em_negociacao'].includes(b.status as string)
    )
    const totalPending = pendingBoletos.reduce((sum, b) => sum + ((b.valor_total as number) || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        ...cliente,
        historico_compras: compras,
        leads,
        boletos,
        eventos,
        stats: {
          total_compras: compras.length,
          total_gasto: totalSpent,
          total_leads: leads.length,
          boletos_pendentes: pendingBoletos.length,
          valor_pendente: totalPending
        }
      }
    })
  } catch (error) {
    console.error('Cliente detail API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/crm/clientes/:id - Update customer
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate allowed fields
    const allowedFields = [
      'nome', 'telefone', 'email', 'cpf_cnpj', 'origem_principal',
      'faixa_valor_preferida_min', 'faixa_valor_preferida_max',
      'tipos_preferidos', 'marcas_preferidas'
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const updateResult = await (supabase as any)
      .from('clientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    const cliente = updateResult.data as Record<string, unknown> | null
    const updateError = updateResult.error as Error | null

    if (updateError) {
      console.error('Cliente update error:', updateError)
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: cliente
    })
  } catch (error) {
    console.error('Cliente update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
