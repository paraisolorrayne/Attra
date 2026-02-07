'use client'

import Script from 'next/script'

interface GoogleTagManagerProps {
  gtmId: string
}

/**
 * Google Tag Manager component
 * Loads GTM script with optimal performance settings for Next.js 15
 * 
 * GTM is the recommended approach as it allows managing:
 * - Google Analytics 4
 * - Google Ads conversions
 * - Facebook Pixel
 * - Custom events
 * All from a single container without code changes
 */
export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  if (!gtmId) return null

  return (
    <>
      {/* GTM Script - loads after page becomes interactive */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  )
}

/**
 * GTM NoScript fallback for users with JavaScript disabled
 * Should be placed immediately after the opening <body> tag
 */
export function GoogleTagManagerNoScript({ gtmId }: GoogleTagManagerProps) {
  if (!gtmId) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}

