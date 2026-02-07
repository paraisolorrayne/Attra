import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { createAdminClient } from '@/lib/supabase/server'
import type { TaskStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

// GET - Get single task with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: task, error } = await supabase
      .from('marketing_tasks')
      .select(`
        *,
        strategy:marketing_strategies(id, name, category),
        assignments:task_assignments(
          id,
          user_id,
          user:admin_users!task_assignments_user_id_fkey(id, email, name)
        ),
        comments:task_comments(
          id, content, created_at,
          user:admin_users!task_comments_user_id_fkey(id, email, name)
        ),
        history:task_status_history(
          id, old_status, new_status, changed_at,
          changed_by_user:admin_users!task_status_history_changed_by_fkey(id, email, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // For gerente, check if they have access
    if (admin.role === 'gerente') {
      const hasAccess = task.assignments?.some((a: { user_id: string }) => a.user_id === admin.id)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const transformedTask = {
      ...task,
      assignees: task.assignments?.map((a: { user: { id: string; email: string; name: string | null } }) => a.user) || [],
      comments: task.comments?.sort((a: { created_at: string }, b: { created_at: string }) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [],
      history: task.history?.sort((a: { changed_at: string }, b: { changed_at: string }) => 
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
      ) || []
    }

    return NextResponse.json({ task: transformedTask })
  } catch (error) {
    console.error('Error in task GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update task
export async function PATCH(
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
    const supabase = createAdminClient()

    // Get current task
    const { data: currentTask } = await supabase
      .from('marketing_tasks')
      .select('*, assignments:task_assignments(user_id)')
      .eq('id', id)
      .single()

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check access for gerente
    if (admin.role === 'gerente') {
      const hasAccess = currentTask.assignments?.some((a: { user_id: string }) => a.user_id === admin.id)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
      // Gerente can only update status and actual_hours
      const allowedFields = ['status', 'actual_hours']
      const updateKeys = Object.keys(body)
      const hasDisallowedFields = updateKeys.some(k => !allowedFields.includes(k))
      if (hasDisallowedFields) {
        return NextResponse.json({ error: 'You can only update status and hours' }, { status: 403 })
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    const allowedUpdateFields = ['title', 'description', 'strategy_id', 'category', 'status', 'priority', 'due_date', 'estimated_hours', 'actual_hours']
    
    for (const field of allowedUpdateFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Update the task
    const { data: task, error: updateError } = await supabase
      .from('marketing_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating task:', updateError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    // If status changed, create history entry
    if (body.status && body.status !== currentTask.status) {
      await supabase.from('task_status_history').insert({
        task_id: id,
        old_status: currentTask.status,
        new_status: body.status as TaskStatus,
        changed_by: admin.id,
      })
    }

    // Update assignees if provided (admin only)
    if (admin.role === 'admin' && body.assignees !== undefined) {
      // Delete existing assignments
      await supabase.from('task_assignments').delete().eq('task_id', id)
      
      // Create new assignments
      if (Array.isArray(body.assignees) && body.assignees.length > 0) {
        const assignments = body.assignees.map((userId: string) => ({
          task_id: id,
          user_id: userId,
          assigned_by: admin.id,
        }))
        await supabase.from('task_assignments').insert(assignments)
      }
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error in task PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

