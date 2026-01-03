import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { VehicleCard } from '@/components/vehicles/vehicle-card'
import { getVehicles } from '@/lib/autoconf-api'

export async function FeaturedVehicles() {
  // Fetch featured vehicles from API
  let vehicles = []
  let error = null

  try {
    const result = await getVehicles({
      tipo: 'carros',
      registros_por_pagina: 4,
      ordenar: 'publicacao',
      ordem: 'desc'
    })
    vehicles = result.vehicles
  } catch (e) {
    console.error('Failed to fetch featured vehicles:', e)
    error = e
  }

  return (
    <section className="py-16 lg:py-24 bg-background-soft">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Veículos em Destaque
            </h2>
            <p className="text-foreground-secondary">
              Os melhores modelos selecionados para você
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/estoque" className="flex items-center gap-2">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {error ? (
          <div className="text-center py-12 text-foreground-secondary">
            <p>Não foi possível carregar os veículos. Tente novamente mais tarde.</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 text-foreground-secondary">
            <p>Nenhum veículo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}

