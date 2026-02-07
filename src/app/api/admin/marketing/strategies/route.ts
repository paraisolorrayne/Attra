import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'
import { createAdminClient } from '@/lib/supabase/server'
import type { MarketingStrategyInsert } from '@/types/database'

export const dynamic = 'force-dynamic'

// GET - List all strategies
export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: strategies, error } = await supabase
      .from('marketing_strategies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching strategies:', error)
      return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 })
    }

    return NextResponse.json({ strategies: strategies || [] })
  } catch (error) {
    console.error('Error in strategies GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new strategy (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create strategies' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, category, budget, start_date, end_date, goals } = body

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const strategyData: MarketingStrategyInsert = {
      name,
      description: description || null,
      category,
      status: 'active',
      budget: budget || null,
      start_date: start_date || null,
      end_date: end_date || null,
      goals: goals || [],
      created_by: admin.id,
    }

    const { data: strategy, error } = await supabase
      .from('marketing_strategies')
      .insert(strategyData)
      .select()
      .single()

    if (error) {
      console.error('Error creating strategy:', error)
      return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 })
    }

    return NextResponse.json({ strategy }, { status: 201 })
  } catch (error) {
    console.error('Error in strategies POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

