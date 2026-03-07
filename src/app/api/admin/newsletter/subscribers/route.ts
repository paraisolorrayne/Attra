import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET - List all subscribers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, active, inactive
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const supabase = createAdminClient()
    let query = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching subscribers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscribers: data,
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/admin/newsletter/subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add subscriber(s) - supports single and batch import
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const supabase = createAdminClient()

    // Batch import
    if (Array.isArray(body.subscribers)) {
      const subscribers = body.subscribers.map((s: { email: string; name?: string }) => ({
        email: s.email.toLowerCase().trim(),
        name: s.name || null,
        is_active: true,
        source: 'import',
        subscribed_at: new Date().toISOString(),
      }))

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .upsert(subscribers, { onConflict: 'email', ignoreDuplicates: true })
        .select()

      if (error) {
        console.error('Error importing subscribers:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, imported: data?.length || 0 })
    }

    // Single subscriber
    const { email, name } = body
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: email.toLowerCase().trim(),
        name: name || null,
        is_active: true,
        source: body.source || 'admin',
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' })
      .select()
      .single()

    if (error) {
      console.error('Error adding subscriber:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscriber: data })
  } catch (error) {
    console.error('Error in POST /api/admin/newsletter/subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

