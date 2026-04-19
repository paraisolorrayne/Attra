import {
  FeaturedSupercars,
  ExperienceSection,
  LocationSection,
  FAQSection,
  AboutSectionExpanded,
  ProofOfSolidity,
  FeaturedEditorial,
  JourneyPreview,
  HeroSearchWidget,
} from '@/components/home'
import { FeaturedVehicleHero } from '@/components/vehicles'
import { FAQSchema } from '@/components/seo'
import { homepageFAQs } from '@/lib/faq-data'
import { getVehicles } from '@/lib/autoconf-api'
import { Vehicle } from '@/types'

export default async function Home() {
  // Fetch featured vehicles for the supercars section
  // Only show premium vehicles (R$ 500k+) ordered by highest price
  let featuredVehicles: Vehicle[] = []
  let featuredVehicle: Vehicle | null = null
  try {
    const result = await getVehicles({
      tipo: 'carros',
      registros_por_pagina: 20,
      ordenar: 'preco',
      ordem: 'desc',
      preco_de: 500000
    })
    featuredVehicles = result.vehicles.filter(v => v.price >= 500000)

    // Mirror /veiculos hero pick: deterministic rotation across the top 3 by day of month
    if (featuredVehicles.length > 0) {
      const top3 = [...featuredVehicles]
        .sort((a, b) => b.price - a.price)
        .slice(0, Math.min(3, featuredVehicles.length))
      const dayIndex = new Date().getDate() % top3.length
      featuredVehicle = top3[dayIndex]
    }
  } catch (error) {
    console.error('Failed to fetch featured vehicles:', error)
  }

  return (
    <>
      {/* Hero - Featured vehicle (top 3 by price, daily rotation) */}
      {/* pt-20 md:pt-24 clears the fixed header (h-20) on the home, since /veiculos relies on the breadcrumb for that */}
      {featuredVehicle && (
        <div className="pt-20 md:pt-24">
          <FeaturedVehicleHero vehicle={featuredVehicle} />
        </div>
      )}

      {/* Search widget (CTA + busca + filtros), antes embutido no CinematicHero */}
      <section className="px-4 mb-8 md:mb-12">
        <HeroSearchWidget />
      </section>

      {/* 3. Destaques do Estoque - Featured supercar inventory */}
      <FeaturedSupercars vehicles={featuredVehicles} />

      {/* 1. Proposta Institucional - Expanded About Section */}
      <AboutSectionExpanded />

      {/* 2. Prova de Solidez - Numbers and pillars (NEW) */}
      <ProofOfSolidity />

      {/* 4. Frentes de Atuação - Attra experience showcase */}
      <ExperienceSection />

      {/* 5. Jornada Attra - Journey preview (NEW) */}
      <JourneyPreview />

      {/* 6. Conteúdo - Featured editorial highlights (NEW) */}
      <FeaturedEditorial />

      {/* 7. FAQ Section with Schema */}
      <FAQSection faqs={homepageFAQs} />
      <FAQSchema faqs={homepageFAQs} />

      {/* 8. Contato - Locations */}
      <LocationSection />

      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AutoDealer',
            name: 'Attra Veículos',
            description: 'Curadoria e comercialização de veículos nacionais, importados, esportivos e supercarros, com operação em Uberlândia e atendimento em todo o Brasil.',
            url: 'https://attraveiculos.com.br',
            telephone: '+55-34-3014-3232',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Av. Rondon Pacheco, 1670',
              addressLocality: 'Uberlândia',
              addressRegion: 'MG',
              postalCode: '38408-343',
              addressCountry: 'BR',
            },
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
