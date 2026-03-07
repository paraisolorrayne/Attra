import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

// PUT - Update subscriber
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
    const { name, is_active } = body

    const supabase = createAdminClient()
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (is_active !== undefined) {
      updateData.is_active = is_active
      if (!is_active) updateData.unsubscribed_at = new Date().toISOString()
      else updateData.unsubscribed_at = null
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscriber:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscriber: data })
  } catch (error) {
    console.error('Error in PUT /api/admin/newsletter/subscribers/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete subscriber
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
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subscriber:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/newsletter/subscribers/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

