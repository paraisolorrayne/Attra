import { Suspense } from 'react'
import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { AdvancedFilters, CinematicVehicleCard, VehiclePagination } from '@/components/vehicles'
import { SortDropdown } from '@/components/vehicles/sort-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { getVehicles, type AutoConfFilters } from '@/lib/autoconf-api'
import { Vehicle } from '@/types'
import { VehicleRequestForm } from '@/components/forms/vehicle-request-form'
import { FAQSection } from '@/components/home'
import { FAQSchema } from '@/components/seo'
import { estoqueFAQs } from '@/lib/faq-data'
import { Search, Globe, Shield, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Estoque Premium | Supercarros e Veículos de Luxo',
  description: 'Seleção exclusiva de supercarros e veículos premium.',
}

interface EstoquePageProps {
  searchParams: Promise<{
    marca?: string
    anoMin?: string
    anoMax?: string
    precoMin?: string
    precoMax?: string
    ordenar?: string
    pagina?: string
    q?: string
    carroceria?: string
    combustivel?: string
    ano?: string
  }>
}

function VehicleListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-background-card rounded-2xl overflow-hidden flex flex-col md:flex-row">
          <Skeleton className="aspect-[16/10] md:w-1/2" />
          <div className="p-8 flex-1 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function EstoquePage({ searchParams }: EstoquePageProps) {
  const params = await searchParams
  const currentPage = Number(params.pagina) || 1
  const perPage = 12

  const filters: AutoConfFilters = {
    tipo: 'carros',
    pagina: currentPage,
    registros_por_pagina: perPage,
  }

  if (params.anoMin) filters.ano_de = parseInt(params.anoMin)
  if (params.anoMax) filters.ano_ate = parseInt(params.anoMax)
  if (params.precoMin) filters.preco_de = parseInt(params.precoMin)
  if (params.precoMax) filters.preco_ate = parseInt(params.precoMax)

  if (params.ordenar) {
    switch (params.ordenar) {
      case 'preco-asc': filters.ordenar = 'preco'; filters.ordem = 'asc'; break
      case 'preco-desc': filters.ordenar = 'preco'; filters.ordem = 'desc'; break
      case 'ano-desc': filters.ordenar = 'ano'; filters.ordem = 'desc'; break
      case 'km-asc': filters.ordenar = 'km'; filters.ordem = 'asc'; break
      default: filters.ordenar = 'publicacao'; filters.ordem = 'desc'
    }
  }

  let vehicles: Vehicle[] = []
  let suggestedVehicles: Vehicle[] = []
  let total = 0
  let totalPages = 1
  let error: unknown = null
  let allVehicles: Vehicle[] = []

  // Check if we have any filter that requires client-side processing
  const searchQuery = params.q?.toLowerCase().trim()
  const brandFilter = params.marca?.toLowerCase().trim()
  const carroceriaFilter = params.carroceria?.toLowerCase().trim()
  const combustivelFilter = params.combustivel?.toLowerCase().trim()
  const anoFilter = params.ano?.toLowerCase().trim()
  const hasPriceFilter = !!(params.precoMin || params.precoMax)
  const hasSortFilter = !!params.ordenar

  // Include all filter types that need client-side processing (including price and sorting)
  const hasClientSideFilters = !!(searchQuery || brandFilter || carroceriaFilter || combustivelFilter || anoFilter || hasPriceFilter || hasSortFilter)

  try {
    // If we have client-side filters, fetch ALL vehicles for proper filtering and suggestions
    const searchFilters = hasClientSideFilters
      ? { ...filters, registros_por_pagina: 100, pagina: 1 } // Get more vehicles for filtering
      : filters

    const result = await getVehicles(searchFilters)
    allVehicles = result.vehicles
    vehicles = [...allVehicles]
    total = result.total
    totalPages = result.totalPages

    // Helper function to normalize text for search (removes accents and lowercases)
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
    }

    // Apply client-side filtering for all filter types
    // since the API may not support these filters directly
    if (hasClientSideFilters) {
      const normalizedSearchQuery = searchQuery ? normalizeText(searchQuery) : ''
      const searchTerms = normalizedSearchQuery ? normalizedSearchQuery.split(/\s+/) : []
      const minPrice = params.precoMin ? parseInt(params.precoMin) : null
      const maxPrice = params.precoMax ? parseInt(params.precoMax) : null

      vehicles = allVehicles.filter(vehicle => {
        let matchesSearch = true
        let matchesBrand = true
        let matchesPrice = true
        let matchesCarroceria = true
        let matchesCombustivel = true
        let matchesAno = true

        if (searchTerms.length > 0) {
          // Include body_type and category in search text for category matching (e.g., "conversível")
          // Normalize vehicle text to match accented/non-accented searches
          const vehicleText = normalizeText(
            `${vehicle.brand} ${vehicle.model} ${vehicle.year_model} ${vehicle.color || ''} ${vehicle.fuel_type || ''} ${vehicle.version || ''} ${vehicle.body_type || ''} ${vehicle.category || ''}`
          )
          // ALL search terms must match (AND logic)
          matchesSearch = searchTerms.every(term => vehicleText.includes(term))
        }

        if (brandFilter) {
          matchesBrand = normalizeText(vehicle.brand || '').includes(normalizeText(brandFilter))
        }

        if (carroceriaFilter) {
          matchesCarroceria = normalizeText(vehicle.body_type || '').includes(normalizeText(carroceriaFilter))
        }

        if (combustivelFilter) {
          matchesCombustivel = normalizeText(vehicle.fuel_type || '').includes(normalizeText(combustivelFilter))
        }

        if (anoFilter) {
          matchesAno = vehicle.year_model?.toString() === anoFilter
        }

        // Apply price filter client-side when filtering
        if (minPrice !== null && vehicle.price < minPrice) matchesPrice = false
        if (maxPrice !== null && vehicle.price > maxPrice) matchesPrice = false

        return matchesSearch && matchesBrand && matchesPrice && matchesCarroceria && matchesCombustivel && matchesAno
      })

      // If no exact matches, find partial matches (suggestions)
      if (vehicles.length === 0 && searchTerms.length > 0) {
        suggestedVehicles = allVehicles.filter(vehicle => {
          // Include body_type and category in suggestion matching (with normalization)
          const vehicleText = normalizeText(
            `${vehicle.brand} ${vehicle.model} ${vehicle.year_model} ${vehicle.color || ''} ${vehicle.fuel_type || ''} ${vehicle.version || ''} ${vehicle.body_type || ''} ${vehicle.category || ''}`
          )
          // Match if ANY of the search terms are found (OR logic for suggestions)
          return searchTerms.some(term => vehicleText.includes(term))
        }).slice(0, 6) // Limit to 6 suggestions
      }

      // Apply client-side sorting after filtering
      if (params.ordenar) {
        vehicles.sort((a, b) => {
          switch (params.ordenar) {
            case 'preco-asc':
              return a.price - b.price
            case 'preco-desc':
              return b.price - a.price
            case 'ano-desc':
              return b.year_model - a.year_model
            case 'km-asc':
              return a.mileage - b.mileage
            default:
              return 0
          }
        })
      }

      total = vehicles.length
      totalPages = Math.ceil(total / perPage) || 1

      // Apply pagination to filtered results
      const startIndex = (currentPage - 1) * perPage
      vehicles = vehicles.slice(startIndex, startIndex + perPage)
    }
  } catch (e) {
    console.error('Failed to fetch vehicles:', e)
    error = e
  }

  const breadcrumbItems = [{ label: 'Estoque', href: '/estoque' }]

  return (
    <>
      <section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Estoque <span className="text-metallic">Premium</span>
            </h1>
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 shrink-0">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <AdvancedFilters />
              </Suspense>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-foreground-secondary">
                  <span className="text-foreground font-medium">{total}</span> veículos
                </p>
                <SortDropdown currentSort={params.ordenar} />
              </div>

              {error ? (
                <div className="text-center py-12 bg-background-card rounded-2xl">
                  <p className="text-foreground-secondary">Erro ao carregar veículos.</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="space-y-8">
                  {/* Suggestions Section */}
                  {suggestedVehicles.length > 0 && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          Não encontramos a combinação exata, mas temos sugestões para você:
                        </h3>
                        <p className="text-foreground-secondary text-sm">
                          Encontramos {suggestedVehicles.length} veículo{suggestedVehicles.length > 1 ? 's' : ''} que pode{suggestedVehicles.length > 1 ? 'm' : ''} te interessar
                        </p>
                      </div>
                      <div className="space-y-6">
                        {suggestedVehicles.map((vehicle) => (
                          <CinematicVehicleCard key={vehicle.id} vehicle={vehicle} layout="horizontal" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Form Section */}
                  <div className="bg-background-card border border-border rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="text-center py-8 px-6 border-b border-border">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {suggestedVehicles.length > 0 ? 'Quer algo mais específico?' : 'Nenhum veículo encontrado'}
                      </h3>
                      <p className="text-foreground-secondary max-w-md mx-auto">
                        {suggestedVehicles.length > 0
                          ? 'Se nenhuma das sugestões acima atende, nossa equipe busca o veículo ideal para você.'
                          : 'Não encontrou o que procura? Nossa equipe busca o veículo ideal para você em todo o Brasil.'
                        }
                      </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-primary/5 border-b border-border">
                      {[
                        { icon: Search, title: 'Busca Personalizada', description: 'Encontramos seu carro ideal' },
                        { icon: Globe, title: 'Rede Nacional', description: 'Buscamos em todo o Brasil' },
                        { icon: Shield, title: 'Procedência Garantida', description: 'Inspeção de 150 pontos' },
                        { icon: Check, title: 'Sem Compromisso', description: 'Serviço 100% gratuito' },
                      ].map((feature) => (
                        <div key={feature.title} className="text-center">
                          <feature.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <p className="font-medium text-foreground text-sm">{feature.title}</p>
                          <p className="text-xs text-foreground-secondary">{feature.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Form */}
                    <div className="p-6 md:p-8">
                      <h4 className="text-lg font-semibold text-foreground mb-4">Descreva o veículo que você procura</h4>
                      <VehicleRequestForm />
                    </div>
                  </div>
                </div>
              ) : (
                <Suspense fallback={<VehicleListSkeleton />}>
                  <div className="space-y-6">
                    {vehicles.map((vehicle) => (
                      <CinematicVehicleCard key={vehicle.id} vehicle={vehicle} layout="horizontal" />
                    ))}
                  </div>
                </Suspense>
              )}

              {totalPages > 1 && (
                <div className="mt-12">
                  <VehiclePagination currentPage={currentPage} totalPages={totalPages} />
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <FAQSection
        faqs={estoqueFAQs}
        title="Dúvidas sobre nosso Estoque"
        subtitle="Perguntas frequentes sobre compra de veículos na Attra"
      />
      <FAQSchema faqs={estoqueFAQs} />
    </>
  )
}
