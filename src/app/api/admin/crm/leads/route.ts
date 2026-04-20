import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { classifyLeadSource, type FonteLead } from '@/lib/crm/lead-source'
import type { LeadWithCliente, StatusLead, PrioridadeLead, OrigemLead, EtapaFunil } from '@/types/database'

const FONTES_VALIDAS: FonteLead[] = [
  'google_ads', 'meta_ads', 'tiktok_ads',
  'organico_busca', 'organico_social', 'referral', 'direto', 'outro',
]

// Traduz um filtro `fonte` em condições SQL via .or() do PostgREST.
// Mantemos a classificação em TypeScript como fonte da verdade; este mapa
// serve só para narrow server-side (count e pagination corretos).
function fonteToPostgrestOr(fonte: FonteLead): string | null {
  switch (fonte) {
    case 'google_ads':
      return 'gclid.not.is.null,and(utm_medium.in.(cpc,ppc,paid,paidsocial,paid-social,paid_social,display,retargeting,remarketing,ads),utm_source.ilike.%google%)'
    case 'meta_ads':
      return 'fbclid.not.is.null,and(utm_medium.in.(cpc,ppc,paid,paidsocial,paid-social,paid_social,display,retargeting,remarketing,ads),or(utm_source.ilike.%facebook%,utm_source.ilike.%meta%,utm_source.ilike.%instagram%))'
    case 'tiktok_ads':
      return 'ttclid.not.is.null,and(utm_medium.in.(cpc,ppc,paid,paidsocial,paid-social,paid_social,display,retargeting,remarketing,ads),utm_source.ilike.%tiktok%)'
    case 'organico_busca':
    case 'organico_social':
    case 'referral':
    case 'direto':
    case 'outro':
      // Casos "negativos" — caem em post-filter por simplicidade. Retornar null
      // sinaliza ao caller para filtrar em JS.
      return null
  }
}

// GET /api/admin/crm/leads - List leads with filters
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    console.log('[Leads API] isAuthenticated:', authenticated)

    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as StatusLead | null
    const prioridade = searchParams.get('prioridade') as PrioridadeLead | null
    const origem = searchParams.get('origem') as OrigemLead | null
    const vendedor = searchParams.get('vendedor')
    const modelo = searchParams.get('modelo')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const etapaFunil = searchParams.get('etapa_funil') as EtapaFunil | null
    const lastContactFrom = searchParams.get('lastContactFrom')
    const lastContactTo = searchParams.get('lastContactTo')
    const fonteParam = searchParams.get('fonte')
    const fonte = (fonteParam && (FONTES_VALIDAS as string[]).includes(fonteParam))
      ? (fonteParam as FonteLead)
      : null

    const supabase = createAdminClient()

    // Build query (sem join com clientes — não há FK entre leads e clientes)
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })

    // Apply filters
    if (status) query = query.eq('status', status)
    if (prioridade) query = query.eq('prioridade', prioridade)
    if (origem) query = query.eq('origem', origem)
    if (etapaFunil) query = query.eq('etapa_funil', etapaFunil)
    if (vendedor) query = query.ilike('vendedor_responsavel', `%${vendedor}%`)
    if (modelo) query = query.or(`modelo_interesse.ilike.%${modelo}%,marca_interesse.ilike.%${modelo}%`)
    if (dateFrom) query = query.gte('criado_em', dateFrom)
    if (dateTo) query = query.lte('criado_em', `${dateTo}T23:59:59`)
    if (lastContactFrom) query = query.gte('data_ultimo_contato', lastContactFrom)
    if (lastContactTo) query = query.lte('data_ultimo_contato', `${lastContactTo}T23:59:59`)
    if (search) {
      query = query.or(
        `nome.ilike.%${search}%,telefone.ilike.%${search}%,email.ilike.%${search}%,marca_interesse.ilike.%${search}%,modelo_interesse.ilike.%${search}%,veiculo_placa.ilike.%${search}%`
      )
    }

    // Filtro de fonte: narrow server-side quando possível (casos "pago" têm
    // condições afirmativas); casos "negativos" (orgânico/direto/outro) são
    // filtrados em memória após o fetch.
    const fonteNeedsPostFilter = fonte !== null && fonteToPostgrestOr(fonte) === null
    if (fonte && !fonteNeedsPostFilter) {
      const orExpr = fonteToPostgrestOr(fonte)
      if (orExpr) query = query.or(orExpr)
    }

    // Get next contact for each lead (subquery simulation)
    query = query.order('criado_em', { ascending: false })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: leads, error, count } = await query

    console.log('[Leads API] Query result - count:', count, 'leads length:', leads?.length, 'error:', error)

    if (error) {
      console.error('Leads query error:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Get next contact dates for leads
    const leadIds = leads?.map(l => l.id) || []
    let leadsWithContacts: LeadWithCliente[] = leads || []

    if (leadIds.length > 0) {
      const { data: eventos } = await supabase
        .from('eventos_lead')
        .select('lead_id, proximo_contato_em')
        .in('lead_id', leadIds)
        .not('proximo_contato_em', 'is', null)
        .gte('proximo_contato_em', new Date().toISOString())
        .order('proximo_contato_em', { ascending: true })

      const nextContactMap = new Map<string, string>()
      eventos?.forEach(e => {
        if (!nextContactMap.has(e.lead_id)) {
          nextContactMap.set(e.lead_id, e.proximo_contato_em!)
        }
      })

      leadsWithContacts = leads?.map(lead => ({
        ...lead,
        proximo_contato: nextContactMap.get(lead.id) || null
      })) || []
    }

    // Classifica fonte de cada lead e aplica post-filter para categorias
    // sem tradução direta em PostgREST (orgânico/direto/referral/outro).
    const withFonte = leadsWithContacts.map(lead => ({
      ...lead,
      fonte: classifyLeadSource({
        utm_source: (lead as any).utm_source,
        utm_medium: (lead as any).utm_medium,
        gclid:      (lead as any).gclid,
        fbclid:     (lead as any).fbclid,
        ttclid:     (lead as any).ttclid,
        referrer:   (lead as any).referrer,
      }),
    }))

    const finalData = fonteNeedsPostFilter
      ? withFonte.filter(l => l.fonte === fonte)
      : withFonte

    // Quando há post-filter, o count do Supabase reflete a query pré-filtro.
    // Melhor expor o count efetivo da página filtrada para a UI não mentir.
    const effectiveTotal = fonteNeedsPostFilter ? finalData.length : (count || 0)

    return NextResponse.json({
      success: true,
      data: finalData,
      pagination: {
        page,
        limit,
        total: effectiveTotal,
        totalPages: Math.ceil(effectiveTotal / limit)
      }
    })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

