import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

const NAO_ATRIBUIDO = 'Não atribuído'
const MIN_LEADS_MELHOR_TAXA = 3

// GET /api/admin/crm/insights/vendedor-leads?periodo=X
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
    const endDateStr = new Date(currentYear, 11, 31, 23, 59, 59).toISOString()

    const { data: leads, error } = await supabase
      .from('leads')
      .select('vendedor_responsavel, etapa_funil, valor_potencial, criado_em, atualizado_em')
      .gte('criado_em', startDateStr)
      .lte('criado_em', endDateStr)

    if (error) {
      console.error('Vendedor leads query error:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    const ETAPAS = ['novo_lead','primeiro_contato','visita_agendada','visita_realizada','proposta_enviada','negociacao','ganho','perdido']

    // Aggregate in JS
    const totaisMap: Record<string, number> = {}
    const valorEstimadoMap: Record<string, number> = {}
    const etapaMap: Record<string, Record<string, number>> = {}
    const tempoFechamentoMap: Record<string, number[]> = {}

    for (const lead of leads || []) {
      const l = lead as any
      const vendedor: string = l.vendedor_responsavel?.trim() || NAO_ATRIBUIDO
      const etapa: string = l.etapa_funil || ''
      const valor: number = l.valor_potencial ?? 0

      totaisMap[vendedor] = (totaisMap[vendedor] ?? 0) + 1
      if (!etapaMap[vendedor]) etapaMap[vendedor] = {}
      etapaMap[vendedor][etapa] = (etapaMap[vendedor][etapa] ?? 0) + 1

      if (etapa === 'ganho') {
        valorEstimadoMap[vendedor] = (valorEstimadoMap[vendedor] ?? 0) + valor
        // Tempo médio: criado_em → atualizado_em (proxy for close date)
        if (l.criado_em && l.atualizado_em) {
          const dias = Math.round(
            (new Date(l.atualizado_em).getTime() - new Date(l.criado_em).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (!tempoFechamentoMap[vendedor]) tempoFechamentoMap[vendedor] = []
          tempoFechamentoMap[vendedor].push(dias)
        }
      }
    }

    // Build array with all vendedores
    const por_vendedor = Object.keys(totaisMap)
      .map(vendedor => {
        const total    = totaisMap[vendedor] ?? 0
        const etapas   = etapaMap[vendedor] ?? {}
        const ganhos   = etapas['ganho'] ?? 0
        const perdidos = etapas['perdido'] ?? 0
        const emAndamento = total - ganhos - perdidos
        const valor    = valorEstimadoMap[vendedor] ?? 0
        const tempos   = tempoFechamentoMap[vendedor] ?? []
        const tempoMedio = tempos.length > 0 ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : null
        const por_etapa = ETAPAS.reduce((acc, e) => ({ ...acc, [e]: etapas[e] ?? 0 }), {} as Record<string, number>)
        return {
          vendedor,
          total_leads:            total,
          em_andamento:           emAndamento,
          total_ganhos:           ganhos,
          total_perdidos:         perdidos,
          taxa_conversao:         total > 0 ? Math.round((ganhos / total) * 100) : 0,
          valor_total_estimado:   valor,
          ticket_medio_estimado:  ganhos > 0 ? Math.round(valor / ganhos) : 0,
          tempo_medio_fechamento: tempoMedio,
          por_etapa,
        }
      })
      // Sort: total_leads DESC, ties by vendedor ASC
      .sort((a, b) =>
        b.total_leads !== a.total_leads
          ? b.total_leads - a.total_leads
          : a.vendedor.localeCompare(b.vendedor, 'pt-BR')
      )

    // Summary
    const topVendedor = por_vendedor[0]

    // Best conversion: prefer vendedores with >= MIN_LEADS_MELHOR_TAXA leads
    const comMinLeads = por_vendedor.filter(v => v.total_leads >= MIN_LEADS_MELHOR_TAXA)
    const candidatosTaxa = comMinLeads.length > 0 ? comMinLeads : por_vendedor
    const melhorTaxa = [...candidatosTaxa].sort((a, b) => b.taxa_conversao - a.taxa_conversao)[0]
    const maiorTicket = [...por_vendedor].sort((a, b) => b.ticket_medio_estimado - a.ticket_medio_estimado)[0]

    return NextResponse.json({
      success: true,
      data: {
        resumo: {
          total_vendedores_ativos:   por_vendedor.filter(v => v.total_leads > 0).length,
          top_vendedor:              topVendedor?.vendedor ?? '—',
          melhor_taxa_conversao:     melhorTaxa?.taxa_conversao ?? 0,
          melhor_taxa_vendedor:      melhorTaxa?.vendedor ?? '—',
          maior_ticket_medio_estimado: maiorTicket?.ticket_medio_estimado ?? 0,
          maior_ticket_vendedor:     maiorTicket?.vendedor ?? '—',
        },
        por_vendedor,
      },
    })
  } catch (error) {
    console.error('Vendedor leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
