import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - List all admin users for assignment
export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Error in users GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

