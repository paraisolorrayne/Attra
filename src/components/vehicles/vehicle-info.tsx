import { Badge } from '@/components/ui/badge'
import { Vehicle } from '@/types'
import { formatPrice } from '@/lib/utils'

interface VehicleInfoProps {
  vehicle: Vehicle
}

export function VehicleInfo({ vehicle }: VehicleInfoProps) {
  const statusBadge = () => {
    if (vehicle.status === 'sold') return <Badge variant="sold">Vendido</Badge>
    if (vehicle.status === 'reserved') return <Badge variant="warning">Reservado</Badge>
    if (vehicle.is_new) return <Badge variant="success">0km</Badge>
    if (vehicle.is_featured) return <Badge variant="primary">Destaque</Badge>
    return null
  }

  return (
    <div className="bg-background-card border border-border rounded-xl p-6 sticky top-24">
      {/* Status badge */}
      <div className="mb-4">
        {statusBadge()}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-1">
        {vehicle.brand} {vehicle.model}
      </h1>
      <p className="text-foreground-secondary mb-6">
        {vehicle.version && `${vehicle.version} • `}
        {vehicle.year_manufacture}/{vehicle.year_model}
      </p>

      {/* Price */}
      <div className="mb-6">
        <p className="text-sm text-foreground-secondary mb-1">Preço</p>
        <p className="text-3xl font-bold text-primary">
          {formatPrice(vehicle.price)}
        </p>
      </div>

      {/* Quick specs */}
      <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
        <div>
          <p className="text-sm text-foreground-secondary">Quilometragem</p>
          <p className="font-medium text-foreground">
            {vehicle.mileage === 0 ? '0 km (Novo)' : `${vehicle.mileage.toLocaleString('pt-BR')} km`}
          </p>
        </div>
        <div>
          <p className="text-sm text-foreground-secondary">Cor</p>
          <p className="font-medium text-foreground">{vehicle.color}</p>
        </div>
        <div>
          <p className="text-sm text-foreground-secondary">Combustível</p>
          <p className="font-medium text-foreground">{vehicle.fuel_type}</p>
        </div>
        <div>
          <p className="text-sm text-foreground-secondary">Câmbio</p>
          <p className="font-medium text-foreground">{vehicle.transmission}</p>
        </div>
      </div>

      {/* Sold message */}
      {vehicle.status === 'sold' && (
        <div className="mt-4 p-4 bg-foreground-secondary/10 rounded-lg">
          <p className="text-sm text-foreground-secondary">
            Este veículo já foi vendido. Confira veículos similares em nosso estoque.
          </p>
        </div>
      )}
    </div>
  )
}

