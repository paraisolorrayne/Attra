import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/crm/cobrancas/para-hoje - Boletos due today
export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const today = new Date().toISOString().split('T')[0]

    const { data: boletos, error } = await supabase
      .from('boletos')
      .select('*')
      .eq('data_vencimento', today)
      .in('status', ['pendente', 'em_negociacao'])
      .order('valor_total', { ascending: false })

    if (error) {
      console.error('Boletos para hoje query error:', error)
      return NextResponse.json({ error: 'Failed to fetch boletos' }, { status: 500 })
    }

    // Fetch clientes separately (no FK join)
    const clienteIds = [...new Set((boletos || []).map((b: any) => b.cliente_id).filter(Boolean))]
    const clienteMap: Record<string, any> = {}
    if (clienteIds.length > 0) {
      const { data: clientes } = await (supabase as any)
        .from('clientes')
        .select('id, nome, telefone, email')
        .in('id', clienteIds)
      for (const c of clientes || []) clienteMap[c.id] = c
    }

    // Format response for collection agent
    const formattedBoletos = (boletos as any[])?.map(boleto => {
      const cliente = clienteMap[boleto.cliente_id] || {}
      return {
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email
        },
        boleto: {
          id: boleto.id,
          identificador_externo: boleto.identificador_externo,
          descricao: boleto.descricao,
          valor_total: boleto.valor_total,
          data_vencimento: boleto.data_vencimento,
          status: boleto.status
        },
        contexto: {
          dias_em_atraso: 0,
          canal_preferido: 'whatsapp'
        }
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: formattedBoletos,
      total: formattedBoletos.length,
      data_referencia: today
    })
  } catch (error) {
    console.error('Boletos para hoje API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
