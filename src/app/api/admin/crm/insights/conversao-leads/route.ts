import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/crm/insights/conversao-leads
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
    // Use 2025 as reference year since data is from 2019-2025
    const referenceYear = 2025
    const referenceMonth = 11 // December (0-indexed)
    let startDate: Date

    switch (periodo) {
      case 'mensal':
        startDate = new Date(referenceYear, referenceMonth, 1)
        break
      case 'trimestral':
        startDate = new Date(referenceYear, referenceMonth - 2, 1)
        break
      case 'semestral':
        startDate = new Date(referenceYear, referenceMonth - 5, 1)
        break
      case 'anual':
      default:
        startDate = new Date(referenceYear, 0, 1)
        break
    }

    const startDateStr = startDate.toISOString().split('T')[0]

    // Get leads within the period
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('status, origem, prioridade, criado_em')
      .gte('criado_em', startDateStr)
      .lte('criado_em', `${referenceYear}-12-31T23:59:59`)

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Calculate metrics
    const totalLeads = leads?.length || 0
    const statusCount = {
      novo: 0,
      em_atendimento: 0,
      concluido: 0,
      ganho: 0,
      perdido: 0
    }
    
    const origemCount: Record<string, number> = {}
    const prioridadeCount = { baixa: 0, media: 0, alta: 0 }
    
    for (const lead of leads || []) {
      // Count by status
      if (lead.status && statusCount[lead.status as keyof typeof statusCount] !== undefined) {
        statusCount[lead.status as keyof typeof statusCount]++
      }
      
      // Count by origem
      const origem = lead.origem || 'outro'
      origemCount[origem] = (origemCount[origem] || 0) + 1
      
      // Count by prioridade
      if (lead.prioridade && prioridadeCount[lead.prioridade as keyof typeof prioridadeCount] !== undefined) {
        prioridadeCount[lead.prioridade as keyof typeof prioridadeCount]++
      }
    }

    // Calculate conversion rate (ganhos / total)
    const taxaConversao = totalLeads > 0 
      ? Math.round((statusCount.ganho / totalLeads) * 100) 
      : 0

    // Calculate leads by month
    const leadsPorMes: Record<string, number> = {}
    for (const lead of leads || []) {
      const data = new Date(lead.criado_em)
      const mesKey = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      leadsPorMes[mesKey] = (leadsPorMes[mesKey] || 0) + 1
    }

    const evolucaoMensal = Object.entries(leadsPorMes)
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => a.mes.localeCompare(b.mes))

    return NextResponse.json({
      success: true,
      data: {
        periodo,
        resumo: {
          total_leads: totalLeads,
          taxa_conversao: taxaConversao,
          leads_ganhos: statusCount.ganho,
          leads_perdidos: statusCount.perdido,
          leads_em_andamento: statusCount.novo + statusCount.em_atendimento
        },
        por_status: [
          { status: 'Novo', quantidade: statusCount.novo },
          { status: 'Em Atendimento', quantidade: statusCount.em_atendimento },
          { status: 'Concluído', quantidade: statusCount.concluido },
          { status: 'Ganho', quantidade: statusCount.ganho },
          { status: 'Perdido', quantidade: statusCount.perdido }
        ],
        por_origem: Object.entries(origemCount)
          .map(([origem, quantidade]) => ({ origem, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade),
        por_prioridade: [
          { prioridade: 'Alta', quantidade: prioridadeCount.alta },
          { prioridade: 'Média', quantidade: prioridadeCount.media },
          { prioridade: 'Baixa', quantidade: prioridadeCount.baixa }
        ],
        evolucao_mensal: evolucaoMensal
      }
    })
  } catch (error) {
    console.error('Conversão leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

