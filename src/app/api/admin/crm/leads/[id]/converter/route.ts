import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { Lead, Cliente } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/crm/leads/:id/converter
 *
 * Converte um lead (etapa_funil = 'ganho') em um contato (clientes).
 *
 * Campos copiados do lead para clientes:
 *   nome, telefone, email → campos diretos
 *   faixa_preco_*         → faixa_valor_preferida_*
 *   marca_interesse       → marcas_preferidas (array)
 *   interesse_tipo        → tipos_preferidos (array)
 *   origem (mapeado)      → origem_principal
 *
 * Idempotência: se lead.cliente_id já existir, retorna sucesso com o ID existente.
 * Rollback compensatório: se atualizar lead falhar, deleta o contato recém-criado.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // 1. Buscar o lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (leadError || !leadData) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Cast explícito — o gerador de tipos do Supabase retorna 'never' sem contexto de schema
    const lead = leadData as unknown as Lead

    // 2. Idempotência — se já tem cliente_id, retorna o existente
    if (lead.cliente_id) {
      return NextResponse.json({
        success: true,
        cliente_id: lead.cliente_id,
        already_converted: true
      })
    }

    // 3. Validar etapa
    if (lead.etapa_funil !== 'ganho') {
      return NextResponse.json(
        { error: 'Lead deve estar na etapa "Fechado ganho" para ser convertido' },
        { status: 422 }
      )
    }

    // 4. Mapear origem
    const origemMap: Record<string, 'site' | 'whatsapp' | 'indicacao' | 'crm_externo'> = {
      site_chat:      'site',
      whatsapp_ia:    'whatsapp',
      instagram_form: 'site',
      crm_externo:    'crm_externo'
    }
    const origemCliente = origemMap[lead.origem] ?? 'site'

    // 5. Criar contato
    const payload = {
      nome:                      lead.nome,
      telefone:                  lead.telefone ?? null,
      email:                     lead.email ?? null,
      cpf_cnpj:                  null,
      origem_principal:          origemCliente,
      faixa_valor_preferida_min: lead.faixa_preco_interesse_min ?? null,
      faixa_valor_preferida_max: lead.faixa_preco_interesse_max ?? null,
      tipos_preferidos:          lead.interesse_tipo ? [lead.interesse_tipo] : [],
      marcas_preferidas:         lead.marca_interesse ? [lead.marca_interesse] : []
    }

    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(payload as any)
      .select()
      .single()

    if (clienteError || !clienteData) {
      console.error('Erro ao criar contato:', clienteError)
      return NextResponse.json({ error: 'Falha ao criar contato' }, { status: 500 })
    }

    const novoCliente = clienteData as unknown as Cliente

    // 6. Vincular lead ao contato
    const { error: updateError } = await supabase
      .from('leads')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ cliente_id: novoCliente.id } as any)
      .eq('id', id)

    // 7. Rollback compensatório
    if (updateError) {
      console.error('Erro ao vincular lead. Iniciando rollback:', updateError)
      await supabase.from('clientes').delete().eq('id', novoCliente.id)
      return NextResponse.json(
        { error: 'Falha ao vincular lead ao contato. Operação revertida.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success:           true,
      cliente_id:        novoCliente.id,
      already_converted: false
    })
  } catch (error) {
    console.error('Converter lead API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
