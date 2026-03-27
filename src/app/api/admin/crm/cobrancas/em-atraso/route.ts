import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/crm/cobrancas/em-atraso - Overdue boletos
export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const { data: boletos, error } = await supabase
      .from('boletos')
      .select('*')
      .lt('data_vencimento', todayStr)
      .in('status', ['pendente', 'vencido', 'em_negociacao'])
      .order('data_vencimento', { ascending: true })

    if (error) {
      console.error('Boletos em atraso query error:', error)
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

    // Format response for collection agent with days overdue
    const formattedBoletos = (boletos as any[])?.map(boleto => {
      const vencimento = new Date(boleto.data_vencimento)
      vencimento.setHours(0, 0, 0, 0)
      const diasEmAtraso = Math.floor((today.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24))
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
          dias_em_atraso: diasEmAtraso,
          canal_preferido: 'whatsapp'
        }
      }
    }) || []

    // Sort by days overdue (most overdue first)
    formattedBoletos.sort((a: any, b: any) => b.contexto.dias_em_atraso - a.contexto.dias_em_atraso)

    const totalValor = (boletos as any[])?.reduce((sum, b) => sum + (b.valor_total || 0), 0) || 0

    return NextResponse.json({
      success: true,
      data: formattedBoletos,
      total: formattedBoletos.length,
      total_valor: totalValor,
      data_referencia: todayStr
    })
  } catch (error) {
    console.error('Boletos em atraso API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
