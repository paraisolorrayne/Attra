'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fuel, Gauge, Settings, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Vehicle } from '@/types'
import { formatPrice, formatMileage } from '@/lib/utils'

interface CinematicVehicleCardProps {
  vehicle: Vehicle
  layout?: 'horizontal' | 'vertical'
}

// Premium badges based on vehicle characteristics
function getPremiumBadges(vehicle: Vehicle) {
  const badges: { label: string; variant: 'primary' | 'success' | 'warning' | 'sold'; priority: number }[] = []
  const brandLower = vehicle.brand.toLowerCase()

  // Status badges (highest priority)
  if (vehicle.status === 'sold') {
    badges.push({ label: 'Vendido', variant: 'sold', priority: 0 })
  }
  if (vehicle.status === 'reserved') {
    badges.push({ label: 'Reservado', variant: 'warning', priority: 1 })
  }

  // 0 km badge
  if (vehicle.is_new || vehicle.mileage === 0) {
    badges.push({ label: '0 km', variant: 'success', priority: 2 })
  }

  // Category badges based on brand/characteristics
  const supercarBrands = ['ferrari', 'lamborghini', 'mclaren', 'bugatti', 'pagani', 'koenigsegg']
  const luxuryBrands = ['bentley', 'rolls-royce', 'maybach']
  const sportsBrands = ['porsche', 'aston martin', 'maserati', 'lotus']

  if (supercarBrands.some(b => brandLower.includes(b)) || vehicle.category === 'supercar') {
    badges.push({ label: 'Superesportivo', variant: 'primary', priority: 3 })
  } else if (luxuryBrands.some(b => brandLower.includes(b)) || vehicle.category === 'luxury') {
    badges.push({ label: 'Ultra Luxo', variant: 'warning', priority: 3 })
  } else if (sportsBrands.some(b => brandLower.includes(b)) || vehicle.category === 'sports') {
    badges.push({ label: 'Esportivo', variant: 'primary', priority: 4 })
  }

  // High performance badge (only if no category badge)
  if (vehicle.horsepower && vehicle.horsepower >= 500 && !badges.some(b => b.priority === 3 || b.priority === 4)) {
    badges.push({ label: `${vehicle.horsepower} cv`, variant: 'primary', priority: 5 })
  }

  // Low mileage badge for used cars (not 0km)
  if (vehicle.mileage > 0 && vehicle.mileage <= 5000 && !badges.some(b => b.label === '0 km')) {
    badges.push({ label: 'Semi-novo', variant: 'success', priority: 6 })
  }

  // Sort by priority and return max 2
  return badges.sort((a, b) => a.priority - b.priority).slice(0, 2)
}

export function CinematicVehicleCard({ vehicle, layout = 'horizontal' }: CinematicVehicleCardProps) {
  const badges = getPremiumBadges(vehicle)

  if (layout === 'vertical') {
    return (
      <Link href={`/veiculo/${vehicle.slug}`} className="group block">
        <div className="bg-background-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1">
          {/* Image container with consistent 4:3 aspect ratio */}
          <div className="relative aspect-[4/3] overflow-hidden bg-background-soft vehicle-image-container">
            <Image
              src={vehicle.photos?.[0] || '/placeholder.jpg'}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="card-vehicle-image transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Badges - positioned to not cover car */}
            {badges.length > 0 && (
              <div className="absolute top-3 left-3 flex gap-2">
                {badges.map((badge, i) => (
                  <Badge key={i} variant={badge.variant} className="text-xs">{badge.label}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <p className="text-primary text-xs font-medium mb-1 uppercase tracking-wider">{vehicle.brand}</p>
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {vehicle.model}
            </h3>
            <p className="text-foreground-secondary text-sm mb-3">
              {vehicle.year_model} • {formatMileage(vehicle.mileage)}
            </p>
            <p className="text-xl font-bold text-foreground">
              {formatPrice(vehicle.price)}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  // Horizontal layout - Clean design prioritizing vehicle visibility
  return (
    <Link href={`/veiculo/${vehicle.slug}`} className="group block">
      <div className="bg-background-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1">
        {/* Image container with consistent 4:3 aspect ratio */}
        <div className="relative aspect-[4/3] md:w-2/5 lg:w-1/2 overflow-hidden bg-background-soft vehicle-image-container">
          <Image
            src={vehicle.photos?.[0] || '/placeholder.jpg'}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="card-vehicle-image transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Subtle edge gradient for text readability - only on right edge */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background-card/60 to-transparent hidden md:block pointer-events-none" />

          {/* Badges - positioned top-left to not cover car body */}
          {badges.length > 0 && (
            <div className="absolute top-4 left-4 flex gap-2">
              {badges.map((badge, i) => (
                <Badge key={i} variant={badge.variant} className="shadow-sm">{badge.label}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
          <p className="text-primary text-xs font-semibold mb-2 uppercase tracking-wider">{vehicle.brand}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {vehicle.model}
          </h3>
          {vehicle.version && (
            <p className="text-foreground-secondary text-sm mb-4 line-clamp-1">{vehicle.version}</p>
          )}

          {/* Specs row - compact design */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 text-sm text-foreground-secondary">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-primary/70" />
              {vehicle.year_model}
            </span>
            <span className="flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-primary/70" />
              {formatMileage(vehicle.mileage)}
            </span>
            <span className="flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-primary/70" />
              {vehicle.fuel_type}
            </span>
            {vehicle.horsepower && (
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary/70" />
                {vehicle.horsepower} cv
              </span>
            )}
          </div>

          {/* Price */}
          <p className="text-2xl lg:text-3xl font-bold text-foreground">
            {formatPrice(vehicle.price)}
          </p>
        </div>
      </div>
    </Link>
  )
}

