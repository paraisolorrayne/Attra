import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { LeadWithCliente, StatusLead, PrioridadeLead, OrigemLead } from '@/types/database'

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
    const responsavel = searchParams.get('responsavel')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('leads')
      .select(`
        *,
        cliente:clientes(id, nome, telefone, email)
      `, { count: 'exact' })

    // Apply filters
    if (status) query = query.eq('status', status)
    if (prioridade) query = query.eq('prioridade', prioridade)
    if (origem) query = query.eq('origem', origem)
    if (dateFrom) query = query.gte('criado_em', dateFrom)
    if (dateTo) query = query.lte('criado_em', dateTo)
    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,email.ilike.%${search}%`)
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

    return NextResponse.json({
      success: true,
      data: leadsWithContacts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

