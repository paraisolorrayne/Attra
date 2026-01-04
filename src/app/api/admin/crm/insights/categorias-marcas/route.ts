import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/admin/crm/insights/categorias-marcas - Category and brand insights
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

    // Get leads with category and brand info
    const { data: leads, error } = await supabase
      .from('leads')
      .select('categoria_interesse, marca_interesse, modelo_interesse, criado_em')
      .gte('criado_em', dateFrom.toISOString())

    if (error) {
      console.error('Insights categorias-marcas error:', error)
      return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
    }

    // Count categories
    const categoryMap = new Map<string, number>()
    leads?.forEach(lead => {
      if (lead.categoria_interesse) {
        const cat = lead.categoria_interesse.toLowerCase()
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
      }
    })

    const categorias = Array.from(categoryMap.entries())
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
        percentual: leads?.length ? Math.round((quantidade / leads.length) * 100) : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)

    // Count brands
    const brandMap = new Map<string, number>()
    leads?.forEach(lead => {
      if (lead.marca_interesse) {
        const brand = lead.marca_interesse.toLowerCase()
        brandMap.set(brand, (brandMap.get(brand) || 0) + 1)
      }
    })

    const marcas = Array.from(brandMap.entries())
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
        percentual: leads?.length ? Math.round((quantidade / leads.length) * 100) : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 15)

    // Count models (brand + model combination)
    const modelMap = new Map<string, number>()
    leads?.forEach(lead => {
      if (lead.marca_interesse && lead.modelo_interesse) {
        const model = `${lead.marca_interesse} ${lead.modelo_interesse}`.toLowerCase()
        modelMap.set(model, (modelMap.get(model) || 0) + 1)
      }
    })

    const modelos = Array.from(modelMap.entries())
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
        percentual: leads?.length ? Math.round((quantidade / leads.length) * 100) : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        periodo_dias: days,
        total_leads: leads?.length || 0,
        categorias,
        marcas,
        modelos_mais_procurados: modelos
      }
    })
  } catch (error) {
    console.error('Insights categorias-marcas API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

