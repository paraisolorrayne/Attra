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
import { ConciergeCtaSection } from '@/components/home/concierge-cta-section'
import { FAQSchema } from '@/components/seo'
import { homepageFAQs } from '@/lib/faq-data'
import { getVehicles, getHomeSlides, HeroSlideData } from '@/lib/autoconf-api'
import { createAdminClient } from '@/lib/supabase/server'
import { Vehicle } from '@/types'

/**
 * Fetch banners from Supabase site_banners table.
 * Returns HeroSlideData[] for compatibility with CinematicHero component.
 */
async function getSupabaseBanners(deviceType: 'desktop' | 'mobile'): Promise<HeroSlideData[]> {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('site_banners')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .in('device_type', ['all', deviceType])
      .order('display_order', { ascending: true })
      .limit(10)

    if (error || !data || data.length === 0) {
      return []
    }

    return data.map((banner) => ({
      type: 'banner' as const,
      image: deviceType === 'mobile' && banner.image_mobile_url ? banner.image_mobile_url : banner.image_url,
      targetUrl: banner.target_url || '/',
      ordem: banner.display_order,
    }))
  } catch {
    return []
  }
}

export default async function Home() {
  // Fetch hero slides: Supabase banners first, then AutoConf as fallback
  let desktopSlides: HeroSlideData[] = []
  let mobileSlides: HeroSlideData[] = []

  try {
    // Try Supabase banners first
    const [supabaseDesktop, supabaseMobile] = await Promise.all([
      getSupabaseBanners('desktop'),
      getSupabaseBanners('mobile'),
    ])

    if (supabaseDesktop.length > 0) {
      desktopSlides = supabaseDesktop
    }
    if (supabaseMobile.length > 0) {
      mobileSlides = supabaseMobile
    }

    // Fallback to AutoConf if no Supabase banners
    if (desktopSlides.length === 0 || mobileSlides.length === 0) {
      const [autoconfDesktop, autoconfMobile] = await Promise.all([
        desktopSlides.length === 0 ? getHomeSlides(4, 'desktop') : Promise.resolve([]),
        mobileSlides.length === 0 ? getHomeSlides(4, 'mobile') : Promise.resolve([]),
      ])
      if (desktopSlides.length === 0) desktopSlides = autoconfDesktop
      if (mobileSlides.length === 0) mobileSlides = autoconfMobile
    }
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

      {/* Concierge CTA - Agendar Atendimento Exclusivo */}
      <ConciergeCtaSection />

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
            description: 'Referência em veículos premium, carros de luxo, importados e supercarros em Uberlândia. Loja de veículos premium em Minas Gerais com curadoria rigorosa e entrega nacional.',
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
