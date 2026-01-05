import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

interface VendaVendedor {
  vendedor: string
  total_vendas: number
  valor_total: number
  ticket_medio: number
  percentual: number
}

interface VendaMensal {
  mes: string
  total_vendas: number
  valor_total: number
}

// GET /api/admin/crm/insights/vendas-vendedor
// Query params: periodo = 'mensal' | 'trimestral' | 'semestral' | 'anual'
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'anual'
    
    const supabase = createAdminClient()
    
    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (periodo) {
      case 'mensal':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'trimestral':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'semestral':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      case 'anual':
      default:
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }
    
    const startDateStr = startDate.toISOString().split('T')[0]

    // Get all sales with vendedor within the period
    const { data: vendas, error } = await supabase
      .from('historico_compras')
      .select('vendedor, valor_compra, data_compra')
      .gte('data_compra', startDateStr)
      .order('data_compra', { ascending: false })

    if (error) {
      console.error('Error fetching vendas:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Aggregate by vendedor
    const vendedorMap = new Map<string, { total: number; valor: number }>()
    let totalGeral = 0
    
    for (const venda of vendas || []) {
      const vendedor = venda.vendedor || 'Não informado'
      const valor = Number(venda.valor_compra) || 0
      
      const existing = vendedorMap.get(vendedor) || { total: 0, valor: 0 }
      vendedorMap.set(vendedor, {
        total: existing.total + 1,
        valor: existing.valor + valor
      })
      totalGeral += 1
    }

    // Convert to array and calculate percentages
    const vendasVendedor: VendaVendedor[] = Array.from(vendedorMap.entries())
      .map(([vendedor, stats]) => ({
        vendedor,
        total_vendas: stats.total,
        valor_total: stats.valor,
        ticket_medio: stats.total > 0 ? stats.valor / stats.total : 0,
        percentual: totalGeral > 0 ? Math.round((stats.total / totalGeral) * 100) : 0
      }))
      .sort((a, b) => b.total_vendas - a.total_vendas)

    // Aggregate by month for timeline
    const mesMap = new Map<string, { total: number; valor: number }>()
    
    for (const venda of vendas || []) {
      const data = new Date(venda.data_compra)
      const mesKey = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const valor = Number(venda.valor_compra) || 0
      
      const existing = mesMap.get(mesKey) || { total: 0, valor: 0 }
      mesMap.set(mesKey, {
        total: existing.total + 1,
        valor: existing.valor + valor
      })
    }

    // Convert to array and sort by date
    const vendasMensais: VendaMensal[] = Array.from(mesMap.entries())
      .map(([mes, stats]) => ({
        mes,
        total_vendas: stats.total,
        valor_total: stats.valor
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes))

    // Calculate summary stats
    const totalVendas = vendas?.length || 0
    const valorTotal = vendas?.reduce((sum, v) => sum + (Number(v.valor_compra) || 0), 0) || 0
    const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0

    return NextResponse.json({
      success: true,
      data: {
        periodo,
        resumo: {
          total_vendas: totalVendas,
          valor_total: valorTotal,
          ticket_medio: ticketMedio,
          total_vendedores: vendedorMap.size
        },
        por_vendedor: vendasVendedor,
        por_mes: vendasMensais
      }
    })
  } catch (error) {
    console.error('Vendas vendedor API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

