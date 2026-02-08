import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cache for 1 hour since data changes only weekly
export const revalidate = 3600

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Try to get article by slug first
    let { data: article, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('slug', slug)
      .single()

    // Fallback: if not found by slug, try by ID (for backward compatibility)
    if (error || !article) {
      const { data: articleById, error: idError } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', slug)
        .single()

      if (idError || !articleById) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      article = articleById
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error in /api/news/[slug]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

