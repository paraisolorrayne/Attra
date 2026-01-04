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
      .select(`
        *,
        cliente:clientes(id, nome, telefone, email)
      `)
      .lt('data_vencimento', todayStr)
      .in('status', ['pendente', 'vencido', 'em_negociacao'])
      .order('data_vencimento', { ascending: true })

    if (error) {
      console.error('Boletos em atraso query error:', error)
      return NextResponse.json({ error: 'Failed to fetch boletos' }, { status: 500 })
    }

    // Format response for collection agent with days overdue
    const formattedBoletos = boletos?.map(boleto => {
      const vencimento = new Date(boleto.data_vencimento)
      vencimento.setHours(0, 0, 0, 0)
      const diasEmAtraso = Math.floor((today.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24))

      return {
        cliente: {
          id: boleto.cliente?.id,
          nome: boleto.cliente?.nome,
          telefone: boleto.cliente?.telefone,
          email: boleto.cliente?.email
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
    formattedBoletos.sort((a, b) => b.contexto.dias_em_atraso - a.contexto.dias_em_atraso)

    const totalValor = boletos?.reduce((sum, b) => sum + (b.valor_total || 0), 0) || 0

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

