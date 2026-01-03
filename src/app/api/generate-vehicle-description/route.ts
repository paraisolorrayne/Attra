import { NextRequest, NextResponse } from 'next/server'
import { getVehicleBySlug } from '@/lib/autoconf-api'
import { generateVehicleDescription } from '@/lib/gemini-service'

// Rate limiting - simple in-memory implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous'

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get vehicle slug from query params
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Vehicle slug is required' },
        { status: 400 }
      )
    }

    // Fetch vehicle data
    const vehicle = await getVehicleBySlug(slug)

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Generate description using Gemini
    const description = await generateVehicleDescription(vehicle)

    // Return with cache headers for ISR
    return NextResponse.json(
      { 
        description,
        vehicleId: vehicle.id,
        generatedAt: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('[API] Error generating vehicle description:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}

// POST endpoint for batch generation or forced refresh
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, forceRefresh } = body

    if (!slug) {
      return NextResponse.json(
        { error: 'Vehicle slug is required' },
        { status: 400 }
      )
    }

    // Fetch vehicle data
    const vehicle = await getVehicleBySlug(slug)

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Generate description (forceRefresh could be used to bypass cache)
    const description = await generateVehicleDescription(vehicle)

    return NextResponse.json({
      description,
      vehicleId: vehicle.id,
      generatedAt: new Date().toISOString(),
      refreshed: forceRefresh || false
    })
  } catch (error) {
    console.error('[API] Error in POST generate-vehicle-description:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}

