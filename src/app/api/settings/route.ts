import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Default settings if database is not available
const DEFAULT_SETTINGS = {
  listen_to_content_enabled: true,
  engine_sound_section_enabled: true,
}

/**
 * GET /api/settings
 * Public endpoint to fetch site settings
 * Used by frontend components to check feature flags
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('key, value')
    
    if (error) {
      console.error('Error fetching public settings:', error)
      // Return defaults if table doesn't exist yet
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }
    
    // Convert array to object with defaults
    const settingsObject: Record<string, unknown> = { ...DEFAULT_SETTINGS }
    
    settings?.forEach((setting) => {
      settingsObject[setting.key] = setting.value
    })
    
    return NextResponse.json({ 
      settings: settingsObject 
    }, {
      headers: {
        // Cache for 30 seconds to reduce DB calls but still allow real-time updates
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    })
  } catch (error) {
    console.error('Error in public settings GET:', error)
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}

