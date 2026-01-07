import { NextResponse } from 'next/server'
import { getActiveVehicleSounds, VehicleSoundRecord } from '@/lib/vehicle-sounds-storage'
import { getVehicleById } from '@/lib/autoconf-api'

export interface VehicleWithSoundResponse {
  id: string
  vehicle_id: string
  name: string
  brand: string
  slug: string
  description: string | null
  soundUrl: string
  icon: string
  isElectric: boolean
  imageUrl: string | null
  year: number | null
  price: number | null
}

// GET - Public endpoint to fetch vehicles with engine sounds
export async function GET() {
  try {
    const sounds = await getActiveVehicleSounds()

    // Fetch vehicle details in parallel to get images
    const vehiclesWithSounds: VehicleWithSoundResponse[] = await Promise.all(
      sounds.map(async (sound: VehicleSoundRecord) => {
        // Try to fetch vehicle details to get the image
        let imageUrl: string | null = null
        let year: number | null = null
        let price: number | null = null

        try {
          const vehicle = await getVehicleById(sound.vehicle_id)
          if (vehicle) {
            imageUrl = vehicle.photos?.[0] || null
            year = vehicle.year_model
            price = vehicle.price
          }
        } catch (error) {
          console.warn(`Could not fetch vehicle ${sound.vehicle_id}:`, error)
        }

        return {
          id: sound.id,
          vehicle_id: sound.vehicle_id,
          name: sound.vehicle_name,
          brand: sound.vehicle_brand,
          slug: sound.vehicle_slug,
          description: sound.description,
          soundUrl: sound.sound_file_url,
          icon: sound.icon,
          isElectric: sound.is_electric,
          imageUrl,
          year,
          price,
        }
      })
    )

    return NextResponse.json({
      vehicles: vehiclesWithSounds,
      count: vehiclesWithSounds.length,
    })
  } catch (error) {
    console.error('Error fetching vehicles with sounds:', error)
    return NextResponse.json(
      { error: 'Internal server error', vehicles: [], count: 0 },
      { status: 500 }
    )
  }
}

// Revalidate every 5 minutes
export const revalidate = 300

