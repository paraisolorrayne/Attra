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
  const badges: { label: string; variant: 'primary' | 'success' | 'warning' | 'sold' }[] = []

  if (vehicle.is_new || vehicle.mileage === 0) {
    badges.push({ label: '0 km', variant: 'success' })
  }
  if (vehicle.category === 'supercar' || vehicle.horsepower && vehicle.horsepower > 500) {
    badges.push({ label: 'Superesportivo', variant: 'primary' })
  }
  if (vehicle.is_featured) {
    badges.push({ label: 'Colecionável', variant: 'warning' })
  }
  if (vehicle.origin === 'imported') {
    badges.push({ label: 'Importado', variant: 'primary' })
  }

  return badges.slice(0, 2) // Max 2 badges
}

export function CinematicVehicleCard({ vehicle, layout = 'horizontal' }: CinematicVehicleCardProps) {
  const badges = getPremiumBadges(vehicle)

  if (layout === 'vertical') {
    return (
      <Link href={`/veiculo/${vehicle.slug}`} className="group block">
        <div className="bg-background-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1">
          {/* Image - Clean, no overlays */}
          {/* Mobile: object-contain to show full car without cropping */}
          {/* Desktop: object-cover for better visual consistency in grid */}
          <div className="relative aspect-[16/10] overflow-hidden bg-background-soft">
            <Image
              src={vehicle.photos?.[0] || '/placeholder.jpg'}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-contain sm:object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
        {/* Image - Clean, minimal overlay only at edge for transition */}
        {/* Mobile: object-contain to show full car without cropping */}
        {/* Desktop: object-cover for better visual consistency */}
        <div className="relative aspect-[16/10] md:aspect-[4/3] md:w-2/5 lg:w-1/2 overflow-hidden bg-background-soft">
          <Image
            src={vehicle.photos?.[0] || '/placeholder.jpg'}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-contain sm:object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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

