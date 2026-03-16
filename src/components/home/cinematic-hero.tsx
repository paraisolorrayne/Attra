'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroControl } from '@/components/ui/brand'
import { HeroSearchWidget } from './hero-search-widget'
import { HeroSlideData } from '@/lib/autoconf-api'

// Background images for theme-aware hero (used only for vehicle slides)
const HERO_BACKGROUNDS = {
  light: '/images/background-banner-light.jpg',
  dark: '/images/background-banner-dark.jpg',
}

// Breakpoint for mobile detection (matches Tailwind's md breakpoint)
const MOBILE_BREAKPOINT = 768

interface CinematicHeroProps {
  desktopSlides?: HeroSlideData[]
  mobileSlides?: HeroSlideData[]
}

export function CinematicHero({ desktopSlides = [], mobileSlides = [] }: CinematicHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const slideContainerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get theme-aware background image for vehicle slides
  const backgroundImage = mounted
    ? (resolvedTheme === 'dark' ? HERO_BACKGROUNDS.dark : HERO_BACKGROUNDS.light)
    : HERO_BACKGROUNDS.light

  // Select slides based on device type
  // Mobile uses mobileSlides with fallback to desktopSlides
  // Desktop uses desktopSlides
  const activeSlides = isMobile
    ? (mobileSlides.length > 0 ? mobileSlides : desktopSlides)
    : desktopSlides

  // Use provided slides or create fallback
  const slides: HeroSlideData[] = activeSlides.length > 0
    ? activeSlides
    : [{
        type: 'banner',
        image: HERO_BACKGROUNDS.light,
        targetUrl: '/veiculos',
        ordem: 0,
      }]

  // Reset slide index when switching device type to prevent out-of-bounds
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0)
    }
  }, [isMobile, slides.length, currentSlide])

  // Check if current slide is a banner or vehicle
  const currentSlideData = slides[currentSlide]
  const isBannerSlide = currentSlideData?.type === 'banner'
  const currentVehicle = currentSlideData?.vehicle

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

  // Set mounted state for theme detection
  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Dynamic height classes based on slide type
  // Banner mobile (720x400) has ~1.8:1 ratio, so height should be ~56% of viewport width
  // Vehicle slides need more height to show the full car
  // mt-20 compensates for fixed header (h-20 = 80px)
  // Reduced heights to make room for CTA button below
  const heroHeightClass = isBannerSlide && isMobile
    ? "relative mt-20 h-[50vw] min-h-[220px] max-h-[350px] md:h-[60svh] md:min-h-[400px] lg:max-h-[550px] w-full overflow-hidden"
    : "relative mt-20 h-[65svh] min-h-[380px] max-h-[550px] md:h-[60svh] md:min-h-[400px] lg:max-h-[550px] w-full overflow-hidden"

  return (
    <>
    <section
      className={heroHeightClass}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Layer 1: Background - Theme-aware for vehicle slides, hidden for banner slides */}
      {!isBannerSlide && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage}
            alt="Attra Veículos Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={85}
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      )}

      {/* Layer 2: Slides with Crossfade - Banners or Vehicle Images */}
      <div
        ref={slideContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 z-[1]"
      >
        {slides.length > 0 ? (
          slides.map((slide, index) => {
            const slideClassName = `absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`

            // Banner slides: full cover image with link
            // Mobile banners (720x400) have different aspect ratio than desktop (1920x450)
            if (slide.type === 'banner') {
              return (
                <Link
                  key={`banner-${index}`}
                  href={slide.targetUrl}
                  className={`${slideClassName} cursor-pointer`}
                >
                  <Image
                    src={slide.image}
                    alt={`Banner promocional ${index + 1}`}
                    fill
                    className="hero-banner-image"
                    priority={index <= 1}
                    sizes="100vw"
                    quality={95}
                    unoptimized={slide.image.includes('autoconf') || slide.image.includes('cdn')}
                  />
                </Link>
              )
            }

            // Vehicle slides: contained image with vehicle link
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

            return (
              <Link
                key={slide.vehicle?.id || `slide-${index}`}
                href={slide.targetUrl}
                className={`${slideClassName} cursor-pointer`}
              >
                {imageElement}
              </Link>
            )
          })
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}
      </div>

      {/* Layer 3: Gradient Overlays - Hidden for banner slides to show full promotional image */}
      {!isBannerSlide && (
        <>
          <div className="absolute inset-0 z-[2] hero-gradient-overlay" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 z-[2] hero-bottom-gradient" />
        </>
      )}

      {/* Navigation Arrows - Side positioned, visible on larger screens */}
      {totalSlides > 1 && (
        <>
          <HeroControl
            direction="prev"
            variant="side"
            onClick={(e) => { e.preventDefault(); goToPrev() }}
            className="hidden md:block absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20"
          />
          <HeroControl
            direction="next"
            variant="side"
            onClick={(e) => { e.preventDefault(); goToNext() }}
            className="hidden md:block absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20"
          />
        </>
      )}

      {/* Bottom Stats Bar - Fixed at bottom, theme-aware */}
      {/* Hidden for banner slides to show full promotional image */}
      <div className={`hero-shell__stats transition-opacity duration-300 ${isBannerSlide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Vehicle Stats - Left side */}
            {currentVehicle ? (
              <div className={`flex items-center gap-4 sm:gap-6 md:gap-8 opacity-0 ${isLoaded ? 'animate-fade-in-up stagger-2' : ''}`}>
                <div className="text-center">
                  <p className="stat-label">Ano</p>
                  <p className="stat-value text-sm md:text-base">{currentVehicle.year_model}</p>
                </div>
                <div className="text-center">
                  <p className="stat-label">Km</p>
                  <p className="stat-value text-sm md:text-base">{formatMileage(currentVehicle.mileage)}</p>
                </div>
                <div className="text-center">
                  <p className="stat-label">Valor</p>
                  <p className="stat-value text-sm md:text-base">{formatPrice(currentVehicle.price)}</p>
                </div>
                {/* CTA Button */}
                <Link
                  href={`/veiculo/${currentVehicle.slug}`}
                  className="hero-shell__cta hidden sm:inline-flex ml-2"
                >
                  Ver detalhes
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className={`opacity-0 ${isLoaded ? 'animate-fade-in-up stagger-2' : ''}`}>
                <p className="stat-label text-xs md:text-sm">Explore nossa seleção exclusiva</p>
              </div>
            )}

            {/* Slide Navigation - Right side */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-3 md:gap-4">
                {/* Dots */}
                <div className="hero-shell__dots flex gap-1.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      data-active={index === currentSlide ? 'true' : 'false'}
                      aria-label={`Ir para slide ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Arrows */}
                <div className="flex gap-1.5">
                  <HeroControl
                    direction="prev"
                    variant="inline"
                    onClick={(e) => { e.preventDefault(); goToPrev() }}
                  />
                  <HeroControl
                    direction="next"
                    variant="inline"
                    onClick={(e) => { e.preventDefault(); goToNext() }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile CTA - Full width on small screens */}
          {currentVehicle && (
            <div className={`sm:hidden mt-3 opacity-0 ${isLoaded ? 'animate-fade-in-up stagger-3' : ''}`}>
              <Link
                href={`/veiculo/${currentVehicle.slug}`}
                className="hero-shell__cta flex items-center justify-center w-full py-2.5"
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
    <div className="bg-background py-3 md:py-8 px-3 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <HeroSearchWidget />
      </div>
    </div>
    </>
  )
}

