import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - Public endpoint for active banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const device = searchParams.get('device') || 'desktop'
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('site_banners')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true })
      .limit(limit)

    // Filter by device type
    if (device === 'desktop') {
      query = query.in('device_type', ['all', 'desktop'])
    } else if (device === 'mobile') {
      query = query.in('device_type', ['all', 'mobile'])
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching public banners:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, banners: data || [] })
  } catch (error) {
    console.error('Error in GET /api/banners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

