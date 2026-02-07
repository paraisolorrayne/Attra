'use client'

import { useState, useEffect } from 'react'

export type ChannelBehavior = 'leadster_static' | 'leadster_ai' | 'whatsapp_direct' | 'default'

export interface PageChannelSetting {
  page_path: string
  page_name: string
  channel_behavior: ChannelBehavior
  custom_greeting: string | null
  custom_whatsapp_message: string | null
  is_enabled: boolean
}

interface UsePageChannelResult {
  channelBehavior: ChannelBehavior
  customGreeting: string | null
  customWhatsappMessage: string | null
  isLoading: boolean
  isEnabled: boolean
}

// Map channel behavior to the legacy page behavior used by WhatsAppButton
export type PageBehavior = 'vehicle' | 'estoque' | 'general'

export function mapChannelToBehavior(
  channelBehavior: ChannelBehavior,
  currentPath: string,
  hasVehicle: boolean
): PageBehavior {
  // If there's a vehicle context, always use vehicle behavior (WhatsApp direct)
  if (hasVehicle) return 'vehicle'
  
  // Map new channel behaviors to legacy behaviors
  switch (channelBehavior) {
    case 'whatsapp_direct':
      return 'vehicle' // Uses WhatsApp redirect
    case 'leadster_static':
      return 'estoque' // Uses static chat widget
    case 'leadster_ai':
      return 'general' // Uses AI chat widget
    case 'default':
      // Fall back to path-based detection
      if (currentPath.includes('/veiculo/')) return 'vehicle'
      if (currentPath === '/estoque' || currentPath.startsWith('/estoque')) return 'estoque'
      return 'general'
    default:
      return 'general'
  }
}

/**
 * Hook to fetch page channel settings for the current page
 */
export function usePageChannel(currentPath: string): UsePageChannelResult {
  const [setting, setSetting] = useState<PageChannelSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch(`/api/page-channels?path=${encodeURIComponent(currentPath)}`)
        const data = await res.json()
        
        if (data.setting) {
          setSetting(data.setting)
        }
      } catch (error) {
        console.error('[usePageChannel] Error fetching setting:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSetting()
  }, [currentPath])

  return {
    channelBehavior: setting?.channel_behavior || 'default',
    customGreeting: setting?.custom_greeting || null,
    customWhatsappMessage: setting?.custom_whatsapp_message || null,
    isLoading,
    isEnabled: setting?.is_enabled ?? true,
  }
}

