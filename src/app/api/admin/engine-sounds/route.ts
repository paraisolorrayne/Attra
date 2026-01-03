import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import {
  getAllVehicleSounds,
  createVehicleSound,
  vehicleHasSound,
} from '@/lib/vehicle-sounds-storage'

// GET - List all vehicle sounds (admin only)
export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sounds = await getAllVehicleSounds()
    return NextResponse.json({ sounds })
  } catch (error) {
    console.error('Error fetching vehicle sounds:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new vehicle sound association
export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      vehicle_id,
      vehicle_name,
      vehicle_brand,
      vehicle_slug,
      sound_file_url,
      description,
      icon,
      is_electric,
      display_order,
    } = body

    // Validate required fields
    if (!vehicle_id || !vehicle_name || !vehicle_brand || !sound_file_url) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicle_id, vehicle_name, vehicle_brand, sound_file_url' },
        { status: 400 }
      )
    }

    // Check if vehicle already has a sound
    const hasSound = await vehicleHasSound(vehicle_id)
    if (hasSound) {
      return NextResponse.json(
        { error: 'This vehicle already has an associated sound' },
        { status: 409 }
      )
    }

    const newSound = await createVehicleSound({
      vehicle_id,
      vehicle_name,
      vehicle_brand,
      vehicle_slug: vehicle_slug || '',
      sound_file_url,
      description: description || null,
      icon: icon || '🏎️',
      is_electric: is_electric || false,
      is_active: true,
      display_order: display_order || 0,
    })

    return NextResponse.json({ sound: newSound }, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle sound:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

