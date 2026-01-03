/**
 * Vehicle Sounds Storage Service
 * Manages vehicle-sound associations using Supabase Database
 */

import { createAdminClient } from './supabase/server'

export interface VehicleSoundRecord {
  id: string
  vehicle_id: string
  vehicle_name: string
  vehicle_brand: string
  vehicle_slug: string
  sound_file_url: string
  description: string | null
  icon: string
  is_electric: boolean
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Read all sound records
export async function getAllVehicleSounds(): Promise<VehicleSoundRecord[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicle_sounds')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching vehicle sounds:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllVehicleSounds:', error)
    return []
  }
}

// Get active sound records (for public display)
export async function getActiveVehicleSounds(): Promise<VehicleSoundRecord[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicle_sounds')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching active vehicle sounds:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveVehicleSounds:', error)
    return []
  }
}

// Get a single sound record by ID
export async function getVehicleSoundById(id: string): Promise<VehicleSoundRecord | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicle_sounds')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error fetching vehicle sound by ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getVehicleSoundById:', error)
    return null
  }
}

// Create a new sound record
export async function createVehicleSound(
  data: Omit<VehicleSoundRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<VehicleSoundRecord> {
  const supabase = createAdminClient()
  const { data: newSound, error } = await supabase
    .from('vehicle_sounds')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating vehicle sound:', error)
    throw new Error(error.message)
  }

  return newSound
}

// Update a sound record
export async function updateVehicleSound(
  id: string,
  data: Partial<Omit<VehicleSoundRecord, 'id' | 'created_at'>>
): Promise<VehicleSoundRecord | null> {
  try {
    const supabase = createAdminClient()
    const { data: updatedSound, error } = await supabase
      .from('vehicle_sounds')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error updating vehicle sound:', error)
      return null
    }

    return updatedSound
  } catch (error) {
    console.error('Error in updateVehicleSound:', error)
    return null
  }
}

// Delete a sound record
export async function deleteVehicleSound(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('vehicle_sounds')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting vehicle sound:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteVehicleSound:', error)
    return false
  }
}

// Check if a vehicle already has a sound associated
export async function vehicleHasSound(vehicleId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicle_sounds')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .limit(1)

    if (error) {
      console.error('Error checking if vehicle has sound:', error)
      return false
    }

    return (data?.length || 0) > 0
  } catch (error) {
    console.error('Error in vehicleHasSound:', error)
    return false
  }
}

// Get sound record by vehicle ID (for vehicle detail pages)
export async function getVehicleSoundByVehicleId(vehicleId: string): Promise<VehicleSoundRecord | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicle_sounds')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error fetching vehicle sound by vehicle ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getVehicleSoundByVehicleId:', error)
    return null
  }
}

