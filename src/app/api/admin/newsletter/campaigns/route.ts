import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated, getCurrentAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET - List all campaigns
export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaigns: data })
  } catch (error) {
    console.error('Error in GET /api/admin/newsletter/campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await getCurrentAdmin()
    const body = await request.json()
    const { title, subject, featured_image, sections, html_content, status, scheduled_at } = body

    if (!title) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .insert({
        title,
        subject: subject || null,
        featured_image: featured_image || null,
        sections: sections || [],
        html_content: html_content || null,
        status: status || 'draft',
        scheduled_at: scheduled_at || null,
        sent_at: null,
        recipient_count: 0,
        created_by: admin?.id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch (error) {
    console.error('Error in POST /api/admin/newsletter/campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

