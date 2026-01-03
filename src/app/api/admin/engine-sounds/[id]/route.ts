import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import {
  getVehicleSoundById,
  updateVehicleSound,
  deleteVehicleSound,
} from '@/lib/vehicle-sounds-storage'
import { deleteAudioFile, isSupabaseStorageUrl, isLegacyLocalUrl } from '@/lib/supabase/storage'
import { promises as fs } from 'fs'
import path from 'path'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single vehicle sound
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const sound = await getVehicleSoundById(id)

    if (!sound) {
      return NextResponse.json({ error: 'Sound not found' }, { status: 404 })
    }

    return NextResponse.json({ sound })
  } catch (error) {
    console.error('Error fetching vehicle sound:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update vehicle sound
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updatedSound = await updateVehicleSound(id, body)

    if (!updatedSound) {
      return NextResponse.json({ error: 'Sound not found' }, { status: 404 })
    }

    return NextResponse.json({ sound: updatedSound })
  } catch (error) {
    console.error('Error updating vehicle sound:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove vehicle sound and associated file
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the sound record first to get the file URL
    const sound = await getVehicleSoundById(id)
    if (!sound) {
      return NextResponse.json({ error: 'Sound not found' }, { status: 404 })
    }

    // Delete the sound file based on its location
    if (isSupabaseStorageUrl(sound.sound_file_url)) {
      // Delete from Supabase Storage
      const deleteResult = await deleteAudioFile(sound.sound_file_url)
      if (!deleteResult.success) {
        console.warn(`Could not delete file from Supabase: ${deleteResult.error}`)
      }
    } else if (isLegacyLocalUrl(sound.sound_file_url)) {
      // Delete legacy local file
      const filePath = path.join(process.cwd(), 'public', sound.sound_file_url)
      try {
        await fs.unlink(filePath)
      } catch {
        console.warn(`Could not delete local file: ${filePath}`)
      }
    }

    // Delete the record from database
    const deleted = await deleteVehicleSound(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete sound' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vehicle sound:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

