import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchPlaceDetails, isGooglePlacesConfigured } from '@/lib/google-places'
import { analyzeReview } from '@/lib/review-analyzer'

/**
 * POST /api/admin/google-reviews/sync
 * Syncs reviews from Google Places API for all registered places
 * Should be called weekly via cron job or manually from admin
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Google Places API is configured
    if (!isGooglePlacesConfigured()) {
      return NextResponse.json(
        { error: 'Google Places API not configured. Add GOOGLE_PLACES_API_KEY to environment.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    
    // Get all registered places
    const { data: places, error: placesError } = await supabase
      .from('google_places')
      .select('*')
    
    if (placesError) {
      console.error('Error fetching places:', placesError)
      return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
    }

    if (!places || places.length === 0) {
      return NextResponse.json({ message: 'No places registered for sync' }, { status: 200 })
    }

    const results = []

    for (const place of places) {
      // Skip placeholder place IDs
      if (place.place_id.startsWith('PLACE_ID_')) {
        results.push({
          place: place.name,
          status: 'skipped',
          message: 'Place ID not configured yet',
        })
        continue
      }

      try {
        // Fetch reviews from Google
        const placeDetails = await fetchPlaceDetails(place.place_id)
        
        if (!placeDetails) {
          // Log sync error
          await supabase.from('google_reviews_sync_log').insert({
            google_place_id: place.id,
            sync_status: 'error',
            error_message: 'Failed to fetch from Google API',
          })
          
          results.push({ place: place.name, status: 'error', message: 'API fetch failed' })
          continue
        }

        // Update place rating info
        await supabase.from('google_places').update({
          rating: placeDetails.rating,
          total_reviews: placeDetails.userRatingCount,
          updated_at: new Date().toISOString(),
        }).eq('id', place.id)

        let reviewsNew = 0
        let reviewsUpdated = 0

        // Process each review
        for (const review of placeDetails.reviews || []) {
          const analysis = analyzeReview(review)
          
          const reviewData = {
            google_place_id: place.id,
            author_name: review.authorName,
            author_photo_url: review.authorPhotoUri,
            rating: review.rating,
            text: review.text,
            review_time: review.publishTime ? new Date(review.publishTime).toISOString() : null,
            relevance_score: analysis.relevanceScore,
            sentiment_keywords: analysis.sentimentKeywords,
            mentions_services: analysis.mentionsServices,
            mentions_vehicles: analysis.mentionsVehicles,
            mentions_team: analysis.mentionsTeam,
            approved: analysis.shouldApprove,
            synced_at: new Date().toISOString(),
          }

          // Upsert review (insert or update if exists)
          const { error: upsertError } = await supabase
            .from('google_reviews')
            .upsert(reviewData, {
              onConflict: 'google_place_id,author_name,review_time',
              ignoreDuplicates: false,
            })

          if (!upsertError) {
            reviewsNew++
          }
        }

        // Log successful sync
        await supabase.from('google_reviews_sync_log').insert({
          google_place_id: place.id,
          sync_status: 'success',
          reviews_fetched: placeDetails.reviews?.length || 0,
          reviews_new: reviewsNew,
          reviews_updated: reviewsUpdated,
        })

        results.push({
          place: place.name,
          status: 'success',
          reviewsFetched: placeDetails.reviews?.length || 0,
          rating: placeDetails.rating,
        })

      } catch (error) {
        console.error(`Error syncing place ${place.name}:`, error)
        results.push({ place: place.name, status: 'error', message: String(error) })
      }
    }

    return NextResponse.json({
      message: 'Sync completed',
      timestamp: new Date().toISOString(),
      results,
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/admin/google-reviews/sync
 * Returns sync status and last sync info
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: logs, error } = await supabase
      .from('google_reviews_sync_log')
      .select('*, google_places(name)')
      .order('synced_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sync logs' }, { status: 500 })
    }

    return NextResponse.json({
      apiConfigured: isGooglePlacesConfigured(),
      recentSyncs: logs,
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

