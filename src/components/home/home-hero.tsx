'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Vehicle } from '@/types'

interface HomeHeroProps {
  /**
   * Top vehicles to rotate as background. The component cycles through them
   * automatically (8s each, fade transition). When empty, falls back to a
   * static gradient — no broken layout.
   */
  vehicles?: Vehicle[]
}

const ROTATION_INTERVAL_MS = 9000

/**
 * Manifesto headline rotation — Attra é a MOLDURA, não o quadro.
 * Em vez de mostrar marca+modelo grande (que compete com a marca do carro
 * vendido), o headline é a posição editorial da Attra. As frases curam.
 * Pode ser trocado/expandido depois.
 */
const MANIFESTO_LINES = [
  'Selecionados,\nnão listados.',
  'Curadoria.\nNão estoque.',
  'O endereço\ndos raros.',
] as const

const CHAMPAGNE = '#B8A47C'

export function HomeHero({ vehicles = [] }: HomeHeroProps) {
  const slides = vehicles.filter(v => v.photos?.[0]).slice(0, 3)
  const [activeIndex, setActiveIndex] = useState(0)
  const [restartTick, setRestartTick] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let intervalId: ReturnType<typeof setInterval> | undefined
    const start = () => {
      if (mq.matches) return
      intervalId = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % slides.length)
      }, ROTATION_INTERVAL_MS)
    }
    const stop = () => {
      if (intervalId) clearInterval(intervalId)
      intervalId = undefined
    }
    const onChange = () => { stop(); start() }
    start()
    mq.addEventListener('change', onChange)
    return () => {
      stop()
      mq.removeEventListener('change', onChange)
    }
  }, [slides.length, restartTick])

  const safeIndex = slides.length > 0 ? activeIndex % slides.length : 0
  const activeVehicle = slides[safeIndex] ?? null
  const manifestoLine = MANIFESTO_LINES[safeIndex % MANIFESTO_LINES.length]

  const handleSelectSlide = (i: number) => {
    setActiveIndex(i)
    setRestartTick(t => t + 1)
  }

  return (
    <section
      aria-label="Apresentação Attra Veículos"
      className="relative w-full h-[100svh] min-h-[640px] max-h-[920px] overflow-hidden bg-[#0A0A0A]"
    >
      {/* Background — carro como protagonista visual, sem texto sobre ele.
          Attra é a galeria; o carro é a obra. */}
      <div className="absolute inset-0">
        {slides.length > 0 ? (
          slides.map((vehicle, i) => (
            <div
              key={vehicle.id}
              className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
              style={{ opacity: i === safeIndex ? 1 : 0 }}
              aria-hidden={i !== safeIndex}
            >
              <Image
                src={vehicle.photos[0]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#000]" />
        )}

        {/* Single overlay — gradient bottom 40% pra legibilidade do texto à esquerda.
            Brief: "Gradient sutil preto translúcido na metade inferior (40% opacity)". */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Editorial copy — bottom-left aligned (Lambo Beverly Hills pattern).
          Não é centralizado: empurra o olhar pra esquerda, deixa o carro
          respirar à direita. Headline é manifesto Attra, não modelo do carro. */}
      <div className="relative z-10 flex h-full flex-col justify-end px-8 sm:px-12 lg:px-16
                      pb-28 sm:pb-32 lg:pb-36 max-w-3xl">

        {/* Geometric eyebrow — linha champagne fina + número/contagem (DNA Lamborghini) */}
        <div className="flex items-center gap-4 mb-7 sm:mb-9">
          <span
            aria-hidden
            className="block h-px w-12 sm:w-16"
            style={{ backgroundColor: CHAMPAGNE }}
          />
          <span
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] font-medium"
            style={{ color: CHAMPAGNE }}
          >
            {String(safeIndex + 1).padStart(2, '0')} / Coleção
          </span>
        </div>

        {/* Manifesto headline — serif editorial, alto contraste.
            Attra é a moldura: o headline é a posição editorial da casa,
            NÃO marca+modelo do carro (que compete com Ferrari/Lambo). */}
        <h1 className="font-editorial text-white font-light tracking-tight leading-[0.95]
                       text-[clamp(2.75rem,7.5vw,6rem)] mb-6 sm:mb-8
                       [text-shadow:_0_2px_12px_rgba(0,0,0,0.45)]">
          {manifestoLine.split('\n').map((line, i) => (
            <span key={i} className={`block ${i === 1 ? 'italic font-light' : ''}`}>
              {line}
            </span>
          ))}
        </h1>

        {/* Subhead — sans, neutro, lista das marcas + procedência */}
        <p className="text-white/85 font-light text-sm sm:text-[15px] tracking-wide
                      max-w-xl leading-relaxed mb-9 sm:mb-11
                      [text-shadow:_0_1px_6px_rgba(0,0,0,0.5)]">
          Ferrari, Porsche, Mercedes-AMG, Land Rover, BMW, Audi — selecionados em
          Uberlândia, entregues em todo o Brasil.
        </p>

        {/* CTAs — primário ghost outline + secundário link */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
          <Link
            href="/veiculos"
            className="group inline-flex items-center justify-center gap-3
                       border border-white/60 hover:border-white text-white
                       text-xs sm:text-sm font-medium tracking-[0.22em] uppercase
                       px-9 sm:px-12 py-4 rounded-none
                       hover:bg-white hover:text-black
                       transition-all duration-300"
          >
            Explorar Estoque
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/compramos-seu-carro"
            className="group inline-flex items-center text-white/80 hover:text-white
                       text-xs sm:text-sm font-light tracking-[0.18em] uppercase
                       transition-colors"
          >
            <span className="border-b border-white/30 group-hover:border-white pb-1 transition-colors">
              Consignar meu carro
            </span>
          </Link>
        </div>
      </div>

      {/* Vehicle caption — discreta, top-right. Atribuição "qual carro estou
          vendo" sem competir com o headline manifesto. Padrão galeria de arte. */}
      {activeVehicle && (
        <div className="absolute top-24 right-8 sm:top-28 sm:right-12 z-10 text-right
                        [text-shadow:_0_1px_6px_rgba(0,0,0,0.6)]">
          <p
            className="text-[10px] uppercase tracking-[0.3em] font-medium mb-1.5"
            style={{ color: CHAMPAGNE }}
          >
            Em destaque
          </p>
          <p className="text-white/90 text-sm font-light tracking-wide">
            {activeVehicle.brand} {activeVehicle.model}
          </p>
          <p className="text-white/60 text-xs font-light tracking-wide mt-0.5">
            {activeVehicle.year_model}
          </p>
        </div>
      )}

      {/* Slide progress bar — Lamborghini Beverly Hills pattern.
          Linha base + segmento ativo champagne avançando. Mais elegante
          que dots; comunica progresso de forma cinematográfica. */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 sm:bottom-12 left-8 sm:left-12 right-8 sm:right-12 z-10">
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelectSlide(i)}
                aria-label={`Ver veículo ${i + 1} de ${slides.length}`}
                aria-current={i === safeIndex}
                className="group flex-1 py-3 -my-3"
              >
                <span
                  className="block h-px transition-all duration-500"
                  style={{
                    backgroundColor: i === safeIndex ? CHAMPAGNE : 'rgba(255,255,255,0.18)',
                  }}
                />
              </button>
            ))}
            <span
              className="text-[10px] tracking-[0.25em] font-light ml-3"
              style={{ color: CHAMPAGNE }}
            >
              {String(safeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
