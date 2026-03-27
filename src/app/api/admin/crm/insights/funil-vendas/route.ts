import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { EtapaFunil } from '@/types/database'

// Fixed order as required
const ETAPA_ORDER: EtapaFunil[] = [
  'novo_lead',
  'primeiro_contato',
  'visita_agendada',
  'visita_realizada',
  'proposta_enviada',
  'negociacao',
  'ganho',
  'perdido',
]

// GET /api/admin/crm/insights/funil-vendas
export async function GET(request: Request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const periodo = searchParams.get('periodo') || 'anual'

    const supabase = createAdminClient()

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let startDate: Date

    switch (periodo) {
      case 'mensal':
        startDate = new Date(currentYear, currentMonth, 1)
        break
      case 'trimestral':
        startDate = new Date(currentYear, currentMonth - 2, 1)
        break
      case 'semestral':
        startDate = new Date(currentYear, currentMonth - 5, 1)
        break
      case 'anual':
      default:
        startDate = new Date(currentYear, 0, 1)
        break
    }
    const startDateStr = startDate.toISOString().split('T')[0]
    
    // Set EndDate to today or end of year
    const endDateStr = new Date(currentYear, 11, 31, 23, 59, 59).toISOString()

    const { data: leads, error } = await supabase
      .from('leads')
      .select('etapa_funil, valor_potencial')
      .gte('criado_em', startDateStr)
      .lte('criado_em', endDateStr)

    if (error) {
      console.error('Funil vendas query error:', error)
      return NextResponse.json({ error: 'Failed to fetch funil data' }, { status: 500 })
    }

    // Aggregate by etapa in JavaScript — valor_potencial null treated as 0
    const countMap: Record<string, number> = {}
    const valorMap: Record<string, number> = {}

    for (const etapa of ETAPA_ORDER) {
      countMap[etapa] = 0
      valorMap[etapa] = 0
    }

    for (const lead of leads || []) {
      const l = lead as any
      const etapa = l.etapa_funil as string
      if (etapa && countMap[etapa] !== undefined) {
        countMap[etapa]++
        valorMap[etapa] += l.valor_potencial ?? 0
      }
    }

    const totalLeads = (leads || []).length
    const ganhos = countMap['ganho'] ?? 0
    const taxaGlobalConversao = totalLeads > 0 ? Math.round((ganhos / totalLeads) * 100) : 0
    const valorPotencialTotal = Object.values(valorMap).reduce((a, b) => a + b, 0)

    // Build ordered array
    const por_etapa = ETAPA_ORDER.map(etapa => ({
      etapa,
      quantidade: countMap[etapa],
      valor_potencial_total: valorMap[etapa],
    }))

    // Conversion rates — exact formulas as specified
    const conv = (numerator: string, denominator: string): number => {
      const den = countMap[denominator] ?? 0
      const num = countMap[numerator] ?? 0
      return den > 0 ? Math.round((num / den) * 100) : 0
    }

    const taxas_conversao = [
      {
        label: 'Novo Lead → Primeiro Contato',
        de: 'novo_lead',
        para: 'primeiro_contato',
        taxa: conv('primeiro_contato', 'novo_lead'),
        de_quantidade: countMap['novo_lead'],
        para_quantidade: countMap['primeiro_contato'],
      },
      {
        label: 'Primeiro Contato → Visita Agendada',
        de: 'primeiro_contato',
        para: 'visita_agendada',
        taxa: conv('visita_agendada', 'primeiro_contato'),
        de_quantidade: countMap['primeiro_contato'],
        para_quantidade: countMap['visita_agendada'],
      },
      {
        label: 'Negociação → Ganho',
        de: 'negociacao',
        para: 'ganho',
        taxa: conv('ganho', 'negociacao'),
        de_quantidade: countMap['negociacao'],
        para_quantidade: countMap['ganho'],
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        resumo: {
          total_leads: totalLeads,
          leads_ganhos: ganhos,
          taxa_global_conversao: taxaGlobalConversao,
          valor_potencial_total: valorPotencialTotal,
        },
        por_etapa,
        taxas_conversao,
      },
    })
  } catch (error) {
    console.error('Funil vendas API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
