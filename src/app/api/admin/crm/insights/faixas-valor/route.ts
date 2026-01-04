import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/crm/insights/faixas-valor - Price range insights
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const supabase = createAdminClient()

    // Get leads with price ranges
    const { data: leads, error } = await supabase
      .from('leads')
      .select('faixa_preco_interesse_min, faixa_preco_interesse_max, interesse_tipo, criado_em')
      .gte('criado_em', dateFrom.toISOString())
      .not('faixa_preco_interesse_min', 'is', null)

    if (error) {
      console.error('Insights faixas-valor error:', error)
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
    }

    // Define price ranges
    const ranges = [
      { label: 'Até R$ 100k', min: 0, max: 100000 },
      { label: 'R$ 100k - 200k', min: 100000, max: 200000 },
      { label: 'R$ 200k - 350k', min: 200000, max: 350000 },
      { label: 'R$ 350k - 500k', min: 350000, max: 500000 },
      { label: 'R$ 500k - 750k', min: 500000, max: 750000 },
      { label: 'R$ 750k - 1M', min: 750000, max: 1000000 },
      { label: 'Acima de R$ 1M', min: 1000000, max: Infinity }
    ]

    // Count leads per range
    const rangeStats = ranges.map(range => {
      const count = leads?.filter(lead => {
        const min = lead.faixa_preco_interesse_min || 0
        const max = lead.faixa_preco_interesse_max || min
        const midpoint = (min + max) / 2
        return midpoint >= range.min && midpoint < range.max
      }).length || 0

      return {
        faixa: range.label,
        quantidade: count,
        percentual: leads?.length ? Math.round((count / leads.length) * 100) : 0
      }
    }).filter(r => r.quantidade > 0)

    // Get interest type breakdown
    const interestTypes = {
      comprar: leads?.filter(l => l.interesse_tipo === 'comprar').length || 0,
      vender: leads?.filter(l => l.interesse_tipo === 'vender').length || 0,
      ambos: leads?.filter(l => l.interesse_tipo === 'ambos').length || 0
    }

    // Calculate average range
    const avgMin = leads?.reduce((sum, l) => sum + (l.faixa_preco_interesse_min || 0), 0) || 0
    const avgMax = leads?.reduce((sum, l) => sum + (l.faixa_preco_interesse_max || 0), 0) || 0
    const leadCount = leads?.length || 1

    return NextResponse.json({
      success: true,
      data: {
        periodo_dias: days,
        total_leads: leads?.length || 0,
        faixas: rangeStats,
        tipos_interesse: interestTypes,
        media_faixa: {
          min: Math.round(avgMin / leadCount),
          max: Math.round(avgMax / leadCount)
        }
      }
    })
  } catch (error) {
    console.error('Insights faixas-valor API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

