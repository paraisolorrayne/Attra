import { Vehicle } from '@/types'
import { generateVehicleDescription } from '@/lib/vehicle-description-generator'

interface VehicleDescriptionProps {
  vehicle: Vehicle
}

/**
 * Vehicle Description Component
 * Generates descriptions deterministically from structured vehicle data
 * No external API dependencies - instant, consistent results
 */
export function VehicleDescription({ vehicle }: VehicleDescriptionProps) {
  // Generate description from vehicle data (synchronous, no API calls)
  const description = generateVehicleDescription(vehicle)

  return (
    <div className="bg-background-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Sobre este veículo
      </h2>
      <p className="text-foreground-secondary leading-relaxed">
        {description}
      </p>
    </div>
  )
}

// Keep async version for backward compatibility (same implementation)
export async function AIVehicleDescription({ vehicle }: VehicleDescriptionProps) {
  return <VehicleDescription vehicle={vehicle} />
}

// Loading skeleton for Suspense fallback (simplified since generation is instant)
export function AIVehicleDescriptionSkeleton() {
  return (
    <div className="bg-background-card border border-border rounded-xl p-6">
      <div className="h-6 w-48 bg-foreground-secondary/10 rounded animate-pulse mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-foreground-secondary/10 rounded animate-pulse" />
        <div className="h-4 bg-foreground-secondary/10 rounded animate-pulse w-11/12" />
        <div className="h-4 bg-foreground-secondary/10 rounded animate-pulse w-10/12" />
      </div>
    </div>
  )
}

// Export the new component as default
export { VehicleDescription as default }

