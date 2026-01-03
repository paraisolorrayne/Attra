import { NextResponse } from 'next/server'
import { getActiveVehicleSounds, VehicleSoundRecord } from '@/lib/vehicle-sounds-storage'

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
}

// GET - Public endpoint to fetch vehicles with engine sounds
export async function GET() {
  try {
    const sounds = await getActiveVehicleSounds()

    // Transform to the format expected by the EngineSoundSection
    const vehiclesWithSounds: VehicleWithSoundResponse[] = sounds.map(
      (sound: VehicleSoundRecord) => ({
        id: sound.id,
        vehicle_id: sound.vehicle_id,
        name: sound.vehicle_name,
        brand: sound.vehicle_brand,
        slug: sound.vehicle_slug,
        description: sound.description,
        soundUrl: sound.sound_file_url,
        icon: sound.icon,
        isElectric: sound.is_electric,
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

