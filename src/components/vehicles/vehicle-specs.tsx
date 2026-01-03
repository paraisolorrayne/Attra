import { Car, Fuel, Gauge, Settings, Calendar, Palette, MapPin, Zap } from 'lucide-react'
import { Vehicle } from '@/types'

interface VehicleSpecsProps {
  vehicle: Vehicle
}

const specs = [
  { key: 'brand', label: 'Marca', icon: Car },
  { key: 'model', label: 'Modelo', icon: Car },
  { key: 'year', label: 'Ano', icon: Calendar },
  { key: 'mileage', label: 'Quilometragem', icon: Gauge },
  { key: 'fuel_type', label: 'Combustível', icon: Fuel },
  { key: 'transmission', label: 'Câmbio', icon: Settings },
  { key: 'color', label: 'Cor', icon: Palette },
  { key: 'body_type', label: 'Carroceria', icon: Car },
  { key: 'category', label: 'Categoria', icon: Zap },
]

export function VehicleSpecs({ vehicle }: VehicleSpecsProps) {
  const getValue = (key: string) => {
    switch (key) {
      case 'brand':
        return vehicle.brand
      case 'model':
        return `${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ''}`
      case 'year':
        return `${vehicle.year_manufacture}/${vehicle.year_model}`
      case 'mileage':
        return vehicle.mileage === 0 ? '0 km (Novo)' : `${vehicle.mileage.toLocaleString('pt-BR')} km`
      case 'fuel_type':
        return vehicle.fuel_type
      case 'transmission':
        return vehicle.transmission
      case 'color':
        return vehicle.color
      case 'body_type':
        return vehicle.body_type
      case 'category':
        const categories: Record<string, string> = {
          sports: 'Esportivo',
          suv: 'SUV',
          sedan: 'Sedã',
          hatch: 'Hatch',
          coupe: 'Cupê',
          luxury: 'Luxo',
        }
        return categories[vehicle.category] || vehicle.category
      default:
        return '-'
    }
  }

  return (
    <div className="bg-background-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Ficha Técnica</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {specs.map((spec) => (
          <div key={spec.key} className="flex items-start gap-3 p-3 bg-background rounded-lg">
            <spec.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground-secondary">{spec.label}</p>
              <p className="font-medium text-foreground">{getValue(spec.key)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

