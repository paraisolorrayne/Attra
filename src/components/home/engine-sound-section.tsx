'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
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

  const handleEngineHover = (engineId: string) => {
    setActiveEngine(engineId)
  }

  const handleEngineLeave = () => {
    setActiveEngine(null)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

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
          // Single vehicle hero layout
          <div className="max-w-[800px] mx-auto">
            {engineTypes.map((engine) => (
              <div
                key={engine.id}
                onMouseEnter={() => handleEngineHover(engine.id)}
                onMouseLeave={handleEngineLeave}
                className={`group relative bg-background-card border border-border rounded-2xl p-6 md:p-8 cursor-pointer
                  transition-all duration-300 hover:border-primary shadow-lg hover:shadow-xl hover:shadow-primary/10
                  card-premium opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}
              >
                {/* Electric Badge */}
                {engine.isElectric && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                    EV
                  </div>
                )}

                {/* Content - Centered Column Layout */}
                <div className="flex flex-col items-center text-center">
                  {/* Engine Name - Larger */}
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {engine.name}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm md:text-base text-foreground-secondary mb-6">
                    {engine.isElectric ? 'Tecnologia silenciosa de ponta' : 'Som exclusivo de esportivo'}
                  </p>

                  {/* Waveform Animation - Larger */}
                  <div className="flex items-end justify-center gap-1 h-10 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                      <div
                        key={bar}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          engine.isElectric ? 'bg-emerald-400' : 'bg-primary'
                        } ${activeEngine === engine.id ? 'animate-pulse' : 'h-2'}`}
                        style={{
                          height: activeEngine === engine.id ? `${20 + Math.random() * 60}%` : '8px',
                          animationDelay: `${bar * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Play Button - Centered, Medium Width on Desktop, Full on Mobile */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlay(engine)
                    }}
                    className={`w-full md:w-48 flex items-center justify-center gap-2 py-3 rounded-lg text-base font-medium transition-all
                      ${engine.isElectric
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary'
                      }`}
                  >
                    {isPlaying && activeEngine === engine.id ? (
                      <><VolumeX className="w-5 h-5" /> Pausar</>
                    ) : (
                      <><Play className="w-5 h-5" /> {engine.isElectric ? 'Ambiente' : 'Ouvir ronco'}</>
                    )}
                  </button>

                  {/* Link to vehicle */}
                  <Link
                    href={`/veiculo/${engine.vehicles[0]?.slug}`}
                    className={`flex items-center gap-2 text-sm font-medium mt-4 ${
                      engine.isElectric ? 'text-emerald-400' : 'text-primary'
                    } hover:underline`}
                  >
                    Ver detalhes do veículo <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Multiple vehicles grid layout - centered
          <div className="flex flex-wrap justify-center gap-4">
            {engineTypes.map((engine, index) => (
              <div
                key={engine.id}
                onMouseEnter={() => handleEngineHover(engine.id)}
                onMouseLeave={handleEngineLeave}
                className={`group relative bg-background-card border border-border rounded-2xl p-5 cursor-pointer
                  transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10
                  card-premium opacity-0 w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(16.666%-14px)] min-w-[150px] max-w-[200px]
                  ${isVisible ? `animate-fade-in-up stagger-${Math.min(index + 1, 5)}` : ''}`}
              >
                {/* Electric Badge */}
                {engine.isElectric && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    EV
                  </div>
                )}

                {/* Icon */}
                <div className="text-3xl mb-3">{engine.icon}</div>

                {/* Engine Name */}
                <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {engine.name}
                </h3>
                <p className="text-xs text-foreground-secondary mb-3 line-clamp-2">{engine.description}</p>

                {/* Waveform Animation */}
                <div className="flex items-end justify-center gap-0.5 h-6 mb-3">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        engine.isElectric ? 'bg-emerald-400' : 'bg-primary'
                      } ${activeEngine === engine.id ? 'animate-pulse' : 'h-1.5'}`}
                      style={{
                        height: activeEngine === engine.id ? `${20 + Math.random() * 60}%` : '6px',
                        animationDelay: `${bar * 0.1}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Hover overlay with vehicles and CTA - pointer-events-none except for interactive elements */}
                {activeEngine === engine.id && (
                  <div className="absolute inset-0 bg-background-card/98 backdrop-blur-sm rounded-2xl p-5 pb-14 flex flex-col justify-start z-10 animate-fade-in pointer-events-none">
                    <div className="pointer-events-auto">
                      <p className="text-xs text-foreground-secondary mb-2">
                        {engine.isElectric ? 'Tecnologia de ponta:' : `Veículos com ${engine.name}:`}
                      </p>
                      <div className="space-y-1.5">
                        {engine.vehicles.map((v) => (
                          <Link
                            key={v.slug}
                            href={`/veiculo/${v.slug}`}
                            className="block text-sm text-foreground hover:text-primary transition-colors"
                          >
                            {v.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/estoque?marca=${engine.brand.toLowerCase()}`}
                      className={`flex items-center gap-2 text-sm font-medium mt-3 pointer-events-auto ${
                        engine.isElectric ? 'text-emerald-400' : 'text-primary'
                      }`}
                    >
                      Ver estoque desse perfil <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Play Button - always on top with z-20 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlay(engine)
                  }}
                  className={`relative z-20 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                    ${engine.isElectric
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                      : 'bg-primary/10 hover:bg-primary/20 text-primary'
                    }`}
                >
                  {isPlaying && activeEngine === engine.id ? (
                    <><VolumeX className="w-4 h-4" /> Pausar</>
                  ) : (
                    <><Play className="w-4 h-4" /> {engine.isElectric ? 'Ambiente' : 'Ouvir ronco'}</>
                  )}
                </button>
              </div>
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

