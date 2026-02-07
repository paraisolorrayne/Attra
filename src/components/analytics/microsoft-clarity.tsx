'use client'

import Script from 'next/script'

interface MicrosoftClarityProps {
  clarityId: string
}

/**
 * Microsoft Clarity component
 * Provides heatmaps, session recordings, and user behavior analytics
 * 
 * Features:
 * - Heatmaps (click, scroll, area)
 * - Session recordings
 * - Rage clicks detection
 * - Dead clicks detection
 * - JavaScript errors tracking
 * - Insights dashboard
 * 
 * Free tier: Unlimited sessions
 */
export function MicrosoftClarity({ clarityId }: MicrosoftClarityProps) {
  if (!clarityId) return null

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");
        `,
      }}
    />
  )
}

/**
 * Clarity custom tags for better segmentation
 * Use these to identify users and add custom data
 */
export function setClarityTag(key: string, value: string): void {
  if (typeof window !== 'undefined' && (window as unknown as { clarity?: (action: string, key: string, value: string) => void }).clarity) {
    (window as unknown as { clarity: (action: string, key: string, value: string) => void }).clarity('set', key, value)
  }
}

/**
 * Identify user in Clarity for session attribution
 */
export function identifyClarityUser(userId: string, sessionId?: string, pageId?: string): void {
  if (typeof window !== 'undefined' && (window as unknown as { clarity?: (action: string, ...args: (string | undefined)[]) => void }).clarity) {
    (window as unknown as { clarity: (action: string, ...args: (string | undefined)[]) => void }).clarity('identify', userId, sessionId, pageId)
  }
}

