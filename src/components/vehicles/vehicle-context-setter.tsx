'use client'

import { useEffect } from 'react'
import { useVehicleContext } from '@/contexts/vehicle-context'

interface VehicleContextSetterProps {
  vehicleId: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear?: string | number
  vehiclePrice?: number
  vehicleSlug?: string
}

/**
 * Client component that sets the current vehicle in the global context
 * This allows the WhatsAppButton to access vehicle data from any page
 */
export function VehicleContextSetter({
  vehicleId,
  vehicleBrand,
  vehicleModel,
  vehicleYear,
  vehiclePrice,
  vehicleSlug,
}: VehicleContextSetterProps) {
  const { setVehicle, clearVehicle } = useVehicleContext()

  useEffect(() => {
    // Set vehicle data when component mounts
    setVehicle({
      vehicleId,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehiclePrice,
      vehicleSlug,
    })

    // Clear vehicle data when component unmounts (leaving vehicle page)
    return () => {
      clearVehicle()
    }
  }, [vehicleId, vehicleBrand, vehicleModel, vehicleYear, vehiclePrice, vehicleSlug, setVehicle, clearVehicle])

  // This component doesn't render anything
  return null
}

