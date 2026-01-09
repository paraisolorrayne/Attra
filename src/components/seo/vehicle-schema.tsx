import { Vehicle } from '@/types'

interface VehicleSchemaProps {
  vehicle: Vehicle
  url?: string
}

export function VehicleSchema({ vehicle, url }: VehicleSchemaProps) {
  const vehicleUrl = url || `https://attraveiculos.com.br/veiculo/${vehicle.slug}`
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: `${vehicle.brand} ${vehicle.model}`,
    description: vehicle.description || `${vehicle.brand} ${vehicle.model} ${vehicle.year_model} - ${vehicle.version || ''} disponível na Attra Veículos`,
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    model: vehicle.model,
    vehicleModelDate: vehicle.year_model?.toString(),
    modelDate: vehicle.year_fab?.toString(),
    color: vehicle.color,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileage,
      unitCode: 'KMT',
    },
    fuelType: vehicle.fuel_type,
    vehicleTransmission: vehicle.transmission,
    bodyType: vehicle.body_type,
    vehicleConfiguration: vehicle.version,
    numberOfDoors: vehicle.doors,
    vehicleEngine: vehicle.engine ? {
      '@type': 'EngineSpecification',
      name: vehicle.engine,
    } : undefined,
    driveWheelConfiguration: vehicle.traction,
    offers: {
      '@type': 'Offer',
      price: vehicle.price,
      priceCurrency: 'BRL',
      availability: vehicle.status === 'available' 
        ? 'https://schema.org/InStock' 
        : vehicle.status === 'reserved'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'Attra Veículos',
        telephone: '+55-34-3256-3100',
        url: 'https://attraveiculos.com.br',
      },
      url: vehicleUrl,
    },
    image: vehicle.photos?.[0] || 'https://attraveiculos.com.br/placeholder.jpg',
    url: vehicleUrl,
    itemCondition: vehicle.mileage === 0 
      ? 'https://schema.org/NewCondition' 
      : 'https://schema.org/UsedCondition',
  }

  // Remove undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  )
}

// Schema for listing multiple vehicles
interface VehicleListSchemaProps {
  vehicles: Vehicle[]
}

export function VehicleListSchema({ vehicles }: VehicleListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Estoque de Veículos Premium - Attra Veículos',
    description: 'Seleção exclusiva de supercarros, veículos importados e seminovos premium.',
    numberOfItems: vehicles.length,
    itemListElement: vehicles.map((vehicle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Vehicle',
        name: `${vehicle.brand} ${vehicle.model}`,
        brand: vehicle.brand,
        model: vehicle.model,
        modelDate: vehicle.year_model?.toString(),
        mileageFromOdometer: {
          '@type': 'QuantitativeValue',
          value: vehicle.mileage,
          unitCode: 'KMT',
        },
        offers: {
          '@type': 'Offer',
          price: vehicle.price,
          priceCurrency: 'BRL',
        },
        image: vehicle.photos?.[0],
        url: `https://attraveiculos.com.br/veiculo/${vehicle.slug}`,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

