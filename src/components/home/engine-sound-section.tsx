'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Volume2, VolumeX, Play, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'

interface VehicleWithSound {
  id: string
  vehicle_id: string
  name: string
  brand: string
  slug: string
  description: string | null
  soundUrl: string
  icon: string
  isElectric: boolean
  imageUrl: string | null
  year: number | null
  price: number | null
}

interface EngineType {
  id: string
  name: string
  brand: string
  description: string
  soundUrl: string
  vehicles: { name: string; slug: string }[]
  icon: string
  isElectric?: boolean
  electricLabel?: string
  imageUrl?: string | null
  year?: number | null
  price?: number | null
}

// Format price for display
function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Fallback data when no sounds are configured in admin
const fallbackEngineTypes: EngineType[] = [
  {
    id: 'ferrari-v12',
    name: 'Ferrari V12',
    brand: 'Ferrari',
    description: 'O rugido operístico de Maranello',
    soundUrl: '/sounds/ferrari-v12.mp3',
    vehicles: [
      { name: '812 Superfast', slug: 'ferrari-812-superfast' },
      { name: 'Purosangue', slug: 'ferrari-purosangue' },
    ],
    icon: '🏎️',
  },
  {
    id: 'lambo-v10',
    name: 'Lamborghini V10',
    brand: 'Lamborghini',
    description: 'A sinfonia de Sant\'Agata',
    soundUrl: '/sounds/lambo-v10.mp3',
    vehicles: [
      { name: 'Huracán EVO', slug: 'lamborghini-huracan-evo' },
      { name: 'Huracán Sterrato', slug: 'lamborghini-huracan-sterrato' },
    ],
    icon: '🔥',
  },
  {
    id: 'porsche-flat6',
    name: 'Porsche Flat-6',
    brand: 'Porsche',
    description: 'O boxer mais icônico do mundo',
    soundUrl: '/sounds/porsche-flat6.mp3',
    vehicles: [
      { name: '911 GT3', slug: 'porsche-911-gt3' },
      { name: '911 Carrera GTS', slug: 'porsche-911-carrera-gts' },
    ],
    icon: '⚡',
  },
  {
    id: 'audi-rs-v8',
    name: 'Audi RS V8 Biturbo',
    brand: 'Audi',
    description: 'Potência alemã refinada',
    soundUrl: '/sounds/audi-rs-v8.mp3',
    vehicles: [
      { name: 'RS6 Avant', slug: 'audi-rs6-avant' },
      { name: 'RS7 Sportback', slug: 'audi-rs7-sportback' },
    ],
    icon: '🏁',
  },
  {
    id: 'american-v8',
    name: 'American V8',
    brand: 'Cadillac',
    description: 'O poder bruto americano',
    soundUrl: '/sounds/american-v8.mp3',
    vehicles: [
      { name: 'Escalade-V', slug: 'cadillac-escalade-v' },
      { name: 'CT5-V Blackwing', slug: 'cadillac-ct5-v-blackwing' },
    ],
    icon: '🦅',
  },
  {
    id: 'electric-performance',
    name: 'Performance Elétrica',
    brand: 'Porsche',
    description: 'Silêncio que acelera o futuro',
    soundUrl: '/sounds/electric-ambient.mp3',
    vehicles: [
      { name: 'Porsche Taycan Turbo S', slug: 'porsche-taycan-turbo-s' },
      { name: 'BMW i7 M70', slug: 'bmw-i7-m70' },
    ],
    icon: '⚡',
    isElectric: true,
    electricLabel: 'Tecnologia silenciosa',
  },
]

// Convert API response to EngineType format
function convertToEngineType(vehicle: VehicleWithSound): EngineType {
  return {
    id: vehicle.id,
    name: vehicle.name,
    brand: vehicle.brand,
    description: vehicle.description || 'Som exclusivo',
    soundUrl: vehicle.soundUrl,
    vehicles: [{ name: vehicle.name, slug: vehicle.slug }],
    icon: vehicle.icon,
    isElectric: vehicle.isElectric,
    electricLabel: vehicle.isElectric ? 'Tecnologia silenciosa' : undefined,
    imageUrl: vehicle.imageUrl,
    year: vehicle.year,
    price: vehicle.price,
  }
}

export function EngineSoundSection() {
  const [activeEngine, setActiveEngine] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [engineTypes, setEngineTypes] = useState<EngineType[]>(fallbackEngineTypes)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Fetch dynamic sounds from API
  useEffect(() => {
    async function fetchSounds() {
      try {
        const res = await fetch('/api/vehicles/with-sounds')
        if (res.ok) {
          const data = await res.json()
          if (data.vehicles && data.vehicles.length > 0) {
            // Use dynamic data from admin panel
            setEngineTypes(data.vehicles.map(convertToEngineType))
          }
          // If no vehicles, keep fallback data
        }
      } catch (error) {
        console.error('Failed to fetch engine sounds:', error)
        // Keep fallback data on error
      }
    }
    fetchSounds()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const togglePlay = async (engine: EngineType) => {
    // If currently playing this engine, pause it
    if (isPlaying && activeEngine === engine.id) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    // Try to play new sound
    if (audioRef.current) {
      try {
        // Stop any current playback
        audioRef.current.pause()
        audioRef.current.currentTime = 0

        // Set new source and play
        audioRef.current.src = engine.soundUrl
        audioRef.current.load() // Force reload the audio

        await audioRef.current.play()
        setActiveEngine(engine.id)
        setIsPlaying(true)
      } catch (err) {
        console.error('Audio play error:', err)
        setIsPlaying(false)
      }
    }
  }

  return (
    <section ref={sectionRef} className="py-24 bg-background-soft relative overflow-hidden">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />

      <Container>
        {/* Section Header */}
        <div className={`text-center mb-16 opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Volume2 className="w-6 h-6 text-primary" />
            <span className="text-primary font-medium tracking-wide uppercase text-sm">Experiência Sonora</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Som do Poder
          </h2>
          <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
            {engineTypes.length === 1
              ? 'Ouça o ronco do motor em alta qualidade, sentindo a personalidade desta máquina antes mesmo de ligar a ignição.'
              : 'Selecione um modelo e ouça o ronco do motor em alta qualidade, sentindo a personalidade de cada máquina antes mesmo de ligar a ignição.'
            }
          </p>
        </div>

        {/* Engine Cards - Single Card Layout or Grid */}
        {engineTypes.length === 1 ? (
          // Single vehicle hero layout with image
          <div className="max-w-2xl mx-auto">
            {engineTypes.map((engine) => (
              <Link
                key={engine.id}
                href={`/veiculo/${engine.vehicles[0]?.slug || '#'}`}
                className={`group block opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}
              >
                <div className="bg-background-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 hover:border-primary card-premium">
                  {/* Image container with 16:9 aspect ratio for hero */}
                  <div className="relative aspect-[16/9] bg-background-soft overflow-hidden vehicle-image-container">
                    {engine.imageUrl ? (
                      <Image
                        src={engine.imageUrl}
                        alt={engine.name}
                        fill
                        className="card-vehicle-image transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 672px"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                        <span className="text-8xl">{engine.icon}</span>
                      </div>
                    )}

                    {/* Sound badge overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary/95 text-white backdrop-blur-md shadow-sm">
                        <Volume2 className="w-4 h-4" />
                        Som disponível
                      </span>
                    </div>

                    {/* Electric Badge */}
                    {engine.isElectric && (
                      <div className="absolute top-4 right-4 px-4 py-2 bg-emerald-500/90 text-white text-sm font-semibold rounded-full backdrop-blur-md">
                        EV
                      </div>
                    )}

                    {/* Waveform overlay when playing */}
                    {isPlaying && activeEngine === engine.id && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex items-end justify-center gap-1.5 h-16">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((bar) => (
                            <div
                              key={bar}
                              className="w-2 rounded-full bg-white animate-pulse"
                              style={{
                                height: `${20 + Math.random() * 60}%`,
                                animationDelay: `${bar * 0.1}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8">
                    {/* Brand */}
                    <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
                      {engine.brand}
                    </p>

                    {/* Model Name */}
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {engine.name}
                    </h3>

                    {/* Year and description */}
                    <p className="text-base text-foreground-secondary mb-6">
                      {engine.year || ''} {engine.description && `• ${engine.description}`}
                    </p>

                    {/* Price if available */}
                    {engine.price && (
                      <p className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                        {formatPrice(engine.price)}
                      </p>
                    )}

                    {/* Play Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        togglePlay(engine)
                      }}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-base font-semibold transition-all
                        ${engine.isElectric
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                          : 'bg-primary/10 hover:bg-primary/20 text-primary'
                        }`}
                    >
                      {isPlaying && activeEngine === engine.id ? (
                        <><VolumeX className="w-6 h-6" /> Pausar som</>
                      ) : (
                        <><Play className="w-6 h-6" /> {engine.isElectric ? 'Ouvir ambiente' : 'Ouvir o ronco'}</>
                      )}
                    </button>

                    {/* View vehicle link */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-base text-foreground-secondary group-hover:text-primary transition-colors">
                      Ver detalhes do veículo <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Multiple vehicles grid layout - styled like VehicleCard
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {engineTypes.map((engine, index) => (
              <Link
                key={engine.id}
                href={`/veiculo/${engine.vehicles[0]?.slug || '#'}`}
                className={`group block w-full max-w-sm opacity-0 ${isVisible ? `animate-fade-in-up stagger-${Math.min(index + 1, 5)}` : ''}`}
              >
                <div className="bg-background-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 hover:border-primary card-premium">
                  {/* Image container with 4:3 aspect ratio */}
                  <div className="relative aspect-[4/3] bg-background-soft overflow-hidden vehicle-image-container">
                    {engine.imageUrl ? (
                      <Image
                        src={engine.imageUrl}
                        alt={engine.name}
                        fill
                        className="card-vehicle-image transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                        <span className="text-6xl">{engine.icon}</span>
                      </div>
                    )}

                    {/* Sound badge overlay */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/95 text-white backdrop-blur-md shadow-sm">
                        <Volume2 className="w-3.5 h-3.5" />
                        Som disponível
                      </span>
                    </div>

                    {/* Electric Badge */}
                    {engine.isElectric && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-md">
                        EV
                      </div>
                    )}

                    {/* Waveform overlay when playing */}
                    {isPlaying && activeEngine === engine.id && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex items-end justify-center gap-1 h-12">
                          {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                            <div
                              key={bar}
                              className="w-1.5 rounded-full bg-white animate-pulse"
                              style={{
                                height: `${20 + Math.random() * 60}%`,
                                animationDelay: `${bar * 0.1}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Brand */}
                    <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                      {engine.brand}
                    </p>

                    {/* Model Name */}
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {engine.name}
                    </h3>

                    {/* Year and description */}
                    <p className="text-sm text-foreground-secondary mb-4 line-clamp-1">
                      {engine.year || ''} {engine.description && `• ${engine.description}`}
                    </p>

                    {/* Price if available */}
                    {engine.price && (
                      <p className="text-xl font-bold text-foreground mb-4">
                        {formatPrice(engine.price)}
                      </p>
                    )}

                    {/* Play Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        togglePlay(engine)
                      }}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
                        ${engine.isElectric
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                          : 'bg-primary/10 hover:bg-primary/20 text-primary'
                        }`}
                    >
                      {isPlaying && activeEngine === engine.id ? (
                        <><VolumeX className="w-5 h-5" /> Pausar som</>
                      ) : (
                        <><Play className="w-5 h-5" /> {engine.isElectric ? 'Ouvir ambiente' : 'Ouvir o ronco'}</>
                      )}
                    </button>

                    {/* View vehicle link */}
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-foreground-secondary group-hover:text-primary transition-colors">
                      Ver detalhes do veículo <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile audio hint */}
        <p className="text-center text-xs text-foreground-secondary mt-6 md:hidden">
          🔊 Toque para ouvir
        </p>
      </Container>
    </section>
  )
}

