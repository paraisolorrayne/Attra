/**
 * Google Places API Integration
 * Fetches reviews using the Places API (New)
 */

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || ''
const PLACES_API_BASE = 'https://places.googleapis.com/v1'

export interface GoogleReview {
  authorName: string
  authorPhotoUri?: string
  rating: number
  text?: string
  relativePublishTimeDescription?: string
  publishTime?: string
}

export interface PlaceDetails {
  id: string
  displayName: { text: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  reviews?: GoogleReview[]
}

/**
 * Fetch place details including reviews from Google Places API (New)
 * The API returns up to 5 most recent/relevant reviews
 */
export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('GOOGLE_PLACES_API_KEY not configured')
    return null
  }

  try {
    const response = await fetch(
      `${PLACES_API_BASE}/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,reviews',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Google Places API error: ${response.status}`, errorText)
      return null
    }

    const data = await response.json()
    
    // Transform the response to match our interface
    return {
      id: data.id || placeId,
      displayName: data.displayName || { text: '' },
      formattedAddress: data.formattedAddress,
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      reviews: data.reviews?.map((review: any) => ({
        authorName: review.authorAttribution?.displayName || 'Anônimo',
        authorPhotoUri: review.authorAttribution?.photoUri,
        rating: review.rating,
        text: review.text?.text || review.originalText?.text,
        relativePublishTimeDescription: review.relativePublishTimeDescription,
        publishTime: review.publishTime,
      })) || [],
    }
  } catch (error) {
    console.error('Failed to fetch place details:', error)
    return null
  }
}

/**
 * Search for a place by name to get its Place ID
 */
export async function searchPlace(query: string): Promise<string | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('GOOGLE_PLACES_API_KEY not configured')
    return null
  }

  try {
    const response = await fetch(
      `${PLACES_API_BASE}/places:searchText`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName',
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'pt-BR',
          locationBias: {
            circle: {
              center: { latitude: -18.9186, longitude: -48.2772 }, // Uberlândia
              radius: 50000.0, // 50km radius
            },
          },
        }),
      }
    )

    if (!response.ok) {
      console.error(`Google Places Search error: ${response.status}`)
      return null
    }

    const data = await response.json()
    return data.places?.[0]?.id || null
  } catch (error) {
    console.error('Failed to search place:', error)
    return null
  }
}

/**
 * Validate if API key is configured
 */
export function isGooglePlacesConfigured(): boolean {
  return !!GOOGLE_PLACES_API_KEY
}

