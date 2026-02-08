import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cache for 1 hour since data changes only weekly
export const revalidate = 3600

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface NewsArticle {
  id: string
  title: string
  description: string | null
  content: string | null
  image_url: string | null
  source_name: string
  original_url: string
  published_at: string
  is_featured: boolean
  featured_order: number | null
  category_id: number
}

interface NewsCycle {
  id: string
  week_start: string
  week_end: string
  is_active: boolean
}

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get active cycle
    const { data: cycle, error: cycleError } = await supabase
      .from('news_cycles')
      .select('*')
      .eq('is_active', true)
      .single()

    if (cycleError || !cycle) {
      return NextResponse.json(
        { 
          error: 'No active news cycle found',
          cycle: null,
          featured: [],
          formula1: [],
          premiumMarket: []
        },
        { status: 200 }
      )
    }

    // Get featured articles (category_id = 1, is_featured = true)
    const { data: featured, error: featuredError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('news_cycle_id', cycle.id)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .limit(3)

    if (featuredError) {
      console.error('Error fetching featured articles:', featuredError)
    }

    // Get Formula 1 articles (category_id = 2)
    const { data: formula1, error: f1Error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('news_cycle_id', cycle.id)
      .eq('category_id', 2)
      .order('published_at', { ascending: false })
      .limit(9)

    if (f1Error) {
      console.error('Error fetching Formula 1 articles:', f1Error)
    }

    // Get Premium Market articles (category_id = 3)
    const { data: premiumMarket, error: pmError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('news_cycle_id', cycle.id)
      .eq('category_id', 3)
      .order('published_at', { ascending: false })
      .limit(9)

    if (pmError) {
      console.error('Error fetching Premium Market articles:', pmError)
    }

    return NextResponse.json({
      cycle: {
        id: cycle.id,
        week_start: cycle.week_start,
        week_end: cycle.week_end
      },
      featured: featured || [],
      formula1: formula1 || [],
      premiumMarket: premiumMarket || []
    })
  } catch (error) {
    console.error('Error in /api/news:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

