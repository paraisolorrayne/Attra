import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET - Get single banner
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, banner: data })
  } catch (error) {
    console.error('Error in GET /api/admin/banners/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, image_url, image_mobile_url, target_url, display_order, is_active, start_date, end_date, device_type } = body

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_banners')
      .update({
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
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating banner:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, banner: data })
  } catch (error) {
    console.error('Error in PUT /api/admin/banners/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete banner
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('site_banners')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting banner:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/banners/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

