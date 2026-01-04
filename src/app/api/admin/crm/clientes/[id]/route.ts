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
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !cliente) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get purchase history
    const { data: compras } = await supabase
      .from('historico_compras')
      .select('*')
      .eq('cliente_id', id)
      .order('data_compra', { ascending: false })

    // Get leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('cliente_id', id)
      .order('criado_em', { ascending: false })

    // Get boletos
    const { data: boletos } = await supabase
      .from('boletos')
      .select('*')
      .eq('cliente_id', id)
      .order('data_vencimento', { ascending: false })

    // Calculate stats
    const totalSpent = compras?.reduce((sum, c) => sum + (c.valor_compra || 0), 0) || 0
    const pendingBoletos = boletos?.filter(b => ['pendente', 'vencido', 'em_negociacao'].includes(b.status)) || []
    const totalPending = pendingBoletos.reduce((sum, b) => sum + (b.valor_total || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        ...cliente,
        historico_compras: compras || [],
        leads: leads || [],
        boletos: boletos || [],
        stats: {
          total_compras: compras?.length || 0,
          total_gasto: totalSpent,
          total_leads: leads?.length || 0,
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

    const { data: cliente, error } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Cliente update error:', error)
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

