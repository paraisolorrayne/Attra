import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { ClienteWithStats } from '@/types/database'

// GET /api/admin/crm/clientes - List customers with stats
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const origem = searchParams.get('origem')

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,email.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`)
    }
    if (origem) {
      query = query.eq('origem_principal', origem)
    }

    query = query.order('criado_em', { ascending: false })

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: clientes, error, count } = await query

    if (error) {
      console.error('Clientes query error:', error)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    // Get stats for each cliente
    const clienteIds = clientes?.map(c => c.id) || []
    let clientesWithStats: ClienteWithStats[] = []

    if (clienteIds.length > 0) {
      // Get lead counts
      const { data: leadCounts } = await supabase
        .from('leads')
        .select('cliente_id')
        .in('cliente_id', clienteIds)

      // Get purchase history stats
      const { data: purchases } = await supabase
        .from('historico_compras')
        .select('cliente_id, valor_compra, data_compra')
        .in('cliente_id', clienteIds)
        .order('data_compra', { ascending: false })

      const leadCountMap = new Map<string, number>()
      leadCounts?.forEach(l => {
        leadCountMap.set(l.cliente_id!, (leadCountMap.get(l.cliente_id!) || 0) + 1)
      })

      const purchaseStatsMap = new Map<string, { count: number; total: number; lastDate: string | null }>()
      purchases?.forEach(p => {
        const current = purchaseStatsMap.get(p.cliente_id) || { count: 0, total: 0, lastDate: null }
        purchaseStatsMap.set(p.cliente_id, {
          count: current.count + 1,
          total: current.total + (p.valor_compra || 0),
          lastDate: current.lastDate || p.data_compra
        })
      })

      clientesWithStats = clientes?.map(cliente => ({
        ...cliente,
        lead_count: leadCountMap.get(cliente.id) || 0,
        purchase_count: purchaseStatsMap.get(cliente.id)?.count || 0,
        total_spent: purchaseStatsMap.get(cliente.id)?.total || 0,
        last_purchase_date: purchaseStatsMap.get(cliente.id)?.lastDate || null
      })) || []
    }

    return NextResponse.json({
      success: true,
      data: clientesWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Clientes API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

