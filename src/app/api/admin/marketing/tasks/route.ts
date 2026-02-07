import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { createAdminClient } from '@/lib/supabase/server'
import type { MarketingTaskInsert, TaskStatus } from '@/types/database'

export const dynamic = 'force-dynamic'

// GET - List all marketing tasks
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const assignee = searchParams.get('assignee')

    const supabase = createAdminClient()
    
    let query = supabase
      .from('marketing_tasks')
      .select(`
        *,
        strategy:marketing_strategies(id, name, category),
        assignments:task_assignments(
          id,
          user_id,
          user:admin_users!task_assignments_user_id_fkey(id, email, name)
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    if (priority) query = query.eq('priority', priority)
    
    // For gerente role, filter to only assigned tasks
    if (admin.role === 'gerente') {
      const { data: assignments } = await supabase
        .from('task_assignments')
        .select('task_id')
        .eq('user_id', admin.id)
      
      const taskIds = assignments?.map(a => a.task_id) || []
      if (taskIds.length === 0) {
        return NextResponse.json({ tasks: [] })
      }
      query = query.in('id', taskIds)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Transform data for frontend
    const transformedTasks = tasks?.map(task => ({
      ...task,
      assignees: task.assignments?.map((a: { user: { id: string; email: string; name: string | null } }) => a.user) || []
    }))

    return NextResponse.json({ tasks: transformedTasks || [] })
  } catch (error) {
    console.error('Error in tasks GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new marketing task (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create tasks' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, strategy_id, category, priority, due_date, estimated_hours, assignees } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Create the task
    const taskData: MarketingTaskInsert = {
      title,
      description: description || null,
      strategy_id: strategy_id || null,
      category,
      status: 'backlog',
      priority: priority || 'medium',
      due_date: due_date || null,
      estimated_hours: estimated_hours || null,
      actual_hours: null,
      created_by: admin.id,
    }

    const { data: task, error: taskError } = await supabase
      .from('marketing_tasks')
      .insert(taskData)
      .select()
      .single()

    if (taskError) {
      console.error('Error creating task:', taskError)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    // Create assignments if provided
    if (assignees && Array.isArray(assignees) && assignees.length > 0) {
      const assignments = assignees.map((userId: string) => ({
        task_id: task.id,
        user_id: userId,
        assigned_by: admin.id,
      }))

      const { error: assignError } = await supabase
        .from('task_assignments')
        .insert(assignments)

      if (assignError) {
        console.error('Error creating assignments:', assignError)
      }
    }

    // Create status history entry
    await supabase.from('task_status_history').insert({
      task_id: task.id,
      old_status: null,
      new_status: 'backlog',
      changed_by: admin.id,
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error in tasks POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

