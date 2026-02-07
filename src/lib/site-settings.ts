import { createClient } from '@/lib/supabase/server'

export interface SiteSettings {
  listen_to_content_enabled: boolean
  engine_sound_section_enabled: boolean
}

const DEFAULT_SETTINGS: SiteSettings = {
  listen_to_content_enabled: true,
  engine_sound_section_enabled: true,
}

/**
 * Fetch site settings from Supabase
 * For use in Server Components and API routes
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('key, value')
    
    if (error) {
      console.error('Error fetching site settings:', error)
      return DEFAULT_SETTINGS
    }
    
    // Convert array to object with defaults
    const settingsObject: SiteSettings = { ...DEFAULT_SETTINGS }
    
    settings?.forEach((setting) => {
      if (setting.key === 'listen_to_content_enabled') {
        settingsObject.listen_to_content_enabled = setting.value === true
      }
      if (setting.key === 'engine_sound_section_enabled') {
        settingsObject.engine_sound_section_enabled = setting.value === true
      }
    })
    
    return settingsObject
  } catch (error) {
    console.error('Error in getSiteSettings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Check if a specific setting is enabled
 */
export async function isSettingEnabled(key: keyof SiteSettings): Promise<boolean> {
  const settings = await getSiteSettings()
  return settings[key]
}

