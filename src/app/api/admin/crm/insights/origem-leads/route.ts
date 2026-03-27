import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// Fixed channel order as required
const ORIGEM_ORDER = ['site_chat', 'whatsapp_ia', 'instagram_form', 'crm_externo'] as const

const ORIGEM_LABELS: Record<string, string> = {
  site_chat:      'Chat do Site',
  whatsapp_ia:    'WhatsApp IA',
  instagram_form: 'Instagram',
  crm_externo:    'CRM Externo',
}

// GET /api/admin/crm/insights/origem-leads?periodo=X
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
      .select('origem, etapa_funil, valor_potencial')
      .gte('criado_em', startDateStr)
      .lte('criado_em', endDateStr)

    if (error) {
      console.error('Origem leads query error:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Initialize counters for all known origins first
    const totaisMap: Record<string, number> = {}
    const ganhosMap: Record<string, number> = {}
    const valorEstimadoMap: Record<string, number> = {}

    for (const origem of ORIGEM_ORDER) {
      totaisMap[origem] = 0
      ganhosMap[origem] = 0
      valorEstimadoMap[origem] = 0
    }

    // Aggregate — valor_potencial null treated as 0
    for (const lead of leads || []) {
      const l = lead as any
      const origem: string = l.origem || 'outro'
      const etapa: string = l.etapa_funil || ''
      const valor: number = l.valor_potencial ?? 0

      if (totaisMap[origem] === undefined) {
        totaisMap[origem] = 0
        ganhosMap[origem] = 0
        valorEstimadoMap[origem] = 0
      }

      totaisMap[origem]++
      if (etapa === 'ganho') {
        ganhosMap[origem]++
        valorEstimadoMap[origem] += valor
      }
    }

    // Build result in fixed order (known first, then any extras)
    const knownSet = new Set<string>(ORIGEM_ORDER)
    const extras = Object.keys(totaisMap).filter(o => !knownSet.has(o))
    const allOrigens = [...ORIGEM_ORDER, ...extras]

    const por_origem = allOrigens.map(origem => {
      const total  = totaisMap[origem] ?? 0
      const ganhos = ganhosMap[origem] ?? 0
      const valor  = valorEstimadoMap[origem] ?? 0
      return {
        origem,
        label:                  ORIGEM_LABELS[origem] ?? origem,
        total_leads:            total,
        total_ganhos:           ganhos,
        taxa_conversao:         total  > 0 ? Math.round((ganhos / total) * 100) : 0,
        valor_total_estimado:   valor,
        ticket_medio_estimado:  ganhos > 0 ? Math.round(valor / ganhos) : 0,
      }
    })

    // Summary
    const ativas  = por_origem.filter(o => o.total_leads > 0)
    const sorted  = [...por_origem]

    const topOrigem   = [...sorted].sort((a, b) => b.total_leads - a.total_leads)[0]
    const melhorTaxa  = [...sorted].sort((a, b) => b.taxa_conversao - a.taxa_conversao)[0]
    const maiorTicket = [...sorted].sort((a, b) => b.ticket_medio_estimado - a.ticket_medio_estimado)[0]

    return NextResponse.json({
      success: true,
      data: {
        resumo: {
          total_origens_ativas:       ativas.length,
          top_origem:                 topOrigem?.label ?? '—',
          melhor_taxa_conversao:      melhorTaxa?.taxa_conversao ?? 0,
          melhor_taxa_origem:         melhorTaxa?.label ?? '—',
          maior_ticket_medio_estimado: maiorTicket?.ticket_medio_estimado ?? 0,
          maior_ticket_origem:         maiorTicket?.label ?? '—',
        },
        por_origem,
      },
    })
  } catch (error) {
    console.error('Origem leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
