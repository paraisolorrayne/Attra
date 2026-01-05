import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface GeoLocationResponse {
  city: string
  region: string
  country: string
  ip: string
}

/**
 * API Route to fetch geolocation server-side
 * Avoids CORS and mixed-content issues
 */
export async function GET(request: Request) {
  try {
    // Get client IP from headers (works with Vercel/Cloudflare)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || ''

    console.log('[GeoLocation API] Client IP:', clientIp)

    // Try ipapi.co first (supports HTTPS, 1000 req/day free)
    let geoData: GeoLocationResponse | null = null

    try {
      const ipapiResponse = await fetch(`https://ipapi.co/${clientIp}/json/`, {
        headers: { 'Accept': 'application/json' },
      })

      if (ipapiResponse.ok) {
        const data = await ipapiResponse.json()
        if (!data.error) {
          geoData = {
            city: data.city || 'Não identificada',
            region: data.region || 'Não identificada',
            country: data.country_name || 'Brasil',
            ip: data.ip || clientIp,
          }
        }
      }
    } catch (e) {
      console.error('[GeoLocation API] ipapi.co failed:', e)
    }

    // Fallback to ip-api.com (server-side, no CORS issues)
    if (!geoData) {
      try {
        const ipApiUrl = clientIp 
          ? `http://ip-api.com/json/${clientIp}?fields=status,city,regionName,country,query`
          : 'http://ip-api.com/json/?fields=status,city,regionName,country,query'
        
        const ipApiResponse = await fetch(ipApiUrl)

        if (ipApiResponse.ok) {
          const data = await ipApiResponse.json()
          if (data.status === 'success') {
            geoData = {
              city: data.city || 'Não identificada',
              region: data.regionName || 'Não identificada',
              country: data.country || 'Brasil',
              ip: data.query || clientIp,
            }
          }
        }
      } catch (e) {
        console.error('[GeoLocation API] ip-api.com failed:', e)
      }
    }

    if (geoData) {
      console.log('[GeoLocation API] Success:', geoData.city, geoData.region)
      return NextResponse.json(geoData)
    }

    // Return default if all APIs fail
    return NextResponse.json({
      city: 'Não identificada',
      region: 'Não identificada',
      country: 'Brasil',
      ip: clientIp,
    })

  } catch (error) {
    console.error('[GeoLocation API] Error:', error)
    return NextResponse.json(
      { city: 'Não identificada', region: 'Não identificada', country: 'Brasil', ip: '' },
      { status: 200 }
    )
  }
}

