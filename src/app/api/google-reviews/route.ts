import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/google-reviews
 * Returns approved reviews ordered by relevance score
 * Public endpoint for displaying testimonials on the website
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 20)
    const featured = searchParams.get('featured') === 'true'
    const minRating = parseInt(searchParams.get('min_rating') || '4')
    const storeCode = searchParams.get('store') // 'JP' or 'RP'

    const supabase = await createClient()
    
    let query = supabase
      .from('google_reviews')
      .select(`
        id,
        author_name,
        author_photo_url,
        rating,
        text,
        review_time,
        relevance_score,
        mentions_services,
        mentions_vehicles,
        mentions_team,
        featured,
        google_places!inner (
          name,
          store_code,
          rating
        )
      `)
      .eq('approved', true)
      .gte('rating', minRating)
      .order('relevance_score', { ascending: false })
      .limit(limit)

    // Filter by featured if requested
    if (featured) {
      query = query.eq('featured', true)
    }

    // Filter by store if specified
    if (storeCode) {
      query = query.eq('google_places.store_code', storeCode)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // Transform data for frontend
    const formattedReviews = reviews?.map(review => ({
      id: review.id,
      author: {
        name: review.author_name,
        photoUrl: review.author_photo_url,
      },
      rating: review.rating,
      text: review.text,
      date: review.review_time,
      relevanceScore: review.relevance_score,
      featured: review.featured,
      store: {
        name: review.google_places?.name,
        code: review.google_places?.store_code,
      },
      highlights: {
        mentionsServices: review.mentions_services,
        mentionsVehicles: review.mentions_vehicles,
        mentionsTeam: review.mentions_team,
      },
    })) || []

    // Get overall stats
    const { data: stats } = await supabase
      .from('google_places')
      .select('rating, total_reviews')
    
    const totalRating = stats?.reduce((acc, p) => acc + (p.rating || 0), 0) || 0
    const placesCount = stats?.filter(p => p.rating)?.length || 1
    const averageRating = totalRating / placesCount
    const totalReviews = stats?.reduce((acc, p) => acc + (p.total_reviews || 0), 0) || 0

    return NextResponse.json({
      reviews: formattedReviews,
      meta: {
        total: formattedReviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })

  } catch (error) {
    console.error('Error in google-reviews API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

