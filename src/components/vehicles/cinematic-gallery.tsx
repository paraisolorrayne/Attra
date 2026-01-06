'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CinematicGalleryProps {
  photos: string[]
  vehicleName: string
}

// Skeleton loading component
function ImageSkeleton() {
  return (
    <div className="absolute inset-0 bg-background-soft animate-pulse flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary/50 animate-spin" />
    </div>
  )
}

export function CinematicGallery({ photos, vehicleName }: CinematicGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set())

  // Mark image as loaded
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index))
  }, [])

  // Handle image error
  const handleImageError = useCallback((index: number) => {
    setErrorImages(prev => new Set(prev).add(index))
    setLoadedImages(prev => new Set(prev).add(index)) // Hide skeleton
  }, [])

  // Preload adjacent images
  useEffect(() => {
    const preloadIndexes = [
      currentIndex,
      (currentIndex + 1) % photos.length,
      (currentIndex - 1 + photos.length) % photos.length,
    ]

    preloadIndexes.forEach(index => {
      if (!loadedImages.has(index) && photos[index]) {
        const img = new window.Image()
        img.src = photos[index]
      }
    })
  }, [currentIndex, photos, loadedImages])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext, isFullscreen])

  const isCurrentLoaded = loadedImages.has(currentIndex)
  const hasCurrentError = errorImages.has(currentIndex)

  return (
    <>
      {/* Main Hero Gallery - 60-70% viewport */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full bg-background-soft overflow-hidden">
        {/* Main Image - Clickable area to open fullscreen */}
        <div
          className="relative h-full w-full cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
          role="button"
          tabIndex={0}
          aria-label="Clique para ver em tela cheia"
          onKeyDown={(e) => e.key === 'Enter' && setIsFullscreen(true)}
        >
          {/* Loading skeleton for current image */}
          {!isCurrentLoaded && <ImageSkeleton />}

          {photos.map((photo, index) => {
            // Only render current, previous, and next images for performance
            const shouldRender =
              index === currentIndex ||
              index === (currentIndex + 1) % photos.length ||
              index === (currentIndex - 1 + photos.length) % photos.length

            if (!shouldRender) return null

            return (
              <div
                key={photo}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                )}
              >
                {hasCurrentError && index === currentIndex ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background-soft">
                    <p className="text-foreground-secondary">Erro ao carregar imagem</p>
                  </div>
                ) : (
                  <Image
                    src={photo}
                    alt={`${vehicleName} - Imagem ${index + 1}`}
                    fill
                    className={cn(
                      "hero-vehicle-image transition-opacity duration-300",
                      loadedImages.has(index) ? "opacity-100" : "opacity-0"
                    )}
                    priority={index === 0 || index === currentIndex}
                    quality={90}
                    sizes="100vw"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            )
          })}

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none z-15" />
        </div>

        {/* Subtle gradient overlays - reduced for better image visibility */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-20" />

        {/* Navigation arrows - stopPropagation to prevent opening fullscreen when clicking arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevious() }}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-all z-40"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goToNext() }}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-all z-40"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Fullscreen button - z-40 to stay below header (z-50) but above content */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsFullscreen(true) }}
          className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-all z-40"
          aria-label="Tela cheia"
        >
          <Expand className="w-5 h-5" />
        </button>

        {/* Image counter */}
        <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full text-white text-sm z-40 pointer-events-none">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Thumbnail strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80%] overflow-x-auto py-2 px-4 z-40">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index) }}
              className={cn(
                'relative w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all bg-background-soft',
                index === currentIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                quality={60}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-16">
            {/* Loading indicator for fullscreen */}
            {!loadedImages.has(currentIndex) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-white/50 animate-spin" />
              </div>
            )}
            <Image
              src={photos[currentIndex]}
              alt={`${vehicleName} - Imagem ${currentIndex + 1}`}
              fill
              className={cn(
                "object-contain transition-opacity duration-300",
                loadedImages.has(currentIndex) ? "opacity-100" : "opacity-0"
              )}
              quality={100}
              sizes="100vw"
              priority
              onLoad={() => handleImageLoad(currentIndex)}
              onError={() => handleImageError(currentIndex)}
            />
          </div>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Thumbnail strip in fullscreen */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90%] overflow-x-auto py-2 px-4">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                  index === currentIndex ? 'border-primary' : 'border-white/30 opacity-60 hover:opacity-100'
                )}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                  quality={60}
                />
              </button>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}

