import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { ClienteWithStats } from '@/types/database'

// GET /api/admin/crm/clientes - List customers with stats and filters
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    console.log('[Clientes API] isAuthenticated:', authenticated)

    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const origem = searchParams.get('origem')
    const faixaValorMin = searchParams.get('faixa_valor_min')
    const faixaValorMax = searchParams.get('faixa_valor_max')
    const totalGastoMin = searchParams.get('total_gasto_min')
    const totalGastoMax = searchParams.get('total_gasto_max')
    const atividadeRecente = searchParams.get('atividade_recente') // 30, 90, 180 days

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

    // Filter by preferred price range
    if (faixaValorMin) {
      query = query.gte('faixa_valor_preferida_min', parseInt(faixaValorMin))
    }
    if (faixaValorMax) {
      query = query.lte('faixa_valor_preferida_max', parseInt(faixaValorMax))
    }

    query = query.order('criado_em', { ascending: false })

    // Get all clientes first for stats calculation (before pagination for filtering)
    const { data: allClientes, error: allError } = await supabase
      .from('clientes')
      .select('id')

    if (allError) {
      console.error('Error fetching all cliente IDs:', allError)
    }

    const allClienteIds = allClientes?.map(c => c.id) || []

    // Get purchase stats for ALL customers to enable total_gasto filtering
    let purchaseStatsMap = new Map<string, { count: number; total: number; lastDate: string | null }>()
    let leadCountMap = new Map<string, number>()

    if (allClienteIds.length > 0) {
      // Get lead counts for all
      const { data: leadCounts } = await supabase
        .from('leads')
        .select('cliente_id')
        .in('cliente_id', allClienteIds)

      leadCounts?.forEach(l => {
        leadCountMap.set(l.cliente_id!, (leadCountMap.get(l.cliente_id!) || 0) + 1)
      })

      // Get purchase history stats for all
      const { data: purchases } = await supabase
        .from('historico_compras')
        .select('cliente_id, valor_compra, data_compra')
        .in('cliente_id', allClienteIds)
        .order('data_compra', { ascending: false })

      purchases?.forEach(p => {
        const current = purchaseStatsMap.get(p.cliente_id) || { count: 0, total: 0, lastDate: null }
        purchaseStatsMap.set(p.cliente_id, {
          count: current.count + 1,
          total: current.total + (p.valor_compra || 0),
          lastDate: current.lastDate || p.data_compra
        })
      })
    }

    // Now get paginated results
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: clientes, error, count } = await query

    console.log('[Clientes API] Query result - count:', count, 'clientes length:', clientes?.length, 'error:', error)

    if (error) {
      console.error('Clientes query error:', error)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    // Build clientesWithStats
    let clientesWithStats: ClienteWithStats[] = clientes?.map(cliente => ({
      ...cliente,
      lead_count: leadCountMap.get(cliente.id) || 0,
      purchase_count: purchaseStatsMap.get(cliente.id)?.count || 0,
      total_spent: purchaseStatsMap.get(cliente.id)?.total || 0,
      last_purchase_date: purchaseStatsMap.get(cliente.id)?.lastDate || null
    })) || []

    // Apply post-query filters (total_gasto and atividade_recente)
    if (totalGastoMin || totalGastoMax || atividadeRecente) {
      const minGasto = totalGastoMin ? parseInt(totalGastoMin) : 0
      const maxGasto = totalGastoMax ? parseInt(totalGastoMax) : Infinity
      const now = new Date()
      const activityDays = atividadeRecente ? parseInt(atividadeRecente) : null

      clientesWithStats = clientesWithStats.filter(cliente => {
        // Filter by total spent
        const totalSpent = cliente.total_spent || 0
        if (totalSpent < minGasto || totalSpent > maxGasto) {
          return false
        }

        // Filter by recent activity
        if (activityDays && cliente.last_purchase_date) {
          const lastPurchase = new Date(cliente.last_purchase_date)
          const diffDays = Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays > activityDays) {
            return false
          }
        } else if (activityDays && !cliente.last_purchase_date) {
          return false // No purchases = no recent activity
        }

        return true
      })
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

