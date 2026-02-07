import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Channel behavior types
export type ChannelBehavior = 'leadster_static' | 'leadster_ai' | 'whatsapp_direct' | 'default'

export interface PageChannelSetting {
  page_path: string
  page_name: string
  channel_behavior: ChannelBehavior
  custom_greeting: string | null
  custom_whatsapp_message: string | null
  is_enabled: boolean
}

// Default settings if database is not available
const DEFAULT_SETTINGS: PageChannelSetting[] = [
  { page_path: '/', page_name: 'Página Inicial', channel_behavior: 'leadster_ai', custom_greeting: null, custom_whatsapp_message: null, is_enabled: true },
  { page_path: '/estoque', page_name: 'Estoque', channel_behavior: 'leadster_static', custom_greeting: null, custom_whatsapp_message: null, is_enabled: true },
  { page_path: '/veiculo/*', page_name: 'Página de Veículo', channel_behavior: 'whatsapp_direct', custom_greeting: null, custom_whatsapp_message: null, is_enabled: true },
]

/**
 * GET /api/page-channels
 * Public endpoint to fetch page channel settings
 * Used by frontend components to determine button behavior
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Optional: filter by specific page path
    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('path')
    
    let query = supabase
      .from('page_channel_settings')
      .select('page_path, page_name, channel_behavior, custom_greeting, custom_whatsapp_message, is_enabled')
      .eq('is_enabled', true)
    
    if (pagePath) {
      // Get settings for a specific page path
      // We need to find the best match (exact match or wildcard pattern)
      const { data: settings, error } = await query
      
      if (error) {
        console.error('Error fetching page channel settings:', error)
        return NextResponse.json({ settings: DEFAULT_SETTINGS })
      }
      
      // Find best matching setting for the given path
      const matchedSetting = findBestMatch(pagePath, settings || [])
      
      return NextResponse.json({ 
        setting: matchedSetting,
        matched_path: matchedSetting?.page_path || null
      })
    }
    
    const { data: settings, error } = await query.order('page_path', { ascending: true })
    
    if (error) {
      console.error('Error fetching public page channel settings:', error)
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }
    
    return NextResponse.json({ settings: settings || DEFAULT_SETTINGS })
  } catch (error) {
    console.error('Error in GET page-channels:', error)
    return NextResponse.json({ settings: DEFAULT_SETTINGS })
  }
}

/**
 * Find the best matching page channel setting for a given path
 * Prioritizes exact matches, then wildcards
 */
function findBestMatch(path: string, settings: PageChannelSetting[]): PageChannelSetting | null {
  // First, look for exact match
  const exactMatch = settings.find(s => s.page_path === path)
  if (exactMatch) return exactMatch
  
  // Then, look for wildcard matches
  // Sort by specificity (longer paths first)
  const wildcardMatches = settings
    .filter(s => s.page_path.endsWith('/*'))
    .sort((a, b) => b.page_path.length - a.page_path.length)
  
  for (const setting of wildcardMatches) {
    const basePath = setting.page_path.slice(0, -2) // Remove /*
    if (path.startsWith(basePath + '/') || path === basePath) {
      return setting
    }
  }
  
  // Finally, check root path
  const rootMatch = settings.find(s => s.page_path === '/')
  if (rootMatch && path.startsWith('/')) {
    return rootMatch
  }
  
  return null
}

