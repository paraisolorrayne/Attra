'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { HeroSearchWidget } from './hero-search-widget'
import { Vehicle } from '@/types'

interface HeroSlide {
  image: string
  vehicle?: Vehicle
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
}

interface CinematicHeroProps {
  heroImages?: string[]
  heroVehicles?: Vehicle[]
}

// Dynamic slide content based on vehicle characteristics
function generateSlideContent(vehicle: Vehicle, index: number): Omit<HeroSlide, 'image' | 'vehicle'> {
  const isSupercar = vehicle.category === 'supercar' || (vehicle.horsepower && vehicle.horsepower > 500)
  const isImported = vehicle.origin === 'imported'

  // Alternate between storytelling and functional slides
  const slideVariants: Omit<HeroSlide, 'image' | 'vehicle'>[] = [
    {
      headline: `${vehicle.brand}. Performance sem limites`,
      subheadline: 'Encontre seu próximo superesportivo em nosso inventário exclusivo',
      ctaText: `Ver ${vehicle.brand}`,
      ctaLink: `/estoque?marca=${vehicle.brand.toLowerCase()}`,
    },
    {
      headline: 'Potência e elegância em cada detalhe',
      subheadline: `${vehicle.brand} ${vehicle.model} ${vehicle.year_model} - ${vehicle.mileage === 0 ? '0 km' : `${vehicle.mileage?.toLocaleString('pt-BR')} km`}`,
      ctaText: 'Ver detalhes',
      ctaLink: `/veiculo/${vehicle.slug}`,
    },
    {
      headline: 'Exclusividade sobre rodas',
      subheadline: isSupercar
        ? `${vehicle.horsepower ? `${vehicle.horsepower} cv de pura emoção` : 'Performance incomparável'}`
        : 'Seleção curada de nacionais, importados e superesportivos',
      ctaText: isImported ? 'Importados exclusivos' : 'Explorar estoque',
      ctaLink: isImported ? '/estoque?origem=importado' : '/estoque',
    },
    {
      headline: `${vehicle.model}. Sonho realizado`,
      subheadline: 'Seu próximo capítulo começa aqui',
      ctaText: `Ver todos ${vehicle.brand}`,
      ctaLink: `/estoque?marca=${vehicle.brand.toLowerCase()}`,
    },
  ]

  return slideVariants[index % slideVariants.length]
}

export function CinematicHero({ heroImages = [], heroVehicles = [] }: CinematicHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const slideContainerRef = useRef<HTMLDivElement>(null)

  // Build slides with vehicle data
  const slides: HeroSlide[] = heroVehicles.length > 0
    ? heroVehicles.slice(0, 4).map((vehicle, index) => ({
        image: vehicle.photos?.[0] || '',
        vehicle,
        ...generateSlideContent(vehicle, index),
      }))
    : heroImages.slice(0, 4).map((image) => ({
        image,
        headline: 'Attra. Performance sem limites',
        subheadline: 'Seleção curada de nacionais, importados e superesportivos de alto nível',
        ctaText: 'Explorar estoque',
        ctaLink: '/estoque',
      }))

  const totalSlides = slides.length

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  // Auto-advance slides - 4.5s timing for optimal mobile UX
  useEffect(() => {
    setIsLoaded(true)
    if (totalSlides <= 1 || isPaused) return

    const interval = setInterval(goToNext, 4500)
    return () => clearInterval(interval)
  }, [totalSlides, isPaused, goToNext])

  // Touch handling for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setIsPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrev()
    }

    setTouchStart(null)
    setTimeout(() => setIsPaused(false), 3000)
  }

  const currentSlideData = slides[currentSlide] || slides[0]
  const currentVehicle = currentSlideData?.vehicle

  // Format price for display
  const formatPrice = (price: number | undefined) => {
    if (!price) return null
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Format mileage for display
  const formatMileage = (km: number | undefined) => {
    if (km === undefined) return null
    if (km === 0) return '0 km'
    return `${km.toLocaleString('pt-BR')} km`
  }

  return (
    <>
    <section
      className="relative h-[88svh] min-h-[520px] max-h-[780px] md:h-[80svh] md:min-h-[580px] lg:max-h-[750px] w-full overflow-hidden bg-neutral-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade */}
      <div
        ref={slideContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0"
      >
        {slides.length > 0 ? (
          slides.map((slide, index) => {
            const slideClassName = `absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`
            const imageElement = (
              <Image
                src={slide.image}
                alt={slide.vehicle
                  ? `${slide.vehicle.brand} ${slide.vehicle.model}`
                  : `Veículo em destaque ${index + 1}`
                }
                fill
                className="hero-vehicle-image"
                priority={index <= 1}
                sizes="100vw"
                quality={90}
                unoptimized={slide.image.includes('autoconf') || slide.image.includes('cdn')}
              />
            )

            return slide.vehicle ? (
              <Link
                key={slide.image || index}
                href={`/veiculo/${slide.vehicle.slug}`}
                className={`${slideClassName} cursor-pointer`}
              >
                {imageElement}
              </Link>
            ) : (
              <div key={slide.image || index} className={slideClassName}>
                {imageElement}
              </div>
            )
          })
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}
      </div>

      {/* Gradient Overlay - Minimal, vehicle-first approach */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-[2]" />
      {/* Subtle bottom gradient for text legibility only */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-[2]" />

      {/* Navigation Arrows - Side positioned, visible on larger screens */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); goToPrev() }}
            className="hidden md:block absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white/70 hover:bg-black/60 hover:text-white hover:border-white/40 transition-all group"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); goToNext() }}
            className="hidden md:block absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white/70 hover:bg-black/60 hover:text-white hover:border-white/40 transition-all group"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Bottom Stats Bar - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/70 backdrop-blur-md border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Vehicle Stats - Left side */}
            {currentVehicle ? (
              <div className={`flex items-center gap-4 sm:gap-6 md:gap-8 opacity-0 ${isLoaded ? 'animate-fade-in-up stagger-2' : ''}`}>
                <div className="text-center">
                  <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-wider">Ano</p>
                  <p className="text-white text-sm md:text-base font-medium">{currentVehicle.year_model}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-wider">Km</p>
                  <p className="text-white text-sm md:text-base font-medium">{formatMileage(currentVehicle.mileage)}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-wider">Valor</p>
                  <p className="text-white text-sm md:text-base font-semibold">{formatPrice(currentVehicle.price)}</p>
                </div>
                {/* CTA Button */}
                <Link
                  href={`/veiculo/${currentVehicle.slug}`}
                  className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs md:text-sm font-medium px-4 md:px-5 py-2 md:py-2.5 rounded-full transition-colors ml-2"
                >
                  Ver detalhes
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className={`opacity-0 ${isLoaded ? 'animate-fade-in-up stagger-2' : ''}`}>
                <p className="text-white/60 text-xs md:text-sm">Explore nossa seleção exclusiva</p>
              </div>
            )}

            {/* Slide Navigation - Right side */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-3 md:gap-4">
                {/* Dots */}
                <div className="flex gap-1.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-primary w-5'
                          : 'bg-white/30 hover:bg-white/50 w-2'
                      }`}
                      aria-label={`Ir para slide ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Arrows */}
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => { e.preventDefault(); goToPrev() }}
                    className="p-1.5 md:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); goToNext() }}
                    className="p-1.5 md:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Próximo slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile CTA - Full width on small screens */}
          {currentVehicle && (
            <div className={`sm:hidden mt-3 opacity-0 ${isLoaded ? 'animate-fade-in-up stagger-3' : ''}`}>
              <Link
                href={`/veiculo/${currentVehicle.slug}`}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2.5 rounded-full transition-colors"
              >
                Ver detalhes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>

    {/* Search Widget - Below Hero Section */}
    <div className="bg-background py-6 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <HeroSearchWidget />
      </div>
    </div>
    </>
  )
}

