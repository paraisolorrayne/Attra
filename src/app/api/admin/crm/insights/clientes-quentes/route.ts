import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/crm/insights/clientes-quentes - Hot customers analysis
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = createAdminClient()

    // Get customers with recent leads (last 90 days)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - 90)

    const { data: recentLeads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        cliente_id,
        status,
        prioridade,
        faixa_preco_interesse_max,
        criado_em
      `)
      .gte('criado_em', dateFrom.toISOString())
      .not('cliente_id', 'is', null)

    if (leadsError) {
      console.error('Hot customers leads error:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Get customers with paid boletos (last 180 days)
    const boletoDateFrom = new Date()
    boletoDateFrom.setDate(boletoDateFrom.getDate() - 180)

    const { data: paidBoletos, error: boletosError } = await supabase
      .from('boletos')
      .select('cliente_id, valor_total, data_pagamento')
      .eq('status', 'pago')
      .gte('data_pagamento', boletoDateFrom.toISOString().split('T')[0])

    if (boletosError) {
      console.error('Hot customers boletos error:', boletosError)
    }

    // Score calculation for each customer
    const customerScores = new Map<string, { 
      score: number
      lead_count: number
      high_priority_leads: number
      paid_boletos: number
      total_paid: number
      max_price_interest: number
    }>()

    // Score from leads
    recentLeads?.forEach(lead => {
      if (!lead.cliente_id) return
      
      const current = customerScores.get(lead.cliente_id) || {
        score: 0,
        lead_count: 0,
        high_priority_leads: 0,
        paid_boletos: 0,
        total_paid: 0,
        max_price_interest: 0
      }

      current.lead_count += 1
      current.score += 10 // Base score per lead
      
      if (lead.prioridade === 'alta') {
        current.high_priority_leads += 1
        current.score += 20
      }
      
      if (lead.status === 'em_atendimento') {
        current.score += 15
      }

      if (lead.faixa_preco_interesse_max && lead.faixa_preco_interesse_max > current.max_price_interest) {
        current.max_price_interest = lead.faixa_preco_interesse_max
      }

      customerScores.set(lead.cliente_id, current)
    })

    // Score from paid boletos
    paidBoletos?.forEach(boleto => {
      const current = customerScores.get(boleto.cliente_id) || {
        score: 0,
        lead_count: 0,
        high_priority_leads: 0,
        paid_boletos: 0,
        total_paid: 0,
        max_price_interest: 0
      }

      current.paid_boletos += 1
      current.total_paid += boleto.valor_total || 0
      current.score += 30 // High score for paid boletos

      customerScores.set(boleto.cliente_id, current)
    })

    // Get customer details for top scored
    const sortedCustomers = Array.from(customerScores.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)

    const customerIds = sortedCustomers.map(([id]) => id)

    const { data: customers } = await supabase
      .from('clientes')
      .select('id, nome, telefone, email, faixa_valor_preferida_max')
      .in('id', customerIds)

    const customerMap = new Map(customers?.map(c => [c.id, c]) || [])

    const hotCustomers = sortedCustomers.map(([id, stats]) => ({
      cliente: customerMap.get(id),
      stats: {
        score: stats.score,
        leads_recentes: stats.lead_count,
        leads_alta_prioridade: stats.high_priority_leads,
        boletos_pagos: stats.paid_boletos,
        total_pago: stats.total_paid,
        interesse_maximo: stats.max_price_interest
      }
    })).filter(c => c.cliente)

    return NextResponse.json({
      success: true,
      data: hotCustomers
    })
  } catch (error) {
    console.error('Hot customers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

