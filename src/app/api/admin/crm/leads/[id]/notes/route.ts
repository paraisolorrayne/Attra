import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated, getCurrentAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import type { LeadNoteInsert } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/admin/crm/leads/:id/notes - List lead notes
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: notes, error } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lead notes query error:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: notes })
  } catch (error) {
    console.error('Lead notes API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/crm/leads/:id/notes - Create lead note
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const admin = await getCurrentAdmin()
    const supabase = createAdminClient()

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const noteData: LeadNoteInsert = {
      lead_id: id,
      content: body.content.trim(),
      created_by: admin?.name || admin?.email || 'Admin',
    }

    const { data: note, error } = await supabase
      .from('lead_notes')
      .insert(noteData)
      .select()
      .single()

    if (error) {
      console.error('Lead note creation error:', error)
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: note }, { status: 201 })
  } catch (error) {
    console.error('Lead note creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/crm/leads/:id/notes - Delete a note (by noteId in body)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { noteId } = await request.json()

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('lead_notes')
      .delete()
      .eq('id', noteId)
      .eq('lead_id', id)

    if (error) {
      console.error('Lead note deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead note deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

