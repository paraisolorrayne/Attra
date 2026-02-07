import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST - Add comment to task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if task exists and user has access
    const { data: task } = await supabase
      .from('marketing_tasks')
      .select('id, assignments:task_assignments(user_id)')
      .eq('id', id)
      .single()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // For gerente, check if they have access
    if (admin.role === 'gerente') {
      const hasAccess = task.assignments?.some((a: { user_id: string }) => a.user_id === admin.id)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: id,
        user_id: admin.id,
        content: content.trim(),
      })
      .select(`
        *,
        user:admin_users(id, email, name)
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error in comments POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

