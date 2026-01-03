'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, Play } from 'lucide-react'
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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1))
  }

  const isVideo = (url: string) => {
    return url.includes('youtube') || url.includes('vimeo') || url.endsWith('.mp4')
  }

  return (
    <div className="space-y-4">
      {/* Main image/video */}
      <div className="relative aspect-[16/10] bg-background-card border border-border rounded-xl overflow-hidden group">
        {hasMedia ? (
          isVideo(allMedia[currentIndex]) ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-16 h-16 text-white" />
            </div>
          ) : (
            <Image
              src={allMedia[currentIndex]}
              alt={`${vehicleName} - Foto ${currentIndex + 1}`}
              fill
              className="vehicle-image-responsive"
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

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors',
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
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

