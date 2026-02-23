import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'

// Use service role for tracking (no user auth required)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_PRESETS.api)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      )
    }

    const body = await request.json()
    const {
      visitor_id,
      session_id,
      device_data,
      utm_params,
      click_ids,
      referrer_url,
    } = body

    if (!visitor_id || !session_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] 
      || request.headers.get('x-real-ip') 
      || null

    // Extract referrer domain
    let referrer_domain = null
    if (referrer_url) {
      try {
        referrer_domain = new URL(referrer_url).hostname
      } catch {}
    }

    // Upsert fingerprint
    const { data: fingerprint, error: fpError } = await supabase
      .from('visitor_fingerprints')
      .upsert({
        visitor_id,
        browser_name: device_data?.browser_name || null,
        browser_version: device_data?.browser_version || null,
        os_name: device_data?.os_name || null,
        os_version: device_data?.os_version || null,
        device_type: device_data?.device_type || null,
        screen_resolution: device_data?.screen_resolution || null,
        timezone: device_data?.timezone || null,
        language: device_data?.language || null,
        confidence_score: 0.9, // High confidence for device fingerprint
        last_seen_at: new Date().toISOString(),
        total_visits: 1, // Will be incremented on subsequent visits
      }, {
        onConflict: 'visitor_id',
        ignoreDuplicates: false,
      })
      .select('id')
      .single()

    if (fpError) {
      console.error('[Tracking] Fingerprint upsert error:', fpError)
      // Try to get existing fingerprint
      const { data: existingFp } = await supabase
        .from('visitor_fingerprints')
        .select('id')
        .eq('visitor_id', visitor_id)
        .single()
      
      if (!existingFp) {
        return NextResponse.json({ error: 'Failed to create fingerprint' }, { status: 500 })
      }
      
      // Update last_seen and increment visits
      await supabase
        .from('visitor_fingerprints')
        .update({
          last_seen_at: new Date().toISOString(),
          total_visits: supabase.rpc('increment', { x: 1, row_id: existingFp.id }),
        })
        .eq('id', existingFp.id)
      
      // Create session with existing fingerprint
      const { data: session } = await supabase
        .from('visitor_sessions')
        .insert({
          fingerprint_id: existingFp.id,
          session_id,
          referrer_url,
          referrer_domain,
          utm_source: utm_params?.utm_source || null,
          utm_medium: utm_params?.utm_medium || null,
          utm_campaign: utm_params?.utm_campaign || null,
          utm_content: utm_params?.utm_content || null,
          utm_term: utm_params?.utm_term || null,
          gclid: click_ids?.gclid || null,
          fbclid: click_ids?.fbclid || null,
          ttclid: click_ids?.ttclid || null,
          ip_address: ip,
        })
        .select('id')
        .single()

      return NextResponse.json({
        success: true,
        fingerprint_db_id: existingFp.id,
        session_db_id: session?.id || null,
      })
    }

    // Create session with new fingerprint
    const { data: session, error: sessError } = await supabase
      .from('visitor_sessions')
      .insert({
        fingerprint_id: fingerprint.id,
        session_id,
        referrer_url,
        referrer_domain,
        utm_source: utm_params?.utm_source || null,
        utm_medium: utm_params?.utm_medium || null,
        utm_campaign: utm_params?.utm_campaign || null,
        utm_content: utm_params?.utm_content || null,
        utm_term: utm_params?.utm_term || null,
        gclid: click_ids?.gclid || null,
        fbclid: click_ids?.fbclid || null,
        ttclid: click_ids?.ttclid || null,
        ip_address: ip,
      })
      .select('id')
      .single()

    if (sessError) {
      console.error('[Tracking] Session insert error:', sessError)
    }

    return NextResponse.json({
      success: true,
      fingerprint_db_id: fingerprint.id,
      session_db_id: session?.id || null,
    })

  } catch (error) {
    console.error('[Tracking] Session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

