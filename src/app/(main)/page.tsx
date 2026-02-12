import {
  CinematicHero,
  FeaturedSupercars,
  ExperienceSection,
  TestimonialsSection,
  LocationSection,
  CTASection,
  FAQSection,
  AboutSectionExpanded,
} from '@/components/home'
import { FAQSchema } from '@/components/seo'
import { homepageFAQs } from '@/lib/faq-data'
import { getVehicles, getHomeSlides, HeroSlideData } from '@/lib/autoconf-api'
import { Vehicle } from '@/types'

export default async function Home() {
  // Fetch hero slides for both desktop and mobile
  // Desktop: adsDesktop → destaques → fallback
  // Mobile: adsMobile → adsDesktop → destaques → fallback
  let desktopSlides: HeroSlideData[] = []
  let mobileSlides: HeroSlideData[] = []

  try {
    // Fetch both in parallel for performance
    const [desktop, mobile] = await Promise.all([
      getHomeSlides(4, 'desktop'),
      getHomeSlides(4, 'mobile'),
    ])
    desktopSlides = desktop
    mobileSlides = mobile
  } catch (error) {
    console.error('Failed to fetch home slides:', error)
  }

  // Fetch featured vehicles for the supercars section
  // Only show premium vehicles (R$ 500k+) ordered by highest price
  let featuredVehicles: Vehicle[] = []
  try {
    const result = await getVehicles({
      tipo: 'carros',
      registros_por_pagina: 6,
      ordenar: 'preco',
      ordem: 'desc',
      preco_de: 500000  // Filtro: apenas veículos acima de R$ 500 mil
    })
    featuredVehicles = result.vehicles
  } catch (error) {
    console.error('Failed to fetch featured vehicles:', error)
  }

  return (
    <>
      {/* Full-screen cinematic hero with search widget */}
      <CinematicHero desktopSlides={desktopSlides} mobileSlides={mobileSlides} />

      {/* Featured supercar inventory with cinematic cards */}
      <FeaturedSupercars vehicles={featuredVehicles} />

      {/* Attra experience showcase */}
      <ExperienceSection />

      {/* Expanded About Section - SEO optimized with 400+ words */}
      <AboutSectionExpanded />

      {/* Customer testimonials from Google */}
      <TestimonialsSection />

      {/* FAQ Section with Schema */}
      <FAQSection faqs={homepageFAQs} />
      <FAQSchema faqs={homepageFAQs} />

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
