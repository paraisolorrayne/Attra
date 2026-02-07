import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'

export const dynamic = 'force-dynamic'

// Channel behavior types
export type ChannelBehavior = 'leadster_static' | 'leadster_ai' | 'whatsapp_direct' | 'default'

export interface PageChannelSetting {
  id: string
  page_path: string
  page_name: string
  channel_behavior: ChannelBehavior
  custom_greeting: string | null
  custom_whatsapp_message: string | null
  is_enabled: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

/**
 * GET /api/admin/page-channels
 * Fetch all page channel settings
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('page_channel_settings')
      .select('*')
      .order('page_path', { ascending: true })
    
    if (error) {
      console.error('Error fetching page channel settings:', error)
      return NextResponse.json({ settings: [] })
    }
    
    return NextResponse.json({ settings: settings || [] })
  } catch (error) {
    console.error('Error in GET page-channels:', error)
    return NextResponse.json({ settings: [] })
  }
}

/**
 * POST /api/admin/page-channels
 * Create a new page channel setting
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const { page_path, page_name, channel_behavior, custom_greeting, custom_whatsapp_message, is_enabled } = body
    
    if (!page_path || !page_name) {
      return NextResponse.json({ error: 'page_path and page_name are required' }, { status: 400 })
    }
    
    const adminClient = createAdminClient()
    
    const { data, error } = await adminClient
      .from('page_channel_settings')
      .insert({
        page_path,
        page_name,
        channel_behavior: channel_behavior || 'default',
        custom_greeting,
        custom_whatsapp_message,
        is_enabled: is_enabled ?? true,
        updated_by: admin.id,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating page channel setting:', error)
      return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, setting: data })
  } catch (error) {
    console.error('Error in POST page-channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/page-channels
 * Update a page channel setting
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    
    const adminClient = createAdminClient()
    
    const { data, error } = await adminClient
      .from('page_channel_settings')
      .update({
        ...updateData,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating page channel setting:', error)
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, setting: data })
  } catch (error) {
    console.error('Error in PATCH page-channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

