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

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const statusBadge = () => {
    if (vehicle.status === 'sold') return <Badge variant="sold">Vendido</Badge>
    if (vehicle.status === 'reserved') return <Badge variant="warning">Reservado</Badge>
    if (vehicle.is_new) return <Badge variant="success">0 km</Badge>
    if (vehicle.is_featured) return <Badge variant="primary">Destaque</Badge>
    return null
  }

  const badge = statusBadge()

  return (
    <Link href={`/veiculo/${vehicle.slug}`}>
      <Card className="group h-full border border-border bg-background-card transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1">
        {/* Image - Clean design without heavy overlays */}
        {/* Mobile: object-contain to show full car without cropping */}
        {/* Desktop: object-cover for better visual consistency in grid */}
        <div className="relative aspect-[4/3] bg-background-soft overflow-hidden">
          {vehicle.photos?.[0] ? (
            <Image
              src={vehicle.photos[0]}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              className="object-contain sm:object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-foreground-secondary">
              <span>Sem imagem</span>
            </div>
          )}

          {/* Status badge - positioned to not cover car */}
          {badge && (
            <div className="absolute top-3 left-3">
              {badge}
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

