import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET - List all banners
export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching banners:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, banners: data })
  } catch (error) {
    console.error('Error in GET /api/admin/banners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, image_url, image_mobile_url, target_url, display_order, is_active, start_date, end_date, device_type } = body

    if (!title || !image_url) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_banners')
      .insert({
        title,
        description: description || null,
        image_url,
        image_mobile_url: image_mobile_url || null,
        target_url: target_url || null,
        display_order: display_order ?? 0,
        is_active: is_active ?? true,
        start_date: start_date || null,
        end_date: end_date || null,
        device_type: device_type || 'all',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating banner:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, banner: data })
  } catch (error) {
    console.error('Error in POST /api/admin/banners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

