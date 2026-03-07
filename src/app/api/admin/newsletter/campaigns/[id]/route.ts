import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// GET - Get single campaign
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch (error) {
    console.error('Error in GET /api/admin/newsletter/campaigns/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, subject, featured_image, sections, html_content, status, scheduled_at } = body

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .update({
        title,
        subject: subject || null,
        featured_image: featured_image || null,
        sections: sections ?? [],
        html_content: html_content || null,
        status: status || 'draft',
        scheduled_at: scheduled_at || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch (error) {
    console.error('Error in PUT /api/admin/newsletter/campaigns/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete campaign
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Only allow deleting draft or cancelled campaigns
    const { data: campaign } = await supabase
      .from('newsletter_campaigns')
      .select('status')
      .eq('id', id)
      .single()

    if (campaign && campaign.status === 'sent') {
      return NextResponse.json({ error: 'Não é possível excluir uma campanha já enviada' }, { status: 400 })
    }

    const { error } = await supabase
      .from('newsletter_campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting campaign:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/newsletter/campaigns/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

