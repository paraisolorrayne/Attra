import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'

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
      session_db_id,
      page_path,
      time_on_page_seconds,
    } = body

    if (!session_db_id || !page_path || time_on_page_seconds === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update the most recent page view for this session and page
    const { data: pageViews } = await supabase
      .from('visitor_page_views')
      .select('id')
      .eq('session_id', session_db_id)
      .eq('page_path', page_path)
      .order('viewed_at', { ascending: false })
      .limit(1)

    if (pageViews && pageViews.length > 0) {
      await supabase
        .from('visitor_page_views')
        .update({ time_on_page_seconds })
        .eq('id', pageViews[0].id)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Tracking] Page time error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

