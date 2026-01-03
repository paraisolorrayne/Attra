import {
  CinematicHero,
  FeaturedSupercars,
  EngineSoundSection,
  ExperienceSection,
  LocationSection,
  CTASection,
} from '@/components/home'
import { getVehicles, getHomeVehicles } from '@/lib/autoconf-api'
import { Vehicle } from '@/types'

export default async function Home() {
  // Fetch hero vehicles from /veiculos-home endpoint (for banner carousel)
  let heroVehicles: Vehicle[] = []
  try {
    heroVehicles = await getHomeVehicles(4)
  } catch (error) {
    console.error('Failed to fetch home vehicles:', error)
  }

  // Fetch featured vehicles for the supercars section
  let featuredVehicles: Vehicle[] = []
  try {
    const result = await getVehicles({
      tipo: 'carros',
      registros_por_pagina: 6,
      ordenar: 'preco',
      ordem: 'desc'
    })
    featuredVehicles = result.vehicles
  } catch (error) {
    console.error('Failed to fetch featured vehicles:', error)
  }

  return (
    <>
      {/* Full-screen cinematic hero with search widget */}
      <CinematicHero heroVehicles={heroVehicles} />

      {/* Featured supercar inventory with cinematic cards */}
      <FeaturedSupercars vehicles={featuredVehicles} />

      {/* Interactive engine sound experience */}
      <EngineSoundSection />

      {/* Attra experience showcase */}
      <ExperienceSection />

      {/* Final CTA */}
      <CTASection />

      {/* Locations */}
      <LocationSection />

      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoDealer',
            name: 'Attra Veículos',
            description: 'Referência em veículos nacionais, importados, seminovos e supercarros em Uberlândia.',
            url: 'https://attraveiculos.com.br',
            telephone: '+55-34-3256-3100',
            address: [
              {
                '@type': 'PostalAddress',
                streetAddress: 'Av. João Pinheiro, 2564',
                addressLocality: 'Uberlândia',
                addressRegion: 'MG',
                postalCode: '38400-714',
                addressCountry: 'BR',
              },
              {
                '@type': 'PostalAddress',
                streetAddress: 'Av. Rondon Pacheco, 1670',
                addressLocality: 'Uberlândia',
                addressRegion: 'MG',
                postalCode: '38400-242',
                addressCountry: 'BR',
              },
            ],
            geo: {
              '@type': 'GeoCoordinates',
              latitude: -18.9186,
              longitude: -48.2772,
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '18:00',
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '08:00',
                closes: '13:00',
              },
            ],
            priceRange: '$$$',
            brand: ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Land Rover', 'Ferrari', 'Lamborghini'],
          }),
        }}
      />
    </>
  )
}
