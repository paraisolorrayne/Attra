'use client'

import { useState, useEffect } from 'react'

export interface SiteSettings {
  listen_to_content_enabled: boolean
  engine_sound_section_enabled: boolean
}

const DEFAULT_SETTINGS: SiteSettings = {
  listen_to_content_enabled: true,
  engine_sound_section_enabled: true,
}

// Cache for settings to avoid multiple fetches
let settingsCache: SiteSettings | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 30000 // 30 seconds

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(settingsCache || DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(!settingsCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      // Use cache if still valid
      const now = Date.now()
      if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setSettings(settingsCache)
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('/api/settings')
        if (!res.ok) {
          throw new Error('Failed to fetch settings')
        }
        const data = await res.json()
        
        if (data.settings) {
          settingsCache = data.settings
          cacheTimestamp = now
          setSettings(data.settings)
        }
      } catch (err) {
        console.error('Error fetching site settings:', err)
        setError('Failed to load settings')
        // Use defaults on error
        setSettings(DEFAULT_SETTINGS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, isLoading, error }
}

/**
 * Server-side function to fetch settings
 * Can be used in Server Components
 */
export async function getServerSideSettings(): Promise<SiteSettings> {
  try {
    // In server context, we need to use absolute URL or direct DB access
    // For now, return defaults - the actual implementation would use Supabase directly
    return DEFAULT_SETTINGS
  } catch (error) {
    console.error('Error fetching server-side settings:', error)
    return DEFAULT_SETTINGS
  }
}

