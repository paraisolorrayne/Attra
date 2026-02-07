import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'

export const dynamic = 'force-dynamic'

// Known setting keys with their types
export type SettingKey = 'listen_to_content_enabled' | 'engine_sound_section_enabled'

export interface SiteSettings {
  listen_to_content_enabled: boolean
  engine_sound_section_enabled: boolean
}

/**
 * GET /api/admin/settings
 * Fetch all site settings
 * Can be accessed by anyone (for frontend checks)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('key, value')
    
    if (error) {
      console.error('Error fetching settings:', error)
      // Return defaults if table doesn't exist yet
      return NextResponse.json({
        settings: {
          listen_to_content_enabled: true,
          engine_sound_section_enabled: true,
        }
      })
    }
    
    // Convert array to object
    const settingsObject: Record<string, unknown> = {
      // Defaults
      listen_to_content_enabled: true,
      engine_sound_section_enabled: true,
    }
    
    settings?.forEach((setting) => {
      settingsObject[setting.key] = setting.value
    })
    
    return NextResponse.json({ settings: settingsObject })
  } catch (error) {
    console.error('Error in settings GET:', error)
    return NextResponse.json({
      settings: {
        listen_to_content_enabled: true,
        engine_sound_section_enabled: true,
      }
    })
  }
}

/**
 * PATCH /api/admin/settings
 * Update a site setting
 * Requires admin role
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getCurrentAdmin()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Only admin role can change settings
    if (admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Only admin users can modify settings' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { key, value } = body
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing key or value' },
        { status: 400 }
      )
    }
    
    // Validate key
    const validKeys: SettingKey[] = ['listen_to_content_enabled', 'engine_sound_section_enabled']
    if (!validKeys.includes(key as SettingKey)) {
      return NextResponse.json(
        { error: 'Invalid setting key' },
        { status: 400 }
      )
    }
    
    // Use admin client to bypass RLS for upsert
    const adminClient = createAdminClient()
    
    // Upsert the setting
    const { data, error } = await adminClient
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error updating setting:', error)
      return NextResponse.json(
        { error: 'Failed to update setting' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      setting: data,
    })
  } catch (error) {
    console.error('Error in settings PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

