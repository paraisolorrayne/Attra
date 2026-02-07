'use client'

import { useEffect, useRef } from 'react'
import { useVehicleContext } from '@/contexts/vehicle-context'
import { useAnalytics } from '@/hooks/use-analytics'

interface VehicleContextSetterProps {
  vehicleId: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear?: string | number
  vehiclePrice?: number
  vehicleSlug?: string
  vehicleCategory?: string
}

/**
 * Client component that sets the current vehicle in the global context
 * This allows the WhatsAppButton to access vehicle data from any page
 * Also tracks vehicle views in analytics
 */
export function VehicleContextSetter({
  vehicleId,
  vehicleBrand,
  vehicleModel,
  vehicleYear,
  vehiclePrice,
  vehicleSlug,
  vehicleCategory,
}: VehicleContextSetterProps) {
  const { setVehicle, clearVehicle } = useVehicleContext()
  const { trackVehicleView } = useAnalytics()
  const hasTracked = useRef(false)

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

    // Track vehicle view only once per mount
    if (!hasTracked.current) {
      trackVehicleView({
        id: vehicleId,
        name: `${vehicleBrand} ${vehicleModel}`,
        brand: vehicleBrand,
        model: vehicleModel,
        year: typeof vehicleYear === 'string' ? parseInt(vehicleYear) : (vehicleYear || new Date().getFullYear()),
        price: vehiclePrice || 0,
        category: vehicleCategory || 'premium',
        slug: vehicleSlug,
      })
      hasTracked.current = true
    }

    // Clear vehicle data when component unmounts (leaving vehicle page)
    return () => {
      clearVehicle()
    }
  }, [vehicleId, vehicleBrand, vehicleModel, vehicleYear, vehiclePrice, vehicleSlug, vehicleCategory, setVehicle, clearVehicle, trackVehicleView])

  // This component doesn't render anything
  return null
}

