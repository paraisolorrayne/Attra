'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface VehicleData {
  vehicleId?: string
  vehicleBrand?: string
  vehicleModel?: string
  vehicleYear?: string | number
  vehiclePrice?: number
  vehicleSlug?: string
}

interface VehicleContextType {
  vehicle: VehicleData | null
  setVehicle: (vehicle: VehicleData | null) => void
  clearVehicle: () => void
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicle, setVehicleState] = useState<VehicleData | null>(null)

  const setVehicle = useCallback((data: VehicleData | null) => {
    setVehicleState(data)
    console.log('[VehicleContext] Vehicle set:', data?.vehicleBrand, data?.vehicleModel)
  }, [])

  const clearVehicle = useCallback(() => {
    setVehicleState(null)
    console.log('[VehicleContext] Vehicle cleared')
  }, [])

  return (
    <VehicleContext.Provider value={{ vehicle, setVehicle, clearVehicle }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicleContext() {
  const context = useContext(VehicleContext)
  if (context === undefined) {
    throw new Error('useVehicleContext must be used within a VehicleProvider')
  }
  return context
}

