import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { VehicleCard } from './vehicle-card'
import { Vehicle } from '@/types'
import { getRelatedVehicles } from '@/lib/autoconf-api'

interface RelatedVehiclesProps {
  currentVehicleId: string
  brand: string
  category: string
}

export async function RelatedVehicles({ currentVehicleId, brand, category }: RelatedVehiclesProps) {
  // Fetch related vehicles from API
  const relatedVehicles = await getRelatedVehicles(currentVehicleId, brand, 4)

  if (relatedVehicles.length === 0) return null

  return (
    <section className="py-16 bg-background-soft mt-16">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Veículos Similares
            </h2>
            <p className="text-foreground-secondary">
              Outros veículos que podem interessar você
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/estoque" className="flex items-center gap-2">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle as Vehicle} />
          ))}
        </div>
      </Container>
    </section>
  )
}

