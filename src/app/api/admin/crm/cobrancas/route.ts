import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { BoletoWithCliente, StatusBoleto } from '@/types/database'

// GET /api/admin/crm/cobrancas - List boletos with filters
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as StatusBoleto | null
    const clienteId = searchParams.get('cliente_id')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const supabase = createAdminClient()

    let query = supabase
      .from('boletos')
      .select(`
        *,
        cliente:clientes(id, nome, telefone, email),
        lead:leads(id, nome, status)
      `, { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (clienteId) query = query.eq('cliente_id', clienteId)
    if (dateFrom) query = query.gte('data_vencimento', dateFrom)
    if (dateTo) query = query.lte('data_vencimento', dateTo)

    query = query.order('data_vencimento', { ascending: true })

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: boletos, error, count } = await query

    if (error) {
      console.error('Boletos query error:', error)
      return NextResponse.json({ error: 'Failed to fetch boletos' }, { status: 500 })
    }

    // Calculate days overdue
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const boletosWithDias: BoletoWithCliente[] = boletos?.map(boleto => {
      const vencimento = new Date(boleto.data_vencimento)
      vencimento.setHours(0, 0, 0, 0)
      const diasEmAtraso = boleto.status !== 'pago' && vencimento < today 
        ? Math.floor((today.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      return {
        ...boleto,
        dias_em_atraso: diasEmAtraso
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: boletosWithDias,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Cobrancas API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

