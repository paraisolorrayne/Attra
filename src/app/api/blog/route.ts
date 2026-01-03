import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')

    const supabase = await createClient()

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())

    if (category) {
      query = query.eq('category', category)
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }

    query = query.order('published_at', { ascending: false })

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Blog query error:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Blog API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

