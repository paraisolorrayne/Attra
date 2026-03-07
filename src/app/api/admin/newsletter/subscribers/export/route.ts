import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET - Export subscribers as CSV
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'

    const supabase = createAdminClient()
    let query = supabase
      .from('newsletter_subscribers')
      .select('email, name, is_active, source, subscribed_at, unsubscribed_at')
      .order('subscribed_at', { ascending: false })

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error exporting subscribers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Build CSV
    const headers = ['Email', 'Nome', 'Ativo', 'Origem', 'Inscrito em', 'Desinscrito em']
    const rows = (data || []).map(s => [
      s.email,
      s.name || '',
      s.is_active ? 'Sim' : 'Não',
      s.source,
      s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString('pt-BR') : '',
      s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString('pt-BR') : '',
    ])

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="assinantes-newsletter-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/admin/newsletter/subscribers/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

