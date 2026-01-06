'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, Play, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VehicleGalleryProps {
  photos: string[]
  videos?: string[] | null
  vehicleName: string
}

export function VehicleGallery({ photos, videos, vehicleName }: VehicleGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const allMedia = [...photos, ...(videos || [])]
  const hasMedia = allMedia.length > 0

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1))
  }, [allMedia.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1))
  }, [allMedia.length])

  const isVideo = (url: string) => {
    return url.includes('youtube') || url.includes('vimeo') || url.endsWith('.mp4')
  }

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

  return (
    <div className="space-y-4">
      {/* Main image/video - responsive aspect ratio: 4:3 on mobile, 16:9 on desktop */}
      <div className="relative aspect-[4/3] md:aspect-[16/9] bg-background-card border border-border rounded-xl overflow-hidden group vehicle-image-container">
        {hasMedia ? (
          isVideo(allMedia[currentIndex]) ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background-soft">
              <Play className="w-16 h-16 text-foreground-secondary" />
            </div>
          ) : (
            <Image
              src={allMedia[currentIndex]}
              alt={`${vehicleName} - Foto ${currentIndex + 1}`}
              fill
              className="hero-vehicle-image"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-foreground-secondary">
            <span>Sem imagens disponíveis</span>
          </div>
        )}

        {/* Navigation arrows */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>
          </>
        )}

        {/* Fullscreen button */}
        {hasMedia && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 p-2 bg-background/80 hover:bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Tela cheia"
          >
            <Expand className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Counter */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 rounded-full text-sm text-foreground">
            {currentIndex + 1} / {allMedia.length}
          </div>
        )}
      </div>

      {/* Thumbnails - consistent 4:3 aspect ratio */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative flex-shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors vehicle-image-container',
                index === currentIndex ? 'border-primary' : 'border-transparent hover:border-border'
              )}
            >
              {isVideo(media) ? (
                <div className="absolute inset-0 bg-background-card flex items-center justify-center">
                  <Play className="w-6 h-6 text-foreground-secondary" />
                </div>
              ) : (
                <Image
                  src={media}
                  alt={`${vehicleName} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="80px"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation - Previous */}
          {allMedia.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Main image */}
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-16">
            {isVideo(allMedia[currentIndex]) ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-24 h-24 text-white/50" />
              </div>
            ) : (
              <Image
                src={allMedia[currentIndex]}
                alt={`${vehicleName} - Imagem ${currentIndex + 1}`}
                fill
                className="object-contain"
                quality={100}
                sizes="100vw"
                priority
              />
            )}
          </div>

          {/* Navigation - Next */}
          {allMedia.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Thumbnail strip in fullscreen */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90%] overflow-x-auto py-2 px-4">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'relative w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                    index === currentIndex ? 'border-primary' : 'border-white/30 opacity-60 hover:opacity-100'
                  )}
                >
                  {isVideo(media) ? (
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <Image
                      src={media}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      quality={60}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {allMedia.length}
          </div>
        </div>
      )}
    </div>
  )
}

