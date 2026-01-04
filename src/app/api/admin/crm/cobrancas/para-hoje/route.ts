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
      .select(`
        *,
        cliente:clientes(id, nome, telefone, email)
      `)
      .eq('data_vencimento', today)
      .in('status', ['pendente', 'em_negociacao'])
      .order('valor_total', { ascending: false })

    if (error) {
      console.error('Boletos para hoje query error:', error)
      return NextResponse.json({ error: 'Failed to fetch boletos' }, { status: 500 })
    }

    // Format response for collection agent
    const formattedBoletos = boletos?.map(boleto => ({
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
        dias_em_atraso: 0,
        canal_preferido: 'whatsapp'
      }
    })) || []

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

