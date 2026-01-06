import Link from 'next/link'
import Image from 'next/image'
import { Fuel, Gauge, Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Vehicle } from '@/types'
import { formatPrice, formatMileage } from '@/lib/utils'

interface VehicleCardProps {
  vehicle: Vehicle
}

// Get badges for vehicle card
function getVehicleBadges(vehicle: Vehicle) {
  const badges: { label: string; variant: 'primary' | 'success' | 'warning' | 'sold' }[] = []
  const brandLower = vehicle.brand.toLowerCase()

  // Status badges (always shown first)
  if (vehicle.status === 'sold') {
    badges.push({ label: 'Vendido', variant: 'sold' })
    return badges.slice(0, 2)
  }
  if (vehicle.status === 'reserved') {
    badges.push({ label: 'Reservado', variant: 'warning' })
  }

  // 0 km badge
  if (vehicle.is_new || vehicle.mileage === 0) {
    badges.push({ label: '0 km', variant: 'success' })
  }

  // Category badges based on brand
  const supercarBrands = ['ferrari', 'lamborghini', 'mclaren', 'bugatti', 'pagani', 'koenigsegg']
  const luxuryBrands = ['bentley', 'rolls-royce', 'maybach']
  const sportsBrands = ['porsche', 'aston martin', 'maserati', 'lotus']

  if (supercarBrands.some(b => brandLower.includes(b))) {
    badges.push({ label: 'Superesportivo', variant: 'primary' })
  } else if (luxuryBrands.some(b => brandLower.includes(b))) {
    badges.push({ label: 'Ultra Luxo', variant: 'warning' })
  } else if (sportsBrands.some(b => brandLower.includes(b))) {
    badges.push({ label: 'Esportivo', variant: 'primary' })
  }

  // Semi-novo for low mileage used cars
  if (vehicle.mileage > 0 && vehicle.mileage <= 5000 && !badges.some(b => b.label === '0 km')) {
    badges.push({ label: 'Semi-novo', variant: 'success' })
  }

  return badges.slice(0, 2)
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const badges = getVehicleBadges(vehicle)

  return (
    <Link href={`/veiculo/${vehicle.slug}`}>
      <Card className="group h-full border border-border bg-background-card transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1">
        {/* Image container with consistent 4:3 aspect ratio */}
        <div className="relative aspect-[4/3] bg-background-soft overflow-hidden vehicle-image-container">
          {vehicle.photos?.[0] ? (
            <Image
              src={vehicle.photos[0]}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="card-vehicle-image transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-foreground-secondary">
              <span>Sem imagem</span>
            </div>
          )}

          {/* Status badges - positioned to not cover car */}
          {badges.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {badges.map((badge, i) => (
                <Badge key={i} variant={badge.variant}>{badge.label}</Badge>
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Brand */}
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
            {vehicle.brand}
          </p>

          {/* Model */}
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {vehicle.model}
          </h3>

          {/* Year and version */}
          <p className="text-sm text-foreground-secondary mb-3 line-clamp-1">
            {vehicle.year_model} {vehicle.version && `• ${vehicle.version}`}
          </p>

          {/* Specs - compact */}
          <div className="flex flex-wrap gap-3 mb-3 text-xs text-foreground-secondary">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-primary/60" />
              {formatMileage(vehicle.mileage)}
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-primary/60" />
              {vehicle.fuel_type}
            </span>
            <span className="flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-primary/60" />
              {vehicle.transmission}
            </span>
          </div>

          {/* Price */}
          <p className="text-xl font-bold text-foreground">
            {formatPrice(vehicle.price)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

